// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.enterprise for license information.

package elasticsearch

import (
	"testing"

	"github.com/marwan2023nn-coder/sofa/server/v8/channels/api4"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/testlib"
)

var mainHelper *testlib.MainHelper

func TestMain(m *testing.M) {
	mainHelper = testlib.NewMainHelper()
	defer mainHelper.Close()
	api4.SetMainHelper(mainHelper)

	mainHelper.Main(m)
}
