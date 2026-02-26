// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"net/http"

	"github.com/mattermost/mattermost/server/public/model"
)

type DataRetentionImpl struct {
	app *App
}

func (d *DataRetentionImpl) GetGlobalPolicy() (*model.GlobalRetentionPolicy, *model.AppError) {
	cfg := d.app.Config()
	return &model.GlobalRetentionPolicy{
		MessageDeletionEnabled: *cfg.DataRetentionSettings.EnableMessageDeletion,
		FileDeletionEnabled:    *cfg.DataRetentionSettings.EnableFileDeletion,
		MessageRetentionCutoff: int64(*cfg.DataRetentionSettings.MessageRetentionDays),
		FileRetentionCutoff:    int64(*cfg.DataRetentionSettings.FileRetentionDays),
	}, nil
}

func (d *DataRetentionImpl) GetPolicies(offset, limit int) (*model.RetentionPolicyWithTeamAndChannelCountsList, *model.AppError) {
	policies, err := d.app.Srv().Store().RetentionPolicy().GetAll(offset, limit)
	if err != nil {
		return nil, model.NewAppError("GetPolicies", "app.retention_policy.get_all.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetCount()
	if err != nil {
		return nil, model.NewAppError("GetPolicies", "app.retention_policy.get_count.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return &model.RetentionPolicyWithTeamAndChannelCountsList{
		Policies:   policies,
		TotalCount: count,
	}, nil
}

func (d *DataRetentionImpl) GetPoliciesCount() (int64, *model.AppError) {
	count, err := d.app.Srv().Store().RetentionPolicy().GetCount()
	if err != nil {
		return 0, model.NewAppError("GetPoliciesCount", "app.retention_policy.get_count.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return count, nil
}

func (d *DataRetentionImpl) GetPolicy(policyID string) (*model.RetentionPolicyWithTeamAndChannelCounts, *model.AppError) {
	policy, err := d.app.Srv().Store().RetentionPolicy().Get(policyID)
	if err != nil {
		return nil, model.NewAppError("GetPolicy", "app.retention_policy.get.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return policy, nil
}

func (d *DataRetentionImpl) CreatePolicy(policy *model.RetentionPolicyWithTeamAndChannelIDs) (*model.RetentionPolicyWithTeamAndChannelCounts, *model.AppError) {
	newPolicy, err := d.app.Srv().Store().RetentionPolicy().Save(policy)
	if err != nil {
		return nil, model.NewAppError("CreatePolicy", "app.retention_policy.save.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return newPolicy, nil
}

func (d *DataRetentionImpl) PatchPolicy(patch *model.RetentionPolicyWithTeamAndChannelIDs) (*model.RetentionPolicyWithTeamAndChannelCounts, *model.AppError) {
	updatedPolicy, err := d.app.Srv().Store().RetentionPolicy().Patch(patch)
	if err != nil {
		return nil, model.NewAppError("PatchPolicy", "app.retention_policy.patch.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return updatedPolicy, nil
}

func (d *DataRetentionImpl) DeletePolicy(policyID string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().Delete(policyID)
	if err != nil {
		return model.NewAppError("DeletePolicy", "app.retention_policy.delete.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return nil
}

func (d *DataRetentionImpl) GetTeamsForPolicy(policyID string, offset, limit int) (*model.TeamsWithCount, *model.AppError) {
	teams, err := d.app.Srv().Store().RetentionPolicy().GetTeams(policyID, offset, limit)
	if err != nil {
		return nil, model.NewAppError("GetTeamsForPolicy", "app.retention_policy.get_teams.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetTeamsCount(policyID)
	if err != nil {
		return nil, model.NewAppError("GetTeamsForPolicy", "app.retention_policy.get_teams_count.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return &model.TeamsWithCount{Teams: teams, TotalCount: count}, nil
}

func (d *DataRetentionImpl) AddTeamsToPolicy(policyID string, teamIDs []string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().AddTeams(policyID, teamIDs)
	if err != nil {
		return model.NewAppError("AddTeamsToPolicy", "app.retention_policy.add_teams.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return nil
}

func (d *DataRetentionImpl) RemoveTeamsFromPolicy(policyID string, teamIDs []string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().RemoveTeams(policyID, teamIDs)
	if err != nil {
		return model.NewAppError("RemoveTeamsFromPolicy", "app.retention_policy.remove_teams.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return nil
}

func (d *DataRetentionImpl) GetChannelsForPolicy(policyID string, offset, limit int) (*model.ChannelsWithCount, *model.AppError) {
	channels, err := d.app.Srv().Store().RetentionPolicy().GetChannels(policyID, offset, limit)
	if err != nil {
		return nil, model.NewAppError("GetChannelsForPolicy", "app.retention_policy.get_channels.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetChannelsCount(policyID)
	if err != nil {
		return nil, model.NewAppError("GetChannelsForPolicy", "app.retention_policy.get_channels_count.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return &model.ChannelsWithCount{Channels: channels, TotalCount: count}, nil
}

func (d *DataRetentionImpl) AddChannelsToPolicy(policyID string, channelIDs []string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().AddChannels(policyID, channelIDs)
	if err != nil {
		return model.NewAppError("AddChannelsToPolicy", "app.retention_policy.add_channels.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return nil
}

func (d *DataRetentionImpl) RemoveChannelsFromPolicy(policyID string, channelIDs []string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().RemoveChannels(policyID, channelIDs)
	if err != nil {
		return model.NewAppError("RemoveChannelsFromPolicy", "app.retention_policy.remove_channels.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return nil
}

func (d *DataRetentionImpl) GetTeamPoliciesForUser(userID string, offset, limit int) (*model.RetentionPolicyForTeamList, *model.AppError) {
	policies, err := d.app.Srv().Store().RetentionPolicy().GetTeamPoliciesForUser(userID, offset, limit)
	if err != nil {
		return nil, model.NewAppError("GetTeamPoliciesForUser", "app.retention_policy.get_team_policies_for_user.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetTeamPoliciesCountForUser(userID)
	if err != nil {
		return nil, model.NewAppError("GetTeamPoliciesForUser", "app.retention_policy.get_team_policies_count_for_user.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return &model.RetentionPolicyForTeamList{
		Policies:   policies,
		TotalCount: count,
	}, nil
}

func (d *DataRetentionImpl) GetChannelPoliciesForUser(userID string, offset, limit int) (*model.RetentionPolicyForChannelList, *model.AppError) {
	policies, err := d.app.Srv().Store().RetentionPolicy().GetChannelPoliciesForUser(userID, offset, limit)
	if err != nil {
		return nil, model.NewAppError("GetChannelPoliciesForUser", "app.retention_policy.get_channel_policies_for_user.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetChannelPoliciesCountForUser(userID)
	if err != nil {
		return nil, model.NewAppError("GetChannelPoliciesForUser", "app.retention_policy.get_channel_policies_count_for_user.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return &model.RetentionPolicyForChannelList{
		Policies:   policies,
		TotalCount: count,
	}, nil
}

func NewDataRetentionImpl(app *App) *DataRetentionImpl {
	return &DataRetentionImpl{app: app}
}
