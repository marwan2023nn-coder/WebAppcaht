// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"encoding/json"

	"github.com/marwan2023nn-coder/sofa/server/public/model"
)

func (ch *Channels) notifyClusterPluginEvent(event model.ClusterEvent, data model.PluginEventData) {
	buf, _ := json.Marshal(data)
	if ch.srv.platform.Cluster() != nil {
		ch.srv.platform.Cluster().SendClusterMessage(&model.ClusterMessage{
			Event:            event,
			SendType:         model.ClusterSendReliable,
			WaitForAllToSend: true,
			Data:             buf,
		})
	}
}
