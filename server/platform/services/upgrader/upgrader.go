// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

//go:build !linux

package upgrader

import (
	"github.com/marwan2023nn-coder/sofa/server/public/shared/httpservice"
)

func CanIUpgradeToE0() error {
	return &InvalidArch{}
}

func UpgradeToE0(httpService httpservice.HTTPService) error {
	return &InvalidArch{}
}

func UpgradeToE0Status() (int64, error) {
	return 0, &InvalidArch{}
}
