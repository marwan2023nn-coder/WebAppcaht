// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"crypto/sha256"
	"fmt"
	"net/http"
	"strings"

	agentclient "github.com/mattermost/mattermost-plugin-ai/public/bridgeclient"
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
	"github.com/mattermost/mattermost/server/public/shared/request"
)

// IsAutoTranslationEnabled returns true if the auto-translation feature is available.
// Requires the AI Bridge to be configured and auto-translation to be enabled on the channel.
func (a *App) IsAutoTranslationEnabled() bool {
	client := a.GetBridgeClient("")
	return client != nil
}

// IsChannelAutoTranslationEnabled checks if auto-translation is enabled for a specific channel.
func (a *App) IsChannelAutoTranslationEnabled(channelID string) (bool, *model.AppError) {
	enabled, err := a.Srv().Store().AutoTranslation().IsUserEnabled("", channelID)
	if err != nil {
		// Fall back to checking the channel model
		channel, appErr := a.GetChannel(request.EmptyContext(a.Log()), channelID)
		if appErr != nil {
			return false, appErr
		}
		return channel.AutoTranslation, nil
	}
	return enabled, nil
}

// TranslatePost translates a post's message for a specific user into their preferred language.
// It uses the existing AI Bridge for translation, storing results in the translations table.
func (a *App) TranslatePost(rctx request.CTX, post *model.Post, channelID, userID string) (*model.Translation, *model.AppError) {
	if post == nil || post.Message == "" {
		return nil, nil
	}

	if !a.IsAutoTranslationEnabled() {
		return nil, model.NewAppError("TranslatePost", "app.autotranslation.not_available", nil, "AI Bridge not configured", http.StatusNotImplemented)
	}

	// Get the user's preferred language
	userLang, err := a.Srv().Store().AutoTranslation().GetUserLanguage(userID, channelID)
	if err != nil || userLang == "" {
		return nil, nil // User not opted in or no language set
	}

	// Compute a hash of the normalized source to avoid re-translating unchanged content
	normalized := strings.TrimSpace(post.Message)
	hash := fmt.Sprintf("%x", sha256.Sum256([]byte(normalized)))

	// Check if we already have a valid translation
	existing, storeErr := a.Srv().Store().AutoTranslation().Get(model.TranslationObjectTypePost, post.Id, userLang)
	if storeErr == nil && existing != nil && existing.NormHash == hash && existing.State == model.TranslationStateReady {
		return existing, nil
	}

	// Save a "processing" placeholder
	placeholder := &model.Translation{
		ObjectID:   post.Id,
		ObjectType: model.TranslationObjectTypePost,
		Lang:       userLang,
		Provider:   "agents",
		Type:       model.TranslationTypeString,
		State:      model.TranslationStateProcessing,
		NormHash:   hash,
	}
	_ = a.Srv().Store().AutoTranslation().Save(placeholder)

	// Use the AI Bridge to translate asynchronously
	go func() {
		sessionUserID := userID
		client := a.GetBridgeClient(sessionUserID)
		if client == nil {
			return
		}

		agentID := a.GetDefaultAgentID(rctx)
		if agentID == "" {
			return
		}

		systemPrompt := fmt.Sprintf("You are a professional translator. Translate the following message to %s. Return ONLY the translated text, with no additional explanation or commentary.", userLang)
		userPrompt := normalized

		completionRequest := agentclient.CompletionRequest{
			Posts: []agentclient.Post{
				{Role: "system", Message: systemPrompt},
				{Role: "user", Message: userPrompt},
			},
			UserID: sessionUserID,
		}

		completion, _ := client.AgentCompletion(agentID, completionRequest)

		translationResult := &model.Translation{
			ObjectID:   post.Id,
			ObjectType: model.TranslationObjectTypePost,
			Lang:       userLang,
			Provider:   "agents",
			Type:       model.TranslationTypeString,
			Text:       completion,
			State:      model.TranslationStateReady,
			NormHash:   hash,
		}
		if completion == "" {
			translationResult.State = model.TranslationStateUnavailable
		}
		_ = a.Srv().Store().AutoTranslation().Save(translationResult)
		a.Srv().Store().AutoTranslation().InvalidatePostTranslationEtag(channelID)
	}()

	return placeholder, nil
}

// GetDefaultAgentID returns the first available agent ID using the App's GetAgents method.
func (a *App) GetDefaultAgentID(rctx request.CTX) string {
	agents, appErr := a.GetAgents(rctx, "")
	if appErr != nil || len(agents) == 0 {
		rctx.Logger().Warn("No AI agents available for auto-translation", mlog.Err(appErr))
		return ""
	}
	return agents[0].ID
}

// SetChannelAutoTranslation enables or disables auto-translation for a channel.
func (a *App) SetChannelAutoTranslation(rctx request.CTX, channelID string, enabled bool) (*model.Channel, *model.AppError) {
	channel, appErr := a.GetChannel(rctx, channelID)
	if appErr != nil {
		return nil, appErr
	}

	patch := &model.ChannelPatch{
		AutoTranslation: model.NewPointer(enabled),
	}
	updatedChannel, appErr := a.PatchChannel(rctx, channel, patch, "")
	if appErr != nil {
		return nil, appErr
	}

	a.Srv().Store().AutoTranslation().InvalidatePostTranslationEtag(channelID)

	rctx.Logger().Info("Channel auto-translation setting changed",
		mlog.String("channel_id", channelID),
		mlog.Bool("enabled", enabled),
	)
	return updatedChannel, nil
}

// GetTranslationsForPosts fetches existing translations for a list of post IDs for a user.
func (a *App) GetTranslationsForPosts(rctx request.CTX, channelID, userID string, postIDs []string) (map[string]*model.Translation, *model.AppError) {
	if !a.IsAutoTranslationEnabled() {
		return nil, nil
	}

	userLang, err := a.Srv().Store().AutoTranslation().GetUserLanguage(userID, channelID)
	if err != nil || userLang == "" {
		return make(map[string]*model.Translation), nil
	}

	translations, storeErr := a.Srv().Store().AutoTranslation().GetBatch(model.TranslationObjectTypePost, postIDs, userLang)
	if storeErr != nil {
		return nil, model.NewAppError("GetTranslationsForPosts", "app.autotranslation.get_batch.failed", nil, storeErr.Error(), http.StatusInternalServerError)
	}
	return translations, nil
}
