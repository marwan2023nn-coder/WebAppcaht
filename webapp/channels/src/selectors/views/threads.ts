// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import moment from 'moment';

import type {Post} from '@workspace/types/posts';
import type {Team} from '@workspace/types/teams';
import type {UserThread} from '@workspace/types/threads';

import {createSelector} from 'workspace-redux/selectors/create_selector';
import {getCurrentUser} from 'workspace-redux/selectors/entities/common';
import {makeGetPostsForIds} from 'workspace-redux/selectors/entities/posts';
import {getCurrentTeam, getCurrentTeamId} from 'workspace-redux/selectors/entities/teams';
import {getThreads} from 'workspace-redux/selectors/entities/threads';
import {createIdsSelector} from 'workspace-redux/utils/helpers';
import {DATE_LINE, makeCombineUserActivityPosts, START_OF_NEW_MESSAGES} from 'workspace-redux/utils/post_list';
import {getUserCurrentTimezone} from 'workspace-redux/utils/timezone_utils';

import {getIsRhsOpen, getSelectedPostId} from 'selectors/rhs';

import {isThreadPopoutWindow} from 'utils/popouts/popout_windows';
import {isFromWebhook} from 'utils/post_utils';

import type {GlobalState} from 'types/store';
import type {ViewsState} from 'types/store/views';

interface PostFilterOptions {
    postIds: Array<Post['id']>;
    showDate: boolean;
    lastViewedAt?: number;
}

export function getSelectedThreadIdInTeam(state: GlobalState): ViewsState['threads']['selectedThreadIdInTeam'] {
    return state.views.threads.selectedThreadIdInTeam;
}

export const getSelectedThreadIdInCurrentTeam: (state: GlobalState) => ViewsState['threads']['selectedThreadIdInTeam'][Team['id']] = createSelector(
    'getSelectedThreadIdInCurrentTeam',
    getCurrentTeamId,
    getSelectedThreadIdInTeam,
    (
        currentTeamId,
        selectedThreadIdInTeam,
    ) => {
        return selectedThreadIdInTeam?.[currentTeamId] ?? null;
    },
);

export const getSelectedThreadInCurrentTeam: (state: GlobalState) => UserThread | null = createSelector(
    'getSelectedThreadInCurrentTeam',
    getCurrentTeamId,
    getSelectedThreadIdInTeam,
    getThreads,
    (
        currentTeamId,
        selectedThreadIdInTeam,
        threads,
    ) => {
        const threadId = selectedThreadIdInTeam?.[currentTeamId];
        return threadId ? threads[threadId] : null;
    },
);

export function makeGetThreadLastViewedAt(): (state: GlobalState, threadId: Post['id']) => number {
    return createSelector(
        'makeGetThreadLastViewedAt',
        (state: GlobalState, threadId: Post['id']) => state.views.threads.lastViewedAt[threadId],
        getThreads,
        (_state, threadId) => threadId,
        (lastViewedAt, threads, threadId) => {
            if (typeof lastViewedAt === 'number') {
                return lastViewedAt;
            }

            return threads[threadId]?.last_viewed_at;
        },
    );
}

export const isThreadOpen = (state: GlobalState, threadId: UserThread['id']): boolean => {
    return (
        threadId === getSelectedThreadIdInCurrentTeam(state) ||
        (getIsRhsOpen(state) && threadId === getSelectedPostId(state)) ||
        isThreadPopoutWindow(getCurrentTeam(state)?.name || '', threadId)
    );
};

export const isThreadManuallyUnread = (state: GlobalState, threadId: UserThread['id']): boolean => {
    return state.views.threads.manuallyUnread[threadId] || false;
};

export const getThreadLastUpdateAt = (state: GlobalState, threadId: UserThread['id']): number => {
    return state.views.threads.lastUpdateAt[threadId] || 0;
};

// Returns a selector that, given the state and an object containing an array of postIds and an optional
// timestamp of when the channel was last read, returns a memoized array of postIds interspersed with
// day indicators, an optional new message indicator and create comment.
export function makeFilterRepliesAndAddSeparators() {
    const getPostsForIds = makeGetPostsForIds();

    return createIdsSelector(
        'makeFilterPostsAndAddSeparators',
        (state: GlobalState, {postIds}: PostFilterOptions) => getPostsForIds(state, postIds),
        (_state: GlobalState, {lastViewedAt}: PostFilterOptions) => lastViewedAt,
        (_state: GlobalState, {showDate}: PostFilterOptions) => showDate,
        getCurrentUser,
        (posts, lastViewedAt, showDate, currentUser) => {
            if (posts.length === 0 || !currentUser) {
                return [];
            }

            const out: string[] = [];
            let lastDate;
            let addedNewMessagesIndicator = false;

            // Iterating through the posts from oldest to newest
            for (let i = posts.length - 1; i >= 0; i--) {
                const post = posts[i];

                if (!post) {
                    continue;
                }

                if (showDate) {
                    // Push on a date header if the last post was on a different day than the current one
                    const postDate = new Date(post.create_at);
                    const currentOffset = postDate.getTimezoneOffset() * 60 * 1000;
                    const timezone = getUserCurrentTimezone(currentUser.timezone);
                    if (timezone) {
                        const zone = moment.tz.zone(timezone);
                        if (zone) {
                            const timezoneOffset = zone.utcOffset(post.create_at) * 60 * 1000;
                            postDate.setTime(post.create_at + (currentOffset - timezoneOffset));
                        }
                    }

                    if ((!lastDate || lastDate.toDateString() !== postDate.toDateString())) {
                        out.push(DATE_LINE + postDate.getTime());
                        lastDate = postDate;
                    }
                }

                if (
                    typeof lastViewedAt === 'number' &&
                    post.create_at >= lastViewedAt &&
                    (i < posts.length - 1) &&
                    (post.user_id !== currentUser.id || isFromWebhook(post)) &&
                    !addedNewMessagesIndicator
                ) {
                    out.push(START_OF_NEW_MESSAGES);
                    addedNewMessagesIndicator = true;
                }

                out.push(post.id);
            }

            // Flip it back to newest to oldest
            return out.reverse();
        },
    );
}

export function makePrepareReplyIdsForThreadViewer() {
    const filterRepliesAndAddSeparators = makeFilterRepliesAndAddSeparators();
    const combineUserActivityPosts = makeCombineUserActivityPosts();
    return (state: GlobalState, options: PostFilterOptions) => {
        const postIds = filterRepliesAndAddSeparators(state, options);
        return combineUserActivityPosts(state, postIds);
    };
}

export function getThreadToastStatus(state: GlobalState) {
    return state.views.threads.toastStatus;
}
