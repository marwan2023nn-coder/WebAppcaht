// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"net/http"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/v8/einterfaces"
)

type DataRetention struct {
	app *App
}

func NewDataRetention(app *App) einterfaces.DataRetentionInterface {
	return &DataRetention{
		app: app,
	}
}

func init() {
	RegisterDataRetentionInterface(NewDataRetention)
}

func (d *DataRetention) GetGlobalPolicy() (*model.GlobalRetentionPolicy, *model.AppError) {
	cfg := d.app.Config().DataRetentionSettings
	return &model.GlobalRetentionPolicy{
		MessageDeletionEnabled: model.SafeDereference(cfg.EnableMessageDeletion),
		FileDeletionEnabled:    model.SafeDereference(cfg.EnableFileDeletion),
		MessageRetentionCutoff: d.GetMessageRetentionCutoff(),
		FileRetentionCutoff:    d.GetFileRetentionCutoff(),
	}, nil
}

func (d *DataRetention) GetPolicies(offset, limit int) (*model.RetentionPolicyWithTeamAndChannelCountsList, *model.AppError) {
	policies, err := d.app.Srv().Store().RetentionPolicy().GetAll(offset, limit)
	if err != nil {
		return nil, model.NewAppError("DataRetention.GetPolicies", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetCount()
	if err != nil {
		return nil, model.NewAppError("DataRetention.GetPolicies", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return &model.RetentionPolicyWithTeamAndChannelCountsList{
		Policies:   policies,
		TotalCount: count,
	}, nil
}

func (d *DataRetention) GetPoliciesCount() (int64, *model.AppError) {
	count, err := d.app.Srv().Store().RetentionPolicy().GetCount()
	if err != nil {
		return 0, model.NewAppError("DataRetention.GetPoliciesCount", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return count, nil
}

func (d *DataRetention) GetPolicy(policyID string) (*model.RetentionPolicyWithTeamAndChannelCounts, *model.AppError) {
	policy, err := d.app.Srv().Store().RetentionPolicy().Get(policyID)
	if err != nil {
		return nil, model.NewAppError("DataRetention.GetPolicy", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return policy, nil
}

func (d *DataRetention) CreatePolicy(policy *model.RetentionPolicyWithTeamAndChannelIDs) (*model.RetentionPolicyWithTeamAndChannelCounts, *model.AppError) {
	newPolicy, err := d.app.Srv().Store().RetentionPolicy().Save(policy)
	if err != nil {
		return nil, model.NewAppError("DataRetention.CreatePolicy", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return newPolicy, nil
}

func (d *DataRetention) PatchPolicy(patch *model.RetentionPolicyWithTeamAndChannelIDs) (*model.RetentionPolicyWithTeamAndChannelCounts, *model.AppError) {
	updatedPolicy, err := d.app.Srv().Store().RetentionPolicy().Patch(patch)
	if err != nil {
		return nil, model.NewAppError("DataRetention.PatchPolicy", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return updatedPolicy, nil
}

func (d *DataRetention) DeletePolicy(policyID string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().Delete(policyID)
	if err != nil {
		return model.NewAppError("DataRetention.DeletePolicy", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return nil
}

func (d *DataRetention) GetTeamsForPolicy(policyID string, offset, limit int) (*model.TeamsWithCount, *model.AppError) {
	teams, err := d.app.Srv().Store().RetentionPolicy().GetTeams(policyID, offset, limit)
	if err != nil {
		return nil, model.NewAppError("DataRetention.GetTeamsForPolicy", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetTeamsCount(policyID)
	if err != nil {
		return nil, model.NewAppError("DataRetention.GetTeamsForPolicy", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return &model.TeamsWithCount{Teams: teams, TotalCount: count}, nil
}

func (d *DataRetention) AddTeamsToPolicy(policyID string, teamIDs []string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().AddTeams(policyID, teamIDs)
	if err != nil {
		return model.NewAppError("DataRetention.AddTeamsToPolicy", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return nil
}

func (d *DataRetention) RemoveTeamsFromPolicy(policyID string, teamIDs []string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().RemoveTeams(policyID, teamIDs)
	if err != nil {
		return model.NewAppError("DataRetention.RemoveTeamsFromPolicy", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return nil
}

func (d *DataRetention) GetChannelsForPolicy(policyID string, offset, limit int) (*model.ChannelsWithCount, *model.AppError) {
	channels, err := d.app.Srv().Store().RetentionPolicy().GetChannels(policyID, offset, limit)
	if err != nil {
		return nil, model.NewAppError("DataRetention.GetChannelsForPolicy", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetChannelsCount(policyID)
	if err != nil {
		return nil, model.NewAppError("DataRetention.GetChannelsForPolicy", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return &model.ChannelsWithCount{Channels: channels, TotalCount: count}, nil
}

func (d *DataRetention) AddChannelsToPolicy(policyID string, channelIDs []string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().AddChannels(policyID, channelIDs)
	if err != nil {
		return model.NewAppError("DataRetention.AddChannelsToPolicy", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return nil
}

func (d *DataRetention) RemoveChannelsFromPolicy(policyID string, channelIDs []string) *model.AppError {
	err := d.app.Srv().Store().RetentionPolicy().RemoveChannels(policyID, channelIDs)
	if err != nil {
		return model.NewAppError("DataRetention.RemoveChannelsFromPolicy", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return nil
}

func (d *DataRetention) GetTeamPoliciesForUser(userID string, offset, limit int) (*model.RetentionPolicyForTeamList, *model.AppError) {
	policies, err := d.app.Srv().Store().RetentionPolicy().GetTeamPoliciesForUser(userID, offset, limit)
	if err != nil {
		return nil, model.NewAppError("DataRetention.GetTeamPoliciesForUser", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetTeamPoliciesCountForUser(userID)
	if err != nil {
		return nil, model.NewAppError("DataRetention.GetTeamPoliciesForUser", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return &model.RetentionPolicyForTeamList{
		Policies:   policies,
		TotalCount: count,
	}, nil
}

func (d *DataRetention) GetChannelPoliciesForUser(userID string, offset, limit int) (*model.RetentionPolicyForChannelList, *model.AppError) {
	policies, err := d.app.Srv().Store().RetentionPolicy().GetChannelPoliciesForUser(userID, offset, limit)
	if err != nil {
		return nil, model.NewAppError("DataRetention.GetChannelPoliciesForUser", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	count, err := d.app.Srv().Store().RetentionPolicy().GetChannelPoliciesCountForUser(userID)
	if err != nil {
		return nil, model.NewAppError("DataRetention.GetChannelPoliciesForUser", "ent.data_retention.policies.internal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	return &model.RetentionPolicyForChannelList{
		Policies:   policies,
		TotalCount: count,
	}, nil
}

func (d *DataRetention) GetMessageRetentionCutoff() int64 {
	return model.GetMillis() - int64(d.app.Config().DataRetentionSettings.GetMessageRetentionHours())*60*60*1000
}

func (d *DataRetention) GetFileRetentionCutoff() int64 {
	return model.GetMillis() - int64(d.app.Config().DataRetentionSettings.GetFileRetentionHours())*60*60*1000
}
