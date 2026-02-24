// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {GlobalState} from '@workspace/types/store';

import {getChannelStats} from 'workspace-redux/actions/channels';
import {
    getMyTeamMembers,
    getMyTeamUnreads,
    getTeamStats,
    getTeamMember,
    updateTeamMemberSchemeRoles,
} from 'workspace-redux/actions/teams';
import {getUser, updateUserActive} from 'workspace-redux/actions/users';
import {isCollapsedThreadsEnabled} from 'workspace-redux/selectors/entities/preferences';
import {getCurrentRelativeTeamUrl, getCurrentTeam} from 'workspace-redux/selectors/entities/teams';
import {getCurrentUser} from 'workspace-redux/selectors/entities/users';

import {removeUserFromTeamAndGetStats} from 'actions/team_actions';

import TeamMembersDropdown from './team_members_dropdown';

function mapStateToProps(state: GlobalState) {
    return {
        currentUser: getCurrentUser(state),
        teamUrl: getCurrentRelativeTeamUrl(state),
        currentTeam: getCurrentTeam(state),
        collapsedThreads: isCollapsedThreadsEnabled(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            getMyTeamMembers,
            getMyTeamUnreads,
            getUser,
            getTeamMember,
            getTeamStats,
            getChannelStats,
            updateUserActive,
            updateTeamMemberSchemeRoles,
            removeUserFromTeamAndGetStats,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamMembersDropdown);
