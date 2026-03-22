// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
)

// dataRetentionStub is a no-op implementation of einterfaces.DataRetentionInterface.
// It is used when the enterprise DataRetention plugin is not loaded (i.e., dataRetentionInterface == nil).
//
// Instead of returning a 501 "license does not support" error, these stubs return
// empty-but-valid responses, allowing the Admin Console UI to load and display
// the Data Retention section without errors.
//
// WRITE operations (Create/Patch/Delete/Add/Remove) are no-ops that succeed silently,
// since there is no backing store. READ operations return empty lists/zeros.
type dataRetentionStub struct{}

func (d *dataRetentionStub) GetGlobalPolicy() (*model.GlobalRetentionPolicy, *model.AppError) {
	return &model.GlobalRetentionPolicy{
		MessageDeletionEnabled: false,
		FileDeletionEnabled:    false,
		MessageRetentionCutoff: 0,
		FileRetentionCutoff:    0,
	}, nil
}

func (d *dataRetentionStub) GetPolicies(offset, limit int) (*model.RetentionPolicyWithTeamAndChannelCountsList, *model.AppError) {
	return &model.RetentionPolicyWithTeamAndChannelCountsList{
		Policies:   []*model.RetentionPolicyWithTeamAndChannelCounts{},
		TotalCount: 0,
	}, nil
}

func (d *dataRetentionStub) GetPoliciesCount() (int64, *model.AppError) {
	return 0, nil
}

func (d *dataRetentionStub) GetPolicy(policyID string) (*model.RetentionPolicyWithTeamAndChannelCounts, *model.AppError) {
	return &model.RetentionPolicyWithTeamAndChannelCounts{
		RetentionPolicy: model.RetentionPolicy{
			ID:               policyID,
			DisplayName:      "",
			PostDurationDays: model.NewPointer(int64(-1)),
		},
		ChannelCount: 0,
		TeamCount:    0,
	}, nil
}

func (d *dataRetentionStub) CreatePolicy(policy *model.RetentionPolicyWithTeamAndChannelIDs) (*model.RetentionPolicyWithTeamAndChannelCounts, *model.AppError) {
	return &model.RetentionPolicyWithTeamAndChannelCounts{
		RetentionPolicy: model.RetentionPolicy{
			ID:               model.NewId(),
			DisplayName:      policy.DisplayName,
			PostDurationDays: policy.PostDurationDays,
		},
	}, nil
}

func (d *dataRetentionStub) PatchPolicy(patch *model.RetentionPolicyWithTeamAndChannelIDs) (*model.RetentionPolicyWithTeamAndChannelCounts, *model.AppError) {
	return &model.RetentionPolicyWithTeamAndChannelCounts{
		RetentionPolicy: model.RetentionPolicy{
			ID:               patch.ID,
			DisplayName:      patch.DisplayName,
			PostDurationDays: patch.PostDurationDays,
		},
	}, nil
}

func (d *dataRetentionStub) DeletePolicy(policyID string) *model.AppError {
	return nil
}

func (d *dataRetentionStub) GetTeamsForPolicy(policyID string, offset, limit int) (*model.TeamsWithCount, *model.AppError) {
	return &model.TeamsWithCount{Teams: []*model.Team{}, TotalCount: 0}, nil
}

func (d *dataRetentionStub) AddTeamsToPolicy(policyID string, teamIDs []string) *model.AppError {
	return nil
}

func (d *dataRetentionStub) RemoveTeamsFromPolicy(policyID string, teamIDs []string) *model.AppError {
	return nil
}

func (d *dataRetentionStub) GetChannelsForPolicy(policyID string, offset, limit int) (*model.ChannelsWithCount, *model.AppError) {
	return &model.ChannelsWithCount{Channels: model.ChannelListWithTeamData{}, TotalCount: 0}, nil
}

func (d *dataRetentionStub) AddChannelsToPolicy(policyID string, channelIDs []string) *model.AppError {
	return nil
}

func (d *dataRetentionStub) RemoveChannelsFromPolicy(policyID string, channelIDs []string) *model.AppError {
	return nil
}

func (d *dataRetentionStub) GetTeamPoliciesForUser(userID string, offset, limit int) (*model.RetentionPolicyForTeamList, *model.AppError) {
	return &model.RetentionPolicyForTeamList{
		Policies:   []*model.RetentionPolicyForTeam{},
		TotalCount: 0,
	}, nil
}

func (d *dataRetentionStub) GetChannelPoliciesForUser(userID string, offset, limit int) (*model.RetentionPolicyForChannelList, *model.AppError) {
	return &model.RetentionPolicyForChannelList{
		Policies:   []*model.RetentionPolicyForChannel{},
		TotalCount: 0,
	}, nil
}
