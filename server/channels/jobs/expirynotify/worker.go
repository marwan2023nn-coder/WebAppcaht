// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package expirynotify

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/mlog"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/jobs"
)

func MakeWorker(jobServer *jobs.JobServer, notifySessionsExpired func() error) *jobs.SimpleWorker {
	const workerName = "ExpiryNotify"

	isEnabled := func(cfg *model.Config) bool {
		return *cfg.ServiceSettings.ExtendSessionLengthWithActivity
	}
	execute := func(logger mlog.LoggerIFace, job *model.Job) error {
		defer jobServer.HandleJobPanic(logger, job)

		return notifySessionsExpired()
	}
	return jobs.NewSimpleWorker(workerName, jobServer, execute, isEnabled)
}
