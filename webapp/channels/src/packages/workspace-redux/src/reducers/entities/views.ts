// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import type {View, ViewsState} from '@workspace/types/views';

import type {GenericAction} from 'workspace-redux/types/actions';
import {ViewTypes, UserTypes} from 'workspace-redux/action_types';

function views(state: Record<string, View> = {}, action: GenericAction): Record<string, View> {
    switch (action.type) {
    case ViewTypes.RECEIVED_VIEWS_FOR_CHANNEL: {
        const nextState = {...state};
        for (const view of action.data) {
            nextState[view.id] = view;
        }
        return nextState;
    }
    case ViewTypes.RECEIVED_VIEW: {
        return {
            ...state,
            [action.data.id]: action.data,
        };
    }
    case ViewTypes.VIEW_DELETED: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data.viewId);
        return nextState;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function viewsByChannel(state: Record<string, string[]> = {}, action: GenericAction): Record<string, string[]> {
    switch (action.type) {
    case ViewTypes.RECEIVED_VIEWS_FOR_CHANNEL: {
        if (action.data.length === 0) {
            return state;
        }
        const channelId = action.data[0].channel_id;
        return {
            ...state,
            [channelId]: action.data.map((v: View) => v.id),
        };
    }
    case ViewTypes.RECEIVED_VIEW: {
        const view = action.data;
        const channelId = view.channel_id;
        const channelViews = state[channelId] || [];
        if (channelViews.includes(view.id)) {
            return state;
        }
        return {
            ...state,
            [channelId]: [...channelViews, view.id],
        };
    }
    case ViewTypes.VIEW_DELETED: {
        const {viewId, channelId} = action.data;
        if (!state[channelId]) {
            return state;
        }
        return {
            ...state,
            [channelId]: state[channelId].filter((id) => id !== viewId),
        };
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export default combineReducers({
    views,
    viewsByChannel,
});
