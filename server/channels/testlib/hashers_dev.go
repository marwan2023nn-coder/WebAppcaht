// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

//go:build !production

package testlib

import "github.com/marwan2023nn-coder/sofa/server/v8/channels/app/password/hashers"

func setupFastTestHasher() {
	hashers.SetTestHasher(hashers.FastTestHasher())
}
