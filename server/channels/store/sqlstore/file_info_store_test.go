// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package sqlstore

import (
	"testing"

	"github.com/marwan2023nn-coder/sofa/server/v8/channels/store/searchtest"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/store/storetest"
)

func TestFileInfoStore(t *testing.T) {
	StoreTestWithSqlStore(t, storetest.TestFileInfoStore)
}

func TestSearchFileInfoStore(t *testing.T) {
	StoreTestWithSearchTestEngine(t, searchtest.TestSearchFileInfoStore)
}
