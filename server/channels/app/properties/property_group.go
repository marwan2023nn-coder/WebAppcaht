// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package properties

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
)

func (ps *PropertyService) RegisterPropertyGroup(name string) (*model.PropertyGroup, error) {
	return ps.groupStore.Register(name)
}

func (ps *PropertyService) GetPropertyGroup(name string) (*model.PropertyGroup, error) {
	return ps.groupStore.Get(name)
}
