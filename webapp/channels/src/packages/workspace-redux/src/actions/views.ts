// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ViewTypes} from 'workspace-redux/action_types';
import {Client4} from 'workspace-redux/client';
import type {ActionFunc} from 'workspace-redux/types/actions';
import type {View, ViewPatch} from '@workspace/types/views';

export function createView(channelId: string, view: Partial<View>): ActionFunc {
    return async (dispatch, getState) => {
        let created;
        try {
            created = await Client4.createView(channelId, view, '');
        } catch (error) {
            return {error};
        }

        dispatch({
            type: ViewTypes.RECEIVED_VIEW,
            data: created,
        });

        return {data: created};
    };
}

export function getViewsForChannel(channelId: string): ActionFunc {
    return async (dispatch) => {
        let views;
        try {
            views = await Client4.getViewsForChannel(channelId);
        } catch (error) {
            return {error};
        }

        dispatch({
            type: ViewTypes.RECEIVED_VIEWS_FOR_CHANNEL,
            data: views,
        });

        return {data: views};
    };
}

export function patchView(channelId: string, viewId: string, patch: ViewPatch): ActionFunc {
    return async (dispatch) => {
        let updated;
        try {
            updated = await Client4.patchView(channelId, viewId, patch, '');
        } catch (error) {
            return {error};
        }

        dispatch({
            type: ViewTypes.RECEIVED_VIEW,
            data: updated,
        });

        return {data: updated};
    };
}

export function deleteView(channelId: string, viewId: string): ActionFunc {
    return async (dispatch) => {
        try {
            await Client4.deleteView(channelId, viewId, '');
        } catch (error) {
            return {error};
        }

        dispatch({
            type: ViewTypes.VIEW_DELETED,
            data: {viewId, channelId},
        });

        return {data: true};
    };
}
