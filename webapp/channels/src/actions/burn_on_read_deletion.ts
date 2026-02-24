// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PostTypes} from 'workspace-redux/action_types';
import {forceLogoutIfNecessary} from 'workspace-redux/actions/helpers';
import {Client4} from 'workspace-redux/client';
import {getPost} from 'workspace-redux/selectors/entities/posts';

import type {DispatchFunc, GetStateFunc, ActionFuncAsync} from 'types/store';

function removePostFromState(postId: string, dispatch: DispatchFunc, getState: GetStateFunc): boolean {
    const state = getState();
    const post = getPost(state, postId);

    if (!post) {
        return true;
    }

    dispatch({
        type: PostTypes.POST_REMOVED,
        data: post,
    });

    return true;
}

export function burnPostNow(postId: string): ActionFuncAsync<boolean> {
    return async (dispatch, getState) => {
        try {
            await Client4.burnPostNow(postId);

            const removed = removePostFromState(postId, dispatch, getState);
            return {data: removed};
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            return {error};
        }
    };
}

export function handlePostExpired(postId: string): ActionFuncAsync<boolean> {
    return async (dispatch, getState) => {
        const removed = removePostFromState(postId, dispatch, getState);
        return {data: removed};
    };
}
