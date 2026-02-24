// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {UserProfile} from '@workspace/types/users';

import {getFilteredUsersStats, getProfiles, searchProfiles} from 'workspace-redux/actions/users';
import {getRoles} from 'workspace-redux/selectors/entities/roles_helpers';
import {getProfiles as selectProfiles, getFilteredUsersStats as selectFilteredUserStats, makeSearchProfilesStartingWithTerm, filterProfiles} from 'workspace-redux/selectors/entities/users';
import {filterProfilesStartingWithTerm, profileListToMap} from 'workspace-redux/utils/user_utils';

import {setUserGridSearch} from 'actions/views/search';

import type {GlobalState} from 'types/store';

import SystemRoleUsers from './system_role_users';

type OwnProps = {
    roleName: string;
    usersToAdd: Record<string, UserProfile>;
    usersToRemove: Record<string, UserProfile>;
}

function searchUsersToAdd(users: Record<string, UserProfile>, term: string): Record<string, UserProfile> {
    const profiles = filterProfilesStartingWithTerm(Object.keys(users).map((key) => users[key]), term);
    return filterProfiles(profileListToMap(profiles), {});
}

function mapStateToProps(state: GlobalState, props: OwnProps) {
    const {roleName} = props;
    const role = getRoles(state)[roleName];
    const totalCount = selectFilteredUserStats(state)?.total_users_count || 0;
    const term = state.views.search.userGridSearch?.term || '';
    const filters = {roles: [role.name]};
    const searchProfilesStartingWithTerm = makeSearchProfilesStartingWithTerm();

    let users = [];
    let {usersToAdd} = props;
    if (term) {
        users = searchProfilesStartingWithTerm(state, term, false, filters);
        usersToAdd = searchUsersToAdd(usersToAdd, term);
    } else {
        users = selectProfiles(state, filters);
    }

    return {
        role,
        users,
        totalCount,
        term,
        usersToAdd,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            getProfiles,
            getFilteredUsersStats,
            searchProfiles,
            setUserGridSearch,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemRoleUsers);

