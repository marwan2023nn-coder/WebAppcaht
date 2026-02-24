// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {UserProfile} from '@workspace/types/users';

import {getChannelMembersInChannels} from 'workspace-redux/selectors/entities/channels';
import {getConfig} from 'workspace-redux/selectors/entities/general';
import {getMembersInTeams} from 'workspace-redux/selectors/entities/teams';
import {filterProfiles} from 'workspace-redux/selectors/entities/users';
import {memoizeResult} from 'workspace-redux/utils/helpers';
import {filterProfilesStartingWithTerm, profileListToMap} from 'workspace-redux/utils/user_utils';

import {loadChannelMembersForProfilesList, loadTeamMembersForProfilesList} from 'actions/user_actions';
import {setModalSearchTerm, setModalFilters} from 'actions/views/search';

import type {GlobalState} from 'types/store';

import UsersToRemove from './users_to_remove';
import type {Filters, Memberships} from './users_to_remove';

type Props = {
    members: UserProfile[];
    scope: 'team' | 'channel';
    scopeId: string;
    total: number;
};

function makeMapStateToProps() {
    const searchUsers = memoizeResult((users: UserProfile[], term: string, filters: Filters, memberships: Memberships) => {
        let profiles = users;
        if (term !== '') {
            profiles = filterProfilesStartingWithTerm(users, term);
        }

        if (Object.keys(filters).length > 0) {
            const filteredProfilesMap = filterProfiles(profileListToMap(profiles), filters, memberships);
            profiles = Object.keys(filteredProfilesMap).map((key) => filteredProfilesMap[key]);
        }

        return profiles;
    });

    return (state: GlobalState, props: Props) => {
        const {scope, scopeId} = props;
        let {members, total} = props;

        const searchTerm = state.views.search.modalSearch || '';
        const filters = state.views.search.modalFilters || {};

        let memberships = {};
        if (scope === 'channel') {
            memberships = getChannelMembersInChannels(state)[scopeId] || {};
        } else if (scope === 'team') {
            memberships = getMembersInTeams(state)[scopeId] || {};
        }

        if (searchTerm || Object.keys(filters).length > 0) {
            members = searchUsers(members, searchTerm, filters, memberships);
            total = members.length;
        }

        const enableGuestAccounts = getConfig(state)?.EnableGuestAccounts === 'true';

        return {
            ...props,
            members,
            total,
            searchTerm,
            scope,
            memberships,
            enableGuestAccounts,
            filters,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            loadChannelMembersForProfilesList,
            loadTeamMembersForProfilesList,
            setModalSearchTerm,
            setModalFilters,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(UsersToRemove);
