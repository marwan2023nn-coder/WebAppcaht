// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"testing"
	"github.com/stretchr/testify/assert"
)

func TestViewIsValid(t *testing.T) {
	t.Run("valid view", func(t *testing.T) {
		v := &View{
			Id:        NewId(),
			ChannelId: NewId(),
			CreatorId: NewId(),
			Type:      ViewTypeKanban,
			Title:     "My View",
			CreateAt:  GetMillis(),
			UpdateAt:  GetMillis(),
		}
		assert.Nil(t, v.IsValid())
	})

	t.Run("invalid id", func(t *testing.T) {
		v := &View{
			Id:        "invalid",
			ChannelId: NewId(),
			CreatorId: NewId(),
			Type:      ViewTypeKanban,
			Title:     "My View",
			CreateAt:  GetMillis(),
			UpdateAt:  GetMillis(),
		}
		assert.NotNil(t, v.IsValid())
	})

	t.Run("empty title", func(t *testing.T) {
		v := &View{
			Id:        NewId(),
			ChannelId: NewId(),
			CreatorId: NewId(),
			Type:      ViewTypeKanban,
			Title:     "",
			CreateAt:  GetMillis(),
			UpdateAt:  GetMillis(),
		}
		assert.NotNil(t, v.IsValid())
	})

	t.Run("invalid type", func(t *testing.T) {
		v := &View{
			Id:        NewId(),
			ChannelId: NewId(),
			CreatorId: NewId(),
			Type:      "invalid",
			Title:     "My View",
			CreateAt:  GetMillis(),
			UpdateAt:  GetMillis(),
		}
		assert.NotNil(t, v.IsValid())
	})
}
