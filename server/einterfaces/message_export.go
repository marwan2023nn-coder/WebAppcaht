// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package einterfaces

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/request"
)

type MessageExportInterface interface {
	StartSynchronizeJob(rctx request.CTX, exportFromTimestamp int64) (*model.Job, *model.AppError)
}
