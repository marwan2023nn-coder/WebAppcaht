// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"context"
	"testing"
	"github.com/stretchr/testify/require"
)

func TestPropertyAccessControl_CallerID(t *testing.T) {
	t.Run("no caller ID in context", func(t *testing.T) {
		ctx := context.Background()
		id, ok := CallerIDFromContext(ctx)
		require.False(t, ok)
		require.Empty(t, id)
	})

	t.Run("with caller ID in context", func(t *testing.T) {
		expectedID := "user-123"
		ctx := WithCallerID(context.Background(), expectedID)
		id, ok := CallerIDFromContext(ctx)
		require.True(t, ok)
		require.Equal(t, expectedID, id)
	})
}
