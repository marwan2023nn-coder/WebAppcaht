// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package last_accessible_file

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/mlog"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/jobs"
)

type AppIface interface {
	ComputeLastAccessibleFileTime() error
}

func MakeWorker(jobServer *jobs.JobServer, license *model.License, app AppIface) *jobs.SimpleWorker {
	const workerName = "LastAccessibleFile"

	isEnabled := func(_ *model.Config) bool {
		return license.IsCloud()
	}
	execute := func(logger mlog.LoggerIFace, job *model.Job) error {
		defer jobServer.HandleJobPanic(logger, job)

		return app.ComputeLastAccessibleFileTime()
	}
	worker := jobs.NewSimpleWorker(workerName, jobServer, execute, isEnabled)
	return worker
}
