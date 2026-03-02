// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/v8/channels/store"
)

func TestBurnOnReadMedia(t *testing.T) {
	os.Setenv("MM_FEATUREFLAGS_BURNONREAD", "true")
	defer os.Unsetenv("MM_FEATUREFLAGS_BURNONREAD")

	th := Setup(t).InitBasic(t)

	enableBoRFeature(th)

	user1 := th.BasicUser
	user2 := th.BasicUser2
	channel := th.BasicChannel

	t.Run("should correctly store and reveal attachments for burn-on-read post", func(t *testing.T) {
		// Create file attachments
		fileBytes := []byte("test content")
		fileInfo1, appErr := th.App.UploadFile(th.Context, fileBytes, channel.Id, "test1.jpg")
		require.Nil(t, appErr)
		fileInfo2, appErr := th.App.UploadFile(th.Context, fileBytes, channel.Id, "test2.mp4")
		require.Nil(t, appErr)

		post := &model.Post{
			ChannelId: channel.Id,
			UserId:    user1.Id,
			Message:   "Check this out",
			Type:      model.PostTypeBurnOnRead,
			FileIds:   model.StringArray{fileInfo1.Id, fileInfo2.Id},
		}
		post.AddProp(model.PostPropsExpireAt, model.GetMillis()+int64(model.DefaultExpirySeconds*1000))

		createdPost, _, appErr := th.App.CreatePost(th.Context, post, channel, model.CreatePostFlags{SetOnline: true})
		require.Nil(t, appErr)
		require.Equal(t, model.PostTypeBurnOnRead, createdPost.Type)

		// Verify created post has empty message and file IDs (typical for BOR posts before reveal)
		assert.Empty(t, createdPost.Message)
		assert.Empty(t, createdPost.FileIds)

		// Verify TemporaryPost exists with content
		tmpPost, err := th.App.Srv().Store().TemporaryPost().Get(th.Context, createdPost.Id)
		require.NoError(t, err)
		assert.Equal(t, "Check this out", tmpPost.Message)
		// This is where we expect the failure if the bug exists
		assert.ElementsMatch(t, []string{fileInfo1.Id, fileInfo2.Id}, tmpPost.FileIDs)

		// Reveal the post for user2
		revealedPost, appErr := th.App.RevealPost(th.Context, createdPost, user2.Id, "")
		require.Nil(t, appErr)
		require.NotNil(t, revealedPost)
		assert.Equal(t, "Check this out", revealedPost.Message)
		// This is where we expect the failure if the bug exists
		assert.ElementsMatch(t, []string{fileInfo1.Id, fileInfo2.Id}, revealedPost.FileIds)
		require.NotNil(t, revealedPost.Metadata)
		assert.Len(t, revealedPost.Metadata.Files, 2)
	})
}

func TestBurnOnReadDeletion(t *testing.T) {
	os.Setenv("MM_FEATUREFLAGS_BURNONREAD", "true")
	defer os.Unsetenv("MM_FEATUREFLAGS_BURNONREAD")

	th := Setup(t).InitBasic(t)

	enableBoRFeature(th)

	user1 := th.BasicUser
	user2 := th.BasicUser2
	channel := th.BasicChannel

	t.Run("should permanently delete burn-on-read post and associated data", func(t *testing.T) {
		fileBytes := []byte("test content")
		fileInfo, appErr := th.App.UploadFile(th.Context, fileBytes, channel.Id, "test.jpg")
		require.Nil(t, appErr)

		post := &model.Post{
			ChannelId: channel.Id,
			UserId:    user1.Id,
			Message:   "Self-destructing message",
			Type:      model.PostTypeBurnOnRead,
			FileIds:   model.StringArray{fileInfo.Id},
		}
		post.AddProp(model.PostPropsExpireAt, model.GetMillis()+int64(model.DefaultExpirySeconds*1000))

		createdPost, _, appErr := th.App.CreatePost(th.Context, post, channel, model.CreatePostFlags{SetOnline: true})
		require.Nil(t, appErr)

		// Reveal to create read receipt
		_, appErr = th.App.RevealPost(th.Context, createdPost, user2.Id, "")
		require.Nil(t, appErr)

		// Verify all records exist
		_, err := th.App.Srv().Store().Post().GetSingle(th.Context, createdPost.Id, false)
		require.NoError(t, err)
		_, err = th.App.Srv().Store().TemporaryPost().Get(th.Context, createdPost.Id)
		require.NoError(t, err)
		receipt, err := th.App.Srv().Store().ReadReceipt().Get(th.Context, createdPost.Id, user2.Id)
		require.NoError(t, err)
		require.NotNil(t, receipt)
		_, appErr = th.App.GetFileInfo(th.Context, fileInfo.Id)
		require.Nil(t, appErr)

		// Permanently delete post
		appErr = th.App.PermanentDeletePost(th.Context, createdPost.Id, user1.Id)
		require.Nil(t, appErr)

		// Verify all records are gone
		_, err = th.App.Srv().Store().Post().GetSingle(th.Context, createdPost.Id, true)
		assert.Error(t, err)
		assert.True(t, store.IsErrNotFound(err))

		_, err = th.App.Srv().Store().TemporaryPost().Get(th.Context, createdPost.Id)
		assert.Error(t, err)
		assert.True(t, store.IsErrNotFound(err))

		receipt, err = th.App.Srv().Store().ReadReceipt().Get(th.Context, createdPost.Id, user2.Id)
		assert.Error(t, err)
		assert.True(t, store.IsErrNotFound(err))

		_, appErr = th.App.GetFileInfo(th.Context, fileInfo.Id)
		assert.NotNil(t, appErr)
		assert.Equal(t, "app.file_info.get.app_error", appErr.Id)
	})
}
