// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {GlobalState} from '@workspace/types/store';

import {getAccessControlPolicy, deleteAccessControlPolicy, assignChannelsToAccessControlPolicy, searchAccessControlPolicies, unassignChannelsFromAccessControlPolicy, createAccessControlPolicy, getAccessControlFields, getVisualAST, validateExpressionAgainstRequester, updateAccessControlPolicyActive, searchUsersForExpression} from 'workspace-redux/actions/access_control';
import {
    addChannelMember,
    deleteChannel,
    getChannel as fetchChannel,
    getChannelModerations as fetchChannelModerations,
    getChannelMembers,
    membersMinusGroupMembers,
    patchChannel,
    patchChannelModerations,
    removeChannelMember,
    unarchiveChannel,
    updateChannelMemberSchemeRoles,
    updateChannelPrivacy,
} from 'workspace-redux/actions/channels';
import {
    getGroupsAssociatedToChannel as fetchAssociatedGroups,
    linkGroupSyncable,
    patchGroupSyncable,
    unlinkGroupSyncable,
} from 'workspace-redux/actions/groups';
import {createJob} from 'workspace-redux/actions/jobs';
import {getScheme as loadScheme} from 'workspace-redux/actions/schemes';
import {getTeam as fetchTeam} from 'workspace-redux/actions/teams';
import {getProfilesByIds} from 'workspace-redux/actions/users';
import {getChannel, getChannelModerations} from 'workspace-redux/selectors/entities/channels';
import {getConfig, getLicense} from 'workspace-redux/selectors/entities/general';
import {getAllGroups, getGroupsAssociatedToChannel} from 'workspace-redux/selectors/entities/groups';
import {getScheme} from 'workspace-redux/selectors/entities/schemes';
import {getTeam} from 'workspace-redux/selectors/entities/teams';

import {setNavigationBlocked} from 'actions/admin_actions';

import {isMinimumEnterpriseAdvancedLicense, isMinimumEnterpriseLicense, isMinimumProfessionalLicense} from 'utils/license_utils';

import ChannelDetails from './channel_details';

type OwnProps = {
    match: {
        params: {
            channel_id: string;
        };
    };
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);
    const license = getLicense(state);

    const isLicensed = license?.IsLicensed === 'true';

    // Channel Moderation is only available for Professional and above
    const channelModerationEnabled = isLicensed && isMinimumProfessionalLicense(license);

    // Channel Groups is only available for Enterprise and above
    const channelGroupsEnabled = isLicensed && isMinimumEnterpriseLicense(license);

    const abacSupported = isLicensed && isMinimumEnterpriseAdvancedLicense(license) && config.FeatureFlagAttributeBasedAccessControl === 'true';

    const guestAccountsEnabled = config.EnableGuestAccounts === 'true';
    const channelID = ownProps.match.params.channel_id;
    const channel = getChannel(state, channelID);
    const team = channel ? getTeam(state, channel.team_id) : undefined;
    const groups = getGroupsAssociatedToChannel(state, channelID);
    const totalGroups = groups.length;
    const allGroups = getAllGroups(state);
    const channelPermissions = getChannelModerations(state, channelID);
    const teamScheme = team ? getScheme(state, team.scheme_id) : undefined;
    return {
        channelID,
        channel,
        team,
        groups,
        totalGroups,
        allGroups,
        channelPermissions,
        teamScheme,
        guestAccountsEnabled,
        channelModerationEnabled,
        channelGroupsEnabled,
        abacSupported,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    const assignChannelToAccessControlPolicy = (policyId: string, channelId: string) => {
        return assignChannelsToAccessControlPolicy(policyId, [channelId]);
    };
    return {
        actions: bindActionCreators({
            getGroups: fetchAssociatedGroups,
            linkGroupSyncable,
            unlinkGroupSyncable,
            membersMinusGroupMembers,
            setNavigationBlocked: setNavigationBlocked as any,
            getChannel: fetchChannel,
            getTeam: fetchTeam,
            getChannelModerations: fetchChannelModerations,
            patchChannel,
            updateChannelPrivacy,
            patchGroupSyncable,
            patchChannelModerations,
            loadScheme,
            addChannelMember,
            removeChannelMember,
            updateChannelMemberSchemeRoles,
            deleteChannel,
            unarchiveChannel,
            getAccessControlPolicy,
            assignChannelToAccessControlPolicy,
            unassignChannelsFromAccessControlPolicy,
            deleteAccessControlPolicy,
            searchPolicies: searchAccessControlPolicies,

            // Channel-level access rules actions
            getAccessControlFields,
            getVisualAST,
            saveChannelAccessPolicy: createAccessControlPolicy,
            validateChannelExpression: validateExpressionAgainstRequester,
            createAccessControlSyncJob: createJob,
            updateAccessControlPolicyActive,
            searchUsersForExpression,
            getChannelMembers,
            getProfilesByIds,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelDetails);
