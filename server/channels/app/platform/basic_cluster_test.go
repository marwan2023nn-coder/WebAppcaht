// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package platform

import (
	"testing"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/v8/channels/store/storetest/mocks"
	"github.com/mattermost/mattermost/server/v8/config"
)

func TestBasicCluster(t *testing.T) {
	mockStore := &mocks.Store{}
	mockClusterDiscoveryStore := &mocks.ClusterDiscoveryStore{}
	mockStore.On("ClusterDiscovery").Return(mockClusterDiscoveryStore)
	mockStore.On("GetDBSchemaVersion").Return(1, nil)

	configStore := config.NewTestMemoryStore()
	cfg := configStore.Get()
	*cfg.ClusterSettings.Enable = true
	*cfg.ClusterSettings.ClusterName = "test_cluster"
	configStore.Set(cfg)

	ps := &PlatformService{
		Store:       mockStore,
		configStore: configStore,
	}
	ps.clientConfigHash.Store("hash")

	bc := NewBasicCluster(ps).(*BasicCluster)

	t.Run("StartInterNodeCommunication", func(t *testing.T) {
		mockClusterDiscoveryStore.On("Cleanup").Return(nil)
		mockClusterDiscoveryStore.On("Exists", mock.Anything).Return(false, nil)
		mockClusterDiscoveryStore.On("Save", mock.Anything).Return(nil)

		bc.StartInterNodeCommunication()
		require.NotNil(t, bc.discoveryService)
		mockClusterDiscoveryStore.AssertCalled(t, "Save", mock.Anything)
	})

	t.Run("GetClusterInfos", func(t *testing.T) {
		mockClusterDiscoveryStore.On("GetAll", model.CDSTypeApp, "test_cluster").Return([]*model.ClusterDiscovery{
			{Id: "node1", Version: "1.0.0", ClusterName: "test_cluster", Hostname: "host1"},
		}, nil)

		infos, err := bc.GetClusterInfos()
		require.NoError(t, err)
		require.Len(t, infos, 1)
		require.Equal(t, "node1", infos[0].Id)
	})

	t.Run("GetMyClusterInfo", func(t *testing.T) {
		info := bc.GetMyClusterInfo()
		require.NotNil(t, info)
		require.Equal(t, bc.discoveryService.Id, info.Id)
	})

	t.Run("StopInterNodeCommunication", func(t *testing.T) {
		mockClusterDiscoveryStore.On("Delete", mock.Anything).Return(true, nil)
		bc.StopInterNodeCommunication()
		require.Nil(t, bc.discoveryService)
		// mockClusterDiscoveryStore.AssertCalled(t, "Delete", mock.Anything)
	})
}
