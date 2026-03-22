// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package data_retention

import (
	"time"

	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/request"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/jobs"
)

type Scheduler struct {
	jobServer *jobs.JobServer
}

func MakeScheduler(jobServer *jobs.JobServer) *Scheduler {
	return &Scheduler{jobServer: jobServer}
}

func (s *Scheduler) Enabled(cfg *model.Config) bool {
	return *cfg.DataRetentionSettings.EnableMessageDeletion || *cfg.DataRetentionSettings.EnableFileDeletion
}

func (s *Scheduler) NextScheduleTime(cfg *model.Config, now time.Time, pendingJobs bool, lastSuccessfulJob *model.Job) *time.Time {
	if pendingJobs {
		return nil
	}

	// Default to running once a day at a quiet time (e.g., 2 AM)
	// In a real enterprise version, this would be configurable.
	nextTime := time.Date(now.Year(), now.Month(), now.Day(), 2, 0, 0, 0, now.Location())
	if now.After(nextTime) {
		nextTime = nextTime.AddDate(0, 0, 1)
	}

	return &nextTime
}

func (s *Scheduler) ScheduleJob(rctx request.CTX, cfg *model.Config, pendingJobs bool, lastSuccessfulJob *model.Job) (*model.Job, *model.AppError) {
	return s.jobServer.CreateJob(rctx, model.JobTypeDataRetention, nil)
}
