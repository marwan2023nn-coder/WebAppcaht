// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package cluster

import (
	"encoding/json"
	"fmt"
	"sort"
	"sync"
	"time"

	"github.com/hashicorp/memberlist"
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
	"github.com/mattermost/mattermost/server/public/shared/request"
	"github.com/mattermost/mattermost/server/v8/channels/app/platform"
	"github.com/mattermost/mattermost/server/v8/einterfaces"
)

type Cluster struct {
	ps           *platform.PlatformService
	memberlist   *memberlist.Memberlist
	broadcasts   *memberlist.TransmitLimitedQueue
	handlers     map[model.ClusterEvent]einterfaces.ClusterMessageHandler
	handlersLock sync.RWMutex
	id           string
	stopOnce     sync.Once
	stopChan     chan struct{}
	discovery    *platform.ClusterDiscoveryService
}

func NewCluster(ps *platform.PlatformService) *Cluster {
	return &Cluster{
		ps:       ps,
		handlers: make(map[model.ClusterEvent]einterfaces.ClusterMessageHandler),
		id:       model.NewId(),
		stopChan: make(chan struct{}),
	}
}

// StartInterNodeCommunication initializes the memberlist and starts gossip.
func (c *Cluster) StartInterNodeCommunication() {
	config := memberlist.DefaultLocalConfig()
	config.Name = c.id

	port := 8074
	if c.ps.Config() != nil && c.ps.Config().ClusterSettings.GossipPort != nil {
		port = int(*c.ps.Config().ClusterSettings.GossipPort)
	}
	config.BindPort = port
	config.Delegate = c
	config.Events = c

	ml, err := memberlist.Create(config)
	if err != nil {
		c.ps.Logger().Error("Failed to create memberlist", mlog.Err(err))
		return
	}
	c.memberlist = ml
	c.broadcasts = &memberlist.TransmitLimitedQueue{
		NumNodes:       func() int { return ml.NumMembers() },
		RetransmitMult: 3,
	}

	c.ps.Logger().Info("Cluster communication started", mlog.String("node_id", c.id), mlog.Int("port", config.BindPort))

	// Self-registration logic
	c.discovery = c.ps.NewClusterDiscoveryService()
	c.discovery.Id = c.id
	c.discovery.Type = model.CDSTypeApp
	c.discovery.ClusterName = *c.ps.Config().ClusterSettings.ClusterName
	c.discovery.GossipPort = int32(config.BindPort)
	c.discovery.AutoFillIPAddress("", "") // Logic to find own IP
	c.discovery.Start()

	go c.discoveryLoop()
}

func (c *Cluster) discoveryLoop() {
	ticker := time.NewTicker(time.Second * 15)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			c.discover()
		case <-c.stopChan:
			return
		}
	}
}

func (c *Cluster) discover() {
	if c.ps.Store == nil {
		return
	}

	nodes, err := c.ps.Store.ClusterDiscovery().GetAll(model.CDSTypeApp, *c.ps.Config().ClusterSettings.ClusterName)
	if err != nil {
		c.ps.Logger().Warn("Cluster discovery: failed to get nodes from DB", mlog.Err(err))
		return
	}

	for _, node := range nodes {
		if node.Id == c.id {
			continue
		}

		alreadyKnown := false
		for _, m := range c.memberlist.Members() {
			if m.Name == node.Id {
				alreadyKnown = true
				break
			}
		}

		if !alreadyKnown {
			addr := fmt.Sprintf("%s:%d", node.Hostname, node.GossipPort)
			c.ps.Logger().Debug("Cluster discovery: attempting to join node", mlog.String("node_id", node.Id), mlog.String("addr", addr))
			_, err := c.memberlist.Join([]string{addr})
			if err != nil {
				c.ps.Logger().Warn("Cluster discovery: failed to join node", mlog.String("addr", addr), mlog.Err(err))
			}
		}
	}
}

// StopInterNodeCommunication shuts down the memberlist.
func (c *Cluster) StopInterNodeCommunication() {
	c.stopOnce.Do(func() {
		close(c.stopChan)
		if c.discovery != nil {
			c.discovery.Stop()
		}
		if c.memberlist != nil {
			err := c.memberlist.Leave(time.Second * 5)
			if err != nil {
				c.ps.Logger().Warn("Error leaving cluster", mlog.Err(err))
			}
			err = c.memberlist.Shutdown()
			if err != nil {
				c.ps.Logger().Warn("Error shutting down memberlist", mlog.Err(err))
			}
		}
	})
}

// memberlist.Delegate implementation

func (c *Cluster) NodeMeta(limit int) []byte {
	return []byte(c.id)
}

func (c *Cluster) NotifyMsg(buf []byte) {
	var msg model.ClusterMessage
	if err := json.Unmarshal(buf, &msg); err != nil {
		c.ps.Logger().Warn("Failed to decode cluster message", mlog.Err(err))
		return
	}

	c.handlersLock.RLock()
	handler, ok := c.handlers[msg.Event]
	c.handlersLock.RUnlock()

	if ok {
		handler(&msg)
	}
}

func (c *Cluster) GetBroadcasts(overhead, limit int) [][]byte {
	return c.broadcasts.GetBroadcasts(overhead, limit)
}

func (c *Cluster) LocalState(join bool) []byte {
	return nil
}

func (c *Cluster) MergeRemoteState(buf []byte, join bool) {}

// memberlist.EventDelegate implementation

