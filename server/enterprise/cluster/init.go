// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package cluster

import (
	"github.com/mattermost/mattermost/server/v8/channels/app/platform"
	"github.com/mattermost/mattermost/server/v8/einterfaces"
)

func init() {
	platform.RegisterClusterInterface(func(ps *platform.PlatformService) einterfaces.ClusterInterface {
		return NewCluster(ps)
	})
}
