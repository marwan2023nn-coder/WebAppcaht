package cluster

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/v8/channels/app/platform"
)

func TestCluster(t *testing.T) {
	// Minimal platform service for testing
	ps := &platform.PlatformService{}

	c1 := NewCluster(ps)
	require.NotNil(t, c1)
	assert.NotEmpty(t, c1.GetClusterId())

	// Test IsLeader in single node (no memberlist started)
	assert.True(t, c1.IsLeader())

	// Test message registration
	received := false
	c1.RegisterClusterMessageHandler(model.ClusterEventPublish, func(msg *model.ClusterMessage) {
		received = true
	})

	c1.NotifyMsg([]byte(`{"event":"publish","data":"e30="}`)) // e30= is {} in base64
	assert.True(t, received)
}
