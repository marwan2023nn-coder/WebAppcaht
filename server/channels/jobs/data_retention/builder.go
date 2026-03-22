// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package data_retention

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/jobs"
	ejobs "github.com/marwan2023nn-coder/sofa/server/v8/einterfaces/jobs"
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
