// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type { Post } from '@workspace/types/posts';

import { PostTypes } from 'workspace-redux/action_types';
import { logError } from 'workspace-redux/actions/errors';
import { forceLogoutIfNecessary } from 'workspace-redux/actions/helpers';
import { Client4 } from 'workspace-redux/client';

import type { ActionFuncAsync } from 'types/store';

export function revealBurnOnReadPost(postId: string): ActionFuncAsync<Post> {
    return async (dispatch, getState) => {
        let revealedPost: Post;

        try {
            revealedPost = await Client4.revealBurnOnReadPost(postId);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return { error };
        }

        const expireAt = revealedPost.metadata?.expire_at;

        dispatch({
            type: PostTypes.REVEAL_BURN_ON_READ_SUCCESS,
            data: {
                post: revealedPost,
                expireAt: expireAt || 0,
            },
        });

        return { data: revealedPost };
    };
}

export function burnPostNow(postId: string): ActionFuncAsync {
    return async (dispatch, getState) => {
        try {
            await Client4.burnPostNow(postId);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return { error };
        }

        dispatch({
            type: PostTypes.POST_REMOVED,
            data: { id: postId },
        });

        return { data: true };
    };
}
