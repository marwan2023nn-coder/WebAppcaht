// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"net/http"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/v8/einterfaces"
)

type dataRetention struct {
	app *App
}

func init() {
	RegisterDataRetentionInterface(func(a *App) einterfaces.DataRetentionInterface {
		return &dataRetention{a}
	})
}

func (d *dataRetention) GetGlobalPolicy() (*model.GlobalRetentionPolicy, *model.AppError) {
	cfg := d.app.Config()
	policy := &model.GlobalRetentionPolicy{
		MessageDeletionEnabled: model.SafeDereference(cfg.DataRetentionSettings.EnableMessageDeletion),
		FileDeletionEnabled:    model.SafeDereference(cfg.DataRetentionSettings.EnableFileDeletion),
	}

	now := model.GetMillis()
	if policy.MessageDeletionEnabled {
		policy.MessageRetentionCutoff = now - int64(cfg.DataRetentionSettings.GetMessageRetentionHours())*60*60*1000
	}
	if policy.FileDeletionEnabled {
		policy.FileRetentionCutoff = now - int64(cfg.DataRetentionSettings.GetFileRetentionHours())*60*60*1000
	}

	return policy, nil
}

func (d *dataRetention) GetPolicies(offset, limit int) (*model.RetentionPolicyWithTeamAndChannelCountsList, *model.AppError) {
	policies, err := d.app.Srv().Store().RetentionPolicy().GetAll(offset, limit)
	if err != nil {
		return nil, d.internalError("GetPolicies", err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetCount()
	if err != nil {
		return nil, d.internalError("GetPolicies", err)
	}
	return &model.RetentionPolicyWithTeamAndChannelCountsList{
		Policies:   policies,
		TotalCount: count,
	}, nil
}

func (d *dataRetention) GetPoliciesCount() (int64, *model.AppError) {
	count, err := d.app.Srv().Store().RetentionPolicy().GetCount()
	if err != nil {
		return 0, d.internalError("GetPoliciesCount", err)
	}
	return count, nil
}

func (d *dataRetention) GetPolicy(policyID string) (*model.RetentionPolicyWithTeamAndChannelCounts, *model.AppError) {
	policy, err := d.app.Srv().Store().RetentionPolicy().Get(policyID)
	if err != nil {
		return nil, d.internalError("GetPolicy", err)
	}
	return policy, nil
}

func (d *dataRetention) CreatePolicy(policy *model.RetentionPolicyWithTeamAndChannelIDs) (*model.RetentionPolicyWithTeamAndChannelCounts, *model.AppError) {
	newPolicy, err := d.app.Srv().Store().RetentionPolicy().Save(policy)
	if err != nil {
		return nil, d.internalError("CreatePolicy", err)
	}
	return newPolicy, nil
}

func (d *dataRetention) PatchPolicy(patch *model.RetentionPolicyWithTeamAndChannelIDs) (*model.RetentionPolicyWithTeamAndChannelCounts, *model.AppError) {
	updatedPolicy, err := d.app.Srv().Store().RetentionPolicy().Patch(patch)
	if err != nil {
		return nil, d.internalError("PatchPolicy", err)
	}
	return updatedPolicy, nil
}

func (d *dataRetention) DeletePolicy(policyID string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().Delete(policyID)
	if err != nil {
		return d.internalError("DeletePolicy", err)
	}
	return nil
}

func (d *dataRetention) GetTeamsForPolicy(policyID string, offset, limit int) (*model.TeamsWithCount, *model.AppError) {
	teams, err := d.app.Srv().Store().RetentionPolicy().GetTeams(policyID, offset, limit)
	if err != nil {
		return nil, d.internalError("GetTeamsForPolicy", err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetTeamsCount(policyID)
	if err != nil {
		return nil, d.internalError("GetTeamsForPolicy", err)
	}
	return &model.TeamsWithCount{Teams: teams, TotalCount: count}, nil
}

func (d *dataRetention) AddTeamsToPolicy(policyID string, teamIDs []string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().AddTeams(policyID, teamIDs)
	if err != nil {
		return d.internalError("AddTeamsToPolicy", err)
	}
	return nil
}

func (d *dataRetention) RemoveTeamsFromPolicy(policyID string, teamIDs []string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().RemoveTeams(policyID, teamIDs)
	if err != nil {
		return d.internalError("RemoveTeamsFromPolicy", err)
	}
	return nil
}

func (d *dataRetention) GetChannelsForPolicy(policyID string, offset, limit int) (*model.ChannelsWithCount, *model.AppError) {
	channels, err := d.app.Srv().Store().RetentionPolicy().GetChannels(policyID, offset, limit)
	if err != nil {
		return nil, d.internalError("GetChannelsForPolicy", err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetChannelsCount(policyID)
	if err != nil {
		return nil, d.internalError("GetChannelsForPolicy", err)
	}
	return &model.ChannelsWithCount{Channels: channels, TotalCount: count}, nil
}

func (d *dataRetention) AddChannelsToPolicy(policyID string, channelIDs []string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().AddChannels(policyID, channelIDs)
	if err != nil {
		return d.internalError("AddChannelsToPolicy", err)
	}
	return nil
}

func (d *dataRetention) RemoveChannelsFromPolicy(policyID string, channelIDs []string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().RemoveChannels(policyID, channelIDs)
	if err != nil {
		return d.internalError("RemoveChannelsFromPolicy", err)
	}
	return nil
}

func (d *dataRetention) GetTeamPoliciesForUser(userID string, offset, limit int) (*model.RetentionPolicyForTeamList, *model.AppError) {
	policies, err := d.app.Srv().Store().RetentionPolicy().GetTeamPoliciesForUser(userID, offset, limit)
	if err != nil {
		return nil, d.internalError("GetTeamPoliciesForUser", err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetTeamPoliciesCountForUser(userID)
	if err != nil {
		return nil, d.internalError("GetTeamPoliciesForUser", err)
	}
	return &model.RetentionPolicyForTeamList{
		Policies:   policies,
		TotalCount: count,
	}, nil
}

func (d *dataRetention) GetChannelPoliciesForUser(userID string, offset, limit int) (*model.RetentionPolicyForChannelList, *model.AppError) {
	policies, err := d.app.Srv().Store().RetentionPolicy().GetChannelPoliciesForUser(userID, offset, limit)
	if err != nil {
		return nil, d.internalError("GetChannelPoliciesForUser", err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetChannelPoliciesCountForUser(userID)
	if err != nil {
		return nil, d.internalError("GetChannelPoliciesForUser", err)
	}
	return &model.RetentionPolicyForChannelList{
		Policies:   policies,
		TotalCount: count,
	}, nil
}

func (d *dataRetention) internalError(methodName string, err error) *model.AppError {
	return model.NewAppError("dataRetention."+methodName, "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
}

func NewDataRetentionImpl(a *App) einterfaces.DataRetentionInterface {
	return &dataRetention{a}
}
