// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package sqlstore

import (
	"testing"

	"github.com/marwan2023nn-coder/sofa/server/v8/channels/store/storetest"
)

func TestSchemeStore(t *testing.T) {
	StoreTest(t, storetest.TestSchemeStore)
}