func (c *Cluster) NotifyJoin(node *memberlist.Node) {
	c.ps.Logger().Info("Node joined cluster", mlog.String("node_name", node.Name), mlog.String("node_addr", node.Addr.String()))
}

func (c *Cluster) NotifyLeave(node *memberlist.Node) {
	c.ps.Logger().Info("Node left cluster", mlog.String("node_name", node.Name))
}

func (c *Cluster) NotifyUpdate(node *memberlist.Node) {}

// ClusterInterface methods implementation

func (c *Cluster) RegisterClusterMessageHandler(event model.ClusterEvent, crm einterfaces.ClusterMessageHandler) {
	c.handlersLock.Lock()
	defer c.handlersLock.Unlock()
	c.handlers[event] = crm
}

func (c *Cluster) GetClusterId() string {
	return c.id
}

func (c *Cluster) IsLeader() bool {
	if c.memberlist == nil {
		return true
	}

	members := c.memberlist.Members()
	if len(members) == 0 {
		return true
	}

	sort.Slice(members, func(i, j int) bool {
		return members[i].Name < members[j].Name
	})

	return members[0].Name == c.id
}

func (c *Cluster) HealthScore() int {
	if c.memberlist == nil {
		return 0
	}
	return 0
}

func (c *Cluster) GetMyClusterInfo() *model.ClusterInfo {
	if c.memberlist == nil {
		return nil
	}
	return &model.ClusterInfo{
		Id:         c.id,
		IPAddress:  c.memberlist.LocalNode().Addr.String(),
		Hostname:   c.memberlist.LocalNode().Name,
	}
}

func (c *Cluster) GetClusterInfos() ([]*model.ClusterInfo, error) {
	if c.memberlist == nil {
		return nil, nil
	}
	members := c.memberlist.Members()
	infos := make([]*model.ClusterInfo, len(members))
	for i, m := range members {
		infos[i] = &model.ClusterInfo{
			Id:       m.Name,
			IPAddress:  m.Addr.String(),
			Hostname: m.Name,
		}
	}
	return infos, nil
}

type clusterBroadcast struct {
	msg []byte
}

func (b *clusterBroadcast) Invalidates(other memberlist.Broadcast) bool {
	return false
}

func (b *clusterBroadcast) Message() []byte {
	return b.msg
}

func (b *clusterBroadcast) Finished() {}

func (c *Cluster) SendClusterMessage(msg *model.ClusterMessage) {
	if c.memberlist == nil {
		return
	}

	buf, err := json.Marshal(msg)
	if err != nil {
		c.ps.Logger().Warn("Failed to encode cluster message", mlog.Err(err))
		return
	}

	c.broadcasts.QueueBroadcast(&clusterBroadcast{msg: buf})
}

func (c *Cluster) SendClusterMessageToNode(nodeID string, msg *model.ClusterMessage) error {
	if c.memberlist == nil {
		return fmt.Errorf("cluster not started")
	}

	var target *memberlist.Node
	for _, m := range c.memberlist.Members() {
		if m.Name == nodeID {
			target = m
			break
		}
	}

	if target == nil {
		return fmt.Errorf("node %s not found", nodeID)
	}

	buf, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	return c.memberlist.SendReliable(target, buf)
}

func (c *Cluster) GetClusterStats(rctx request.CTX) ([]*model.ClusterStats, *model.AppError) {
	members := c.memberlist.Members()
	stats := make([]*model.ClusterStats, 0, len(members))
	for _, m := range members {
		if m.Name == c.id {
			stats = append(stats, &model.ClusterStats{
				Id:                        c.id,
				TotalWebsocketConnections: c.ps.TotalWebsocketConnections(),
				TotalReadDbConnections:    c.ps.Store.TotalReadDbConnections(),
				TotalMasterDbConnections:  c.ps.Store.TotalMasterDbConnections(),
			})
		} else {
			// For remote nodes, we'd need an RPC. Returning minimal info for now.
			stats = append(stats, &model.ClusterStats{
				Id: m.Name,
			})
		}
	}
	return stats, nil
}

func (c *Cluster) GetLogs(rctx request.CTX, page, perPage int) ([]string, *model.AppError) {
	return []string{}, nil
}

func (c *Cluster) QueryLogs(rctx request.CTX, page, perPage int) (map[string][]string, *model.AppError) {
	return make(map[string][]string), nil
}

func (c *Cluster) GenerateSupportPacket(rctx request.CTX, options *model.SupportPacketOptions) (map[string][]model.FileData, error) {
	return make(map[string][]model.FileData), nil
}

func (c *Cluster) GetPluginStatuses() (model.PluginStatuses, *model.AppError) {
	return c.ps.GetPluginStatuses()
}

func (c *Cluster) ConfigChanged(previousConfig *model.Config, newConfig *model.Config, sendToOtherServer bool) *model.AppError {
	if sendToOtherServer {
		c.SendClusterMessage(&model.ClusterMessage{
			Event:            model.ClusterEventInvalidateAllCaches,
			SendType:         model.ClusterSendReliable,
			WaitForAllToSend: true,
		})
	}
	return nil
}

func (c *Cluster) WebConnCountForUser(userID string) (int, *model.AppError) {
	return 0, nil
}

func (c *Cluster) GetWSQueues(userID, connectionID string, seqNum int64) (map[string]*model.WSQueues, error) {
	return make(map[string]*model.WSQueues), nil
}
