// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Channel} from '@workspace/types/channels';
import type {ClientConfig} from '@workspace/types/config';
import type {Post} from '@workspace/types/posts';
import type {UserProfile} from '@workspace/types/users';

import {createSelector} from 'workspace-redux/selectors/create_selector';
import {getCurrentUser} from 'workspace-redux/selectors/entities/common';
import {getConfig} from 'workspace-redux/selectors/entities/general';
import {getPost} from 'workspace-redux/selectors/entities/posts';
import {moveThreadsEnabled} from 'workspace-redux/selectors/entities/preferences';
import {getCurrentUserId, getCurrentUserRoles} from 'workspace-redux/selectors/entities/users';

import {arePreviewsCollapsed} from 'selectors/preferences';
import {getGlobalItem} from 'selectors/storage';

import {StoragePrefixes} from 'utils/constants';

import type {GlobalState} from 'types/store';
import type {EditingPostDetails} from 'types/store/views';

export const makeGetIsPostBeingEdited = () => createSelector(
    'makeGetIsPostBeingEdited',
    (state: GlobalState) => state.views.posts.editingPost.postId,
    (state: GlobalState) => state.views.posts.editingPost.show,
    (_state: GlobalState, postId: string) => postId,
    (editingPostId, show, postId) => editingPostId === postId && show,
);

export const getIsPostMultiSelectModeEnabled = (state: GlobalState) => state.views.posts.multiSelect.enabled;

export const getMultiSelectedPostIds = (state: GlobalState) => state.views.posts.multiSelect.selectedPostIds;

export const makeGetIsPostBeingEditedInRHS = () => createSelector(
    'makeGetIsPostBeingEditedInRHS',
    getEditingPostDetailsAndPost,
    (_state: GlobalState, postId: string) => postId,
    (editingPost, postId) => editingPost.isRHS && editingPost.postId === postId && editingPost.show,
);

export function getPostEditHistory(state: GlobalState): Post[] {
    return state.entities.posts.postEditHistory;
}

export const getEditingPostDetailsAndPost = createSelector(
    'getEditingPostDetailsAndPost',
    (state: GlobalState) => state.views.posts.editingPost,
    (state: GlobalState) => getPost(state, state.views.posts.editingPost.postId),
    (editingPost, post) => {
        const editingPostDetailsAndPost: EditingPostDetails & {post: Post} = {
            ...editingPost,
            post,
        };

        return editingPostDetailsAndPost;
    },
);

export function isEmbedVisible(state: GlobalState, postId: string) {
    const currentUserId = getCurrentUserId(state);
    const previewCollapsed = arePreviewsCollapsed(state);

    return getGlobalItem(state, StoragePrefixes.EMBED_VISIBLE + currentUserId + '_' + postId, !previewCollapsed);
}

export function isInlineImageVisible(state: GlobalState, postId: string, imageKey: string) {
    const currentUserId = getCurrentUserId(state);
    const imageCollapsed = arePreviewsCollapsed(state);

    return getGlobalItem(state, StoragePrefixes.INLINE_IMAGE_VISIBLE + currentUserId + '_' + postId + '_' + imageKey, !imageCollapsed);
}

export function makeCanWrangler() {
    return createSelector(
        'makeCanWrangler',
        getConfig,
        getCurrentUser,
        getCurrentUserRoles,
        moveThreadsEnabled,
        (_state: GlobalState, channelType: Channel['type']) => channelType,
        (_state: GlobalState, _channelType: Channel['type'], replyCount: number) => replyCount,
        (config: Partial<ClientConfig>, user: UserProfile, userRoles: string, enabled: boolean, channelType: Channel['type'], replyCount: number) => {
            if (!enabled) {
                return false;
            }
            const {
                WranglerPermittedWranglerRoles,
                WranglerAllowedEmailDomain,
                WranglerMoveThreadMaxCount,
                WranglerMoveThreadFromPrivateChannelEnable,
                WranglerMoveThreadFromDirectMessageChannelEnable,
                WranglerMoveThreadFromGroupMessageChannelEnable,
            } = config;

            let permittedUsers: string[] = [];
            if (WranglerPermittedWranglerRoles && WranglerPermittedWranglerRoles !== '') {
                permittedUsers = WranglerPermittedWranglerRoles?.split(',');
            }

            let allowedEmailDomains: string[] = [];
            if (WranglerAllowedEmailDomain && WranglerAllowedEmailDomain !== '') {
                allowedEmailDomains = WranglerAllowedEmailDomain?.split(',') || [];
            }

            if (permittedUsers.length > 0 && !userRoles.includes('system_admin')) {
                const roles = userRoles.split(' ');
                const hasRole = roles.some((role) => permittedUsers.includes(role));
                if (!hasRole) {
                    return false;
                }
            }

            if (allowedEmailDomains?.length > 0) {
                if (!user.email || !allowedEmailDomains.includes(user.email.split('@')[1])) {
                    return false;
                }
            }

            if (Number(WranglerMoveThreadMaxCount) < replyCount) {
                return false;
            }

            if (channelType === 'P' && WranglerMoveThreadFromPrivateChannelEnable === 'false') {
                return false;
            }

            if (channelType === 'D' && WranglerMoveThreadFromDirectMessageChannelEnable === 'false') {
                return false;
            }

            if (channelType === 'G' && WranglerMoveThreadFromGroupMessageChannelEnable === 'false') {
                return false;
            }

            return true;
        },
    );
}
