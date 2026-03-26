// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api4

import (
	"net/http"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/request"
	"github.com/mattermost/mattermost/server/v8/channels/app"
)

func userCreatePostPermissionCheckWithContext(c *Context, channelId string) {
	hasPermission := false
	if ok, _ := c.App.SessionHasPermissionToChannel(c.AppContext, *c.AppContext.Session(), channelId, model.PermissionCreatePost); ok {
		hasPermission = true
	} else if channel, err := c.App.GetChannel(c.AppContext, channelId); err == nil {
		// Temporary permission check method until advanced permissions, please do not copy
		if channel.Type == model.ChannelTypeOpen && c.App.SessionHasPermissionToTeam(*c.AppContext.Session(), channel.TeamId, model.PermissionCreatePostPublic) {
			hasPermission = true
		}
	}

	if !hasPermission {
		c.SetPermissionError(model.PermissionCreatePost)
		return
	}
}

func postBurnOnReadCheckWithContext(where string, c *Context, post *model.Post, channel *model.Channel) {
	appErr := PostBurnOnReadCheckWithApp(where, c.App, c.AppContext, post.UserId, post.ChannelId, post.Type, channel)
	if appErr != nil {
		appErr.Where = where
		c.Err = appErr
	}
}

// PostBurnOnReadCheckWithApp validates whether a burn-on-read post can be created
// based on channel type and participants. This is called from the API layer before
// post creation to enforce burn-on-read restrictions.
func PostBurnOnReadCheckWithApp(where string, a *app.App, rctx request.CTX, userId, channelId, postType string, channel *model.Channel) *model.AppError {
	// Only validate if this is a burn-on-read post
	if postType != model.PostTypeBurnOnRead {
		return nil
	}

	// Get channel if not provided
	if channel == nil {
		ch, err := a.GetChannel(rctx, channelId)
		if err != nil {
			return model.NewAppError(where, "api.post.fill_in_post_props.burn_on_read.channel.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
		}
		channel = ch
	}

	// Burn-on-read is not allowed in self-DMs or DMs with bots (including AI agents, plugins)
	if channel.Type == model.ChannelTypeDirect {
		// Check if it's a self-DM by comparing the channel name with the expected self-DM name
		selfDMName := model.GetDMNameFromIds(userId, userId)
		if channel.Name == selfDMName {
			return model.NewAppError(where, "api.post.fill_in_post_props.burn_on_read.self_dm.app_error", nil, "", http.StatusBadRequest)
		}

		// Check if the DM is with a bot (AI agents, plugins, etc.)
		otherUserId := channel.GetOtherUserIdForDM(userId)
		if otherUserId != "" && otherUserId != userId {
			otherUser, err := a.GetUser(otherUserId)
			if err != nil {
				// Failed to retrieve the other user (user not found, DB error, etc.)
				// Block burn-on-read post as we cannot validate the recipient
				return model.NewAppError(where, "api.post.fill_in_post_props.burn_on_read.user.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
			}
			if otherUser.IsBot {
				return model.NewAppError(where, "api.post.fill_in_post_props.burn_on_read.bot_dm.app_error", nil, "", http.StatusBadRequest)
			}
		}
	}

	return nil
}

func postHardenedModeCheckWithContext(where string, c *Context, props model.StringInterface) {
	isIntegration := c.AppContext.Session().IsIntegration()

	if appErr := app.PostHardenedModeCheckWithApp(c.App, isIntegration, props); appErr != nil {
		appErr.Where = where
		c.Err = appErr
	}
}

func postPriorityCheckWithContext(where string, c *Context, priority *model.PostPriority, rootId string) {
	appErr := app.PostPriorityCheckWithApp(where, c.App, c.AppContext.Session().UserId, priority, rootId)
	if appErr != nil {
		appErr.Where = where
		c.Err = appErr
	}
}

// checkUploadFilePermissionForNewFiles checks upload_file permission only when
// adding new files to a post, preventing permission bypass via cross-channel file attachments.
func checkUploadFilePermissionForNewFiles(c *Context, newFileIds []string, originalPost *model.Post) {
	if len(newFileIds) == 0 {
		return
	}

	originalFileIDsMap := make(map[string]bool, len(originalPost.FileIds))
	for _, fileID := range originalPost.FileIds {
		originalFileIDsMap[fileID] = true
	}

	hasNewFiles := false
	for _, fileID := range newFileIds {
		if !originalFileIDsMap[fileID] {
			hasNewFiles = true
			break
		}
	}

	if hasNewFiles {
		if ok, _ := c.App.SessionHasPermissionToChannel(c.AppContext, *c.AppContext.Session(), originalPost.ChannelId, model.PermissionUploadFile); !ok {
			c.SetPermissionError(model.PermissionUploadFile)
			return
		}
	}
}
