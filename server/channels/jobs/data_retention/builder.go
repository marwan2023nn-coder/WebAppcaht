// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package data_retention

import (
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/v8/channels/jobs"
	ejobs "github.com/mattermost/mattermost/server/v8/einterfaces/jobs"
)

type DataRetentionJobBuilder struct {
	jobServer *jobs.JobServer
	app       AppIface
}

func MakeBuilder(jobServer *jobs.JobServer, app AppIface) *DataRetentionJobBuilder {
	return &DataRetentionJobBuilder{
		jobServer: jobServer,
		app:       app,
	}
}

func (b *DataRetentionJobBuilder) MakeWorker() model.Worker {
	return MakeWorker(b.jobServer, b.app)
}

func (b *DataRetentionJobBuilder) MakeScheduler() ejobs.Scheduler {
	return MakeScheduler(b.jobServer)
}
