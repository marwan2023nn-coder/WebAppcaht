// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/request"
)

// messageExportStub is a no-op implementation of einterfaces.MessageExportInterface.
type messageExportStub struct{}

func (s *messageExportStub) StartSynchronizeJob(rctx request.CTX, exportFromTimestamp int64) (*model.Job, *model.AppError) {
	rctx.Logger().Debug("MessageExport stub: ignoring StartSynchronizeJob request")
	return nil, nil
}
