// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package einterfaces

import "github.com/marwan2023nn-coder/sofa/server/public/model"

type LicenseInterface interface {
	CanStartTrial() (bool, error)
	GetPrevTrial() (*model.License, error)
	NewSofaEntryLicense(serverId string) *model.License
}
