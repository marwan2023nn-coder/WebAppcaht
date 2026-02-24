// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Post} from '@workspace/types/posts';

import {PostTypes} from 'workspace-redux/action_types';
import {getCurrentUserId} from 'workspace-redux/selectors/entities/users';

import type {DispatchFunc, GetStateFunc} from 'types/store';

export interface PostRevealedData {
    post?: string | Post;
    recipients?: string[];
}

export function handleBurnOnReadPostRevealed(data: PostRevealedData) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);

        let post;
        if (typeof data.post === 'string') {
            try {
                post = JSON.parse(data.post);
            } catch {
                return {data: false};
            }
        } else {
            post = data.post;
        }

        if (!post || !post.id) {
            return {data: false};
        }

        const existingPost = state.entities.posts.posts[post.id];
        if (!existingPost) {
            return {data: false};
        }

        if (existingPost.user_id === currentUserId && data.recipients) {
            dispatch({
                type: PostTypes.POST_RECIPIENTS_UPDATED,
                data: {
                    postId: post.id,
                    recipients: data.recipients,
                },
            });
        }

        if (existingPost.user_id !== currentUserId && post.message) {
            const expireAt = post.metadata?.expire_at || 0;
            dispatch({
                type: PostTypes.REVEAL_BURN_ON_READ_SUCCESS,
                data: {
                    post,
                    expireAt,
                },
            });
        }

        return {data: true};
    };
}

export interface AllRevealedData {
    post_id: string;
    sender_expire_at: number;
}

export function handleBurnOnReadAllRevealed(data: AllRevealedData) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const {post_id: postId, sender_expire_at: senderExpireAt} = data;

        if (!postId || !senderExpireAt) {
            return {data: false};
        }

        const post = state.entities.posts.posts[postId];
        if (!post) {
            return {data: false};
        }

        dispatch({
            type: PostTypes.BURN_ON_READ_ALL_REVEALED,
            data: {
                postId,
                senderExpireAt,
            },
        });

        return {data: true};
    };
}
