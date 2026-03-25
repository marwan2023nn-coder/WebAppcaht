// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package platform

import (
	"fmt"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/request"
	"github.com/mattermost/mattermost/server/v8/einterfaces"
)

type BasicCluster struct {
	platform *PlatformService
	discoveryService *ClusterDiscoveryService
}

func NewBasicCluster(ps *PlatformService) einterfaces.ClusterInterface {
	return &BasicCluster{
		platform: ps,
	}
}

func (bc *BasicCluster) StartInterNodeCommunication() {
	if bc.discoveryService != nil {
		return
	}

	ds := bc.platform.NewClusterDiscoveryService()
	ds.Type = model.CDSTypeApp
	ds.ClusterName = *bc.platform.Config().ClusterSettings.ClusterName
	ds.Hostname = *bc.platform.Config().ClusterSettings.OverrideHostname
	ds.AutoFillHostname()
	ds.AutoFillIPAddress(*bc.platform.Config().ClusterSettings.NetworkInterface, *bc.platform.Config().ClusterSettings.AdvertiseAddress)
	ds.GossipPort = int32(*bc.platform.Config().ClusterSettings.GossipPort)

	// Set new fields
	ds.Version = model.CurrentVersion
	schemaVer, _ := bc.platform.Store.GetDBSchemaVersion()
	ds.SchemaVersion = fmt.Sprintf("%d", schemaVer)
	ds.ConfigHash = bc.platform.ClientConfigHash()
	ds.IPAddress = ds.Hostname // Hostname already contains IP if configured or detected

	bc.discoveryService = ds
	bc.discoveryService.Start()
}

func (bc *BasicCluster) StopInterNodeCommunication() {
	if bc.discoveryService != nil {
		bc.discoveryService.Stop()
		bc.discoveryService = nil
	}
}

func (bc *BasicCluster) RegisterClusterMessageHandler(event model.ClusterEvent, crm einterfaces.ClusterMessageHandler) {
	// Not implemented for BasicCluster
}

func (bc *BasicCluster) GetClusterId() string {
	return "basic_cluster"
}

func (bc *BasicCluster) IsLeader() bool {
	if bc.discoveryService == nil {
		return true
	}

	infos, err := bc.GetClusterInfos()
	if err != nil || len(infos) == 0 {
		return true
	}

	// Simplest leadership: the node with the oldest CreateAt is the leader.
	leader := infos[0]
	for _, info := range infos {
		if info.CreateAt < leader.CreateAt {
			leader = info
		}
	}

	return leader.Id == bc.discoveryService.Id
}

func (bc *BasicCluster) HealthScore() int {
	return 0
}

func (bc *BasicCluster) GetMyClusterInfo() *model.ClusterInfo {
	if bc.discoveryService == nil {
		return nil
	}

	return &model.ClusterInfo{
		Id: bc.discoveryService.Id,
		Version: bc.discoveryService.Version,
		SchemaVersion: bc.discoveryService.SchemaVersion,
		ConfigHash: bc.discoveryService.ConfigHash,
		IPAddress: bc.discoveryService.IPAddress,
		Hostname: bc.discoveryService.Hostname,
		CreateAt: bc.discoveryService.CreateAt,
	}
}

func (bc *BasicCluster) GetClusterInfos() ([]*model.ClusterInfo, error) {
	infos, err := bc.platform.Store.ClusterDiscovery().GetAll(model.CDSTypeApp, *bc.platform.Config().ClusterSettings.ClusterName)
	if err != nil {
		return nil, err
	}

	result := make([]*model.ClusterInfo, len(infos))
	for i, info := range infos {
		result[i] = &model.ClusterInfo{
			Id: info.Id,
			Version: info.Version,
			SchemaVersion: info.SchemaVersion,
			ConfigHash: info.ConfigHash,
			IPAddress: info.IPAddress,
			Hostname: info.Hostname,
			CreateAt: info.CreateAt,
		}
	}

	return result, nil
}

func (bc *BasicCluster) SendClusterMessage(msg *model.ClusterMessage) {
	// Not implemented for BasicCluster
}

func (bc *BasicCluster) SendClusterMessageToNode(nodeID string, msg *model.ClusterMessage) error {
	return nil
}

func (bc *BasicCluster) NotifyMsg(buf []byte) {
}

func (bc *BasicCluster) GetClusterStats(rctx request.CTX) ([]*model.ClusterStats, *model.AppError) {
	return nil, nil
}

func (bc *BasicCluster) GetLogs(rctx request.CTX, page, perPage int) ([]string, *model.AppError) {
	return nil, nil
}

func (bc *BasicCluster) QueryLogs(rctx request.CTX, page, perPage int) (map[string][]string, *model.AppError) {
	return nil, nil
}

func (bc *BasicCluster) GenerateSupportPacket(rctx request.CTX, options *model.SupportPacketOptions) (map[string][]model.FileData, error) {
	return nil, nil
}

func (bc *BasicCluster) GetPluginStatuses() (model.PluginStatuses, *model.AppError) {
	return bc.platform.GetPluginStatuses()
}

func (bc *BasicCluster) ConfigChanged(previousConfig *model.Config, newConfig *model.Config, sendToOtherServer bool) *model.AppError {
	return nil
}

func (bc *BasicCluster) WebConnCountForUser(userID string) (int, *model.AppError) {
	return 0, nil
}

func (bc *BasicCluster) GetWSQueues(userID, connectionID string, seqNum int64) (map[string]*model.WSQueues, error) {
	return nil, nil
}
