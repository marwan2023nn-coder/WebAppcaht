// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.enterprise for license information.

package opensearch

import (
	"testing"

	"github.com/opensearch-project/opensearch-go/v4/opensearchapi"
	"github.com/stretchr/testify/require"

	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/request"
	"github.com/marwan2023nn-coder/sofa/server/v8/platform/shared/filestore"
	"github.com/marwan2023nn-coder/sofa/server/v8/platform/shared/filestore/mocks"
)

func createTestClient(t *testing.T, rctx request.CTX, cfg *model.Config, fileStore filestore.FileBackend) *opensearchapi.Client {
	t.Helper()

	if fileStore == nil {
		fileStore = &mocks.FileBackend{}
	}

	client, err := createClient(rctx.Logger(), cfg, fileStore, true)
	require.Nil(t, err)
	return client
}
