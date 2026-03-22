// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package cleanup_desktop_tokens

import (
	"time"

	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/mlog"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/jobs"
)

const jobName = "CleanupDesktopTokens"
const maxAge = 5 * time.Minute

func MakeWorker(jobServer *jobs.JobServer) *jobs.SimpleWorker {
	isEnabled := func(cfg *model.Config) bool {
		return true
	}
	execute := func(logger mlog.LoggerIFace, job *model.Job) error {
		defer jobServer.HandleJobPanic(logger, job)

		return jobServer.Store.DesktopTokens().DeleteOlderThan(time.Now().Add(-maxAge).Unix())
	}
	worker := jobs.NewSimpleWorker(jobName, jobServer, execute, isEnabled)
	return worker
}
