// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package einterfaces

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/request"
)

type AccountMigrationInterface interface {
	MigrateToLdap(rctx request.CTX, fromAuthService string, foreignUserFieldNameToMatch string, force bool, dryRun bool) *model.AppError
	MigrateToSaml(rctx request.CTX, fromAuthService string, usersMap map[string]string, auto bool, dryRun bool) *model.AppError
}
