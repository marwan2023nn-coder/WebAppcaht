// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/jobs/data_retention"
	"github.com/marwan2023nn-coder/sofa/server/v8/einterfaces"
	ejobs "github.com/marwan2023nn-coder/sofa/server/v8/einterfaces/jobs"
)

func init() {
	RegisterDataRetentionInterface(func(a *App) einterfaces.DataRetentionInterface {
		return NewDataRetentionImpl(a)
	})

	RegisterJobsDataRetentionJobInterface(func(s *Server) ejobs.DataRetentionJobInterface {
		return data_retention.MakeBuilder(s.Jobs, New(ServerConnector(s.Channels())))
	})
}
