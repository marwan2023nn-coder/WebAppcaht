// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package searchlayer_test

import (
	"os"
	"sync"
	"testing"

	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/mlog"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/store/searchlayer"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/store/sqlstore"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/store/storetest"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/testlib"
	"github.com/marwan2023nn-coder/sofa/server/v8/platform/services/searchengine"
	"github.com/stretchr/testify/require"
)

// Test to verify race condition on UpdateConfig. The test must run with -race flag in order to verify
// that there is no race. Ref: (#MM-30868)
func TestUpdateConfigRace(t *testing.T) {
	logger := mlog.CreateTestLogger(t)

	driverName := os.Getenv("MM_SQLSETTINGS_DRIVERNAME")
	if driverName == "" {
		driverName = model.DatabaseDriverPostgres
	}
	settings := storetest.MakeSqlSettings(driverName)
	store, err := sqlstore.New(*settings, logger, nil, sqlstore.DisableMorphLogging())
	require.NoError(t, err)

	cfg := &model.Config{}
	cfg.SetDefaults()
	cfg.ClusterSettings.GossipPort = model.NewPointer(9999)
	searchEngine := searchengine.NewBroker(cfg)
	layer := searchlayer.NewSearchLayer(&testlib.TestStore{Store: store}, searchEngine, cfg)
	var wg sync.WaitGroup

	wg.Add(5)
	for range 5 {
		go func() {
			defer wg.Done()
			layer.UpdateConfig(cfg.Clone())
		}()
	}

	wg.Wait()
}
