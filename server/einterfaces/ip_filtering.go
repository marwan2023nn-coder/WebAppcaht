// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package einterfaces

import "github.com/marwan2023nn-coder/sofa/server/public/model"

type IPFilteringInterface interface {
	ApplyIPFilters(allowedIPRanges *model.AllowedIPRanges) (*model.AllowedIPRanges, error)
	GetIPFilters() (*model.AllowedIPRanges, error)
}
