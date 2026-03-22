// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package hosted_purchase_screening

import (
	"time"

	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/jobs"
)

const schedFreq = 24 * time.Hour

func MakeScheduler(jobServer *jobs.JobServer, license *model.License) *jobs.PeriodicScheduler {
	isEnabled := func(cfg *model.Config) bool {
		return model.BuildEnterpriseReady == "true" && license == nil
	}
	return jobs.NewPeriodicScheduler(jobServer, model.JobTypeHostedPurchaseScreening, schedFreq, isEnabled)
}
