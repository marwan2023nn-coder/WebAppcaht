// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package einterfaces

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/request"
)

type NotificationInterface interface {
	GetNotificationMessage(rctx request.CTX, ack *model.PushNotificationAck, userID string) (*model.PushNotification, *model.AppError)
	CheckLicense() *model.AppError
}
