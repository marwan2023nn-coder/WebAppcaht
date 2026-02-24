// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from '@workspace/types/store';

import {createSelector} from 'workspace-redux/selectors/create_selector';
import {getMyGroupMentionKeys} from 'workspace-redux/selectors/entities/groups';
import {getCurrentTeamId} from 'workspace-redux/selectors/entities/teams';
import {getCurrentUserMentionKeys} from 'workspace-redux/selectors/entities/users';
import type {UserMentionKey} from 'workspace-redux/selectors/entities/users';

export const getCurrentSearchForCurrentTeam: (state: GlobalState) => string = createSelector(
    'getCurrentSearchForCurrentTeam',
    (state: GlobalState) => state.entities.search.current,
    getCurrentTeamId,
    (current, teamId) => {
        return current[teamId];
    },
);

export const getAllUserMentionKeys: (state: GlobalState) => UserMentionKey[] = createSelector(
    'getAllUserMentionKeys',
    getCurrentUserMentionKeys,
    (state: GlobalState) => getMyGroupMentionKeys(state, false),
    (userMentionKeys, groupMentionKeys) => {
        return userMentionKeys.concat(groupMentionKeys);
    },
);

export const getSearchTruncationInfo = (state: GlobalState) => {
    return state.entities.search.truncationInfo;
};

export const isSearchTruncated = (state: GlobalState, searchType: 'posts' | 'files'): boolean => {
    const truncationInfo = getSearchTruncationInfo(state);
    return Boolean(truncationInfo && truncationInfo[searchType] > 0);
};
