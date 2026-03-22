// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/mlog"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/request"
)

// complianceStub is a no-op implementation of einterfaces.ComplianceInterface.
// It allows the system to function without the enterprise compliance module
// by providing empty implementations for its background and background jobs.
type complianceStub struct{}

func (s *complianceStub) StartComplianceDailyJob() {}

func (s *complianceStub) RunComplianceJob(rctx request.CTX, job *model.Compliance) *model.AppError {
	rctx.Logger().Debug("Compliance stub: ignoring RunComplianceJob request", mlog.String("job_id", job.Id))
	return nil
}
