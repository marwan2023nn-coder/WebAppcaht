// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package last_accessible_file

import (
	"strconv"
	"time"

	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/mlog"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/jobs"
)

const schedFreq = 2 * time.Hour

func MakeScheduler(jobServer *jobs.JobServer, license *model.License) *jobs.PeriodicScheduler {
	isEnabled := func(cfg *model.Config) bool {
		enabled := license.IsCloud()
		mlog.Debug("Scheduler: isEnabled: "+strconv.FormatBool(enabled), mlog.String("scheduler", model.JobTypeLastAccessibleFile))
		return enabled
	}
	return jobs.NewPeriodicScheduler(jobServer, model.JobTypeLastAccessibleFile, schedFreq, isEnabled)
}
