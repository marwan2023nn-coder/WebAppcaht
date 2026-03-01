// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {UserTypes} from 'workspace-redux/action_types';

import {ActionTypes} from 'utils/constants';

import type {MMAction} from 'types/store';
import type {ViewsState} from 'types/store/views';

const editingPostDefaultState: ViewsState['posts']['editingPost'] = {
    show: false,
    postId: '',
    refocusId: '',
    isRHS: false,
};

function editingPost(state: ViewsState['posts']['editingPost'] = editingPostDefaultState, action: MMAction) {
    switch (action.type) {
    case ActionTypes.TOGGLE_EDITING_POST: {
        if (action.data.show) {
            return {
                ...state,
                ...action.data,
            };
        }

        return editingPostDefaultState;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return editingPostDefaultState;
    default:
        return state;
    }
}

function menuActions(state: {[postId: string]: {[actionId: string]: {text: string; value: string}}} = {}, action: MMAction) {
    switch (action.type) {
    case ActionTypes.SELECT_ATTACHMENT_MENU_ACTION: {
        const nextState = {...state};
        if (nextState[action.data.postId]) {
            nextState[action.data.postId] = {
                ...nextState[action.data.postId],
                ...action.data.actions,
            };
        } else {
            nextState[action.data.postId] = action.data.actions;
        }
        return nextState;
    }
    case ActionTypes.REMOVE_POST:
    case ActionTypes.POST_DELETED: {
        if (!action.data || !state[action.data.id]) {
            return state;
        }
        const nextState = {...state};
        delete nextState[action.data.id];
        return nextState;
    }
    case TeamTypes.SELECT_TEAM: {
        return {};
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

const multiSelectDefaultState: ViewsState['posts']['multiSelect'] = {
    enabled: false,
    selectedPostIds: [],
};

function multiSelect(state: ViewsState['posts']['multiSelect'] = multiSelectDefaultState, action: MMAction) {
    switch (action.type) {
    case ActionTypes.SET_POST_MULTISELECT_MODE: {
        const enabled = Boolean(action.data?.enabled);
        if (!enabled) {
            return multiSelectDefaultState;
        }

        return {
            ...state,
            enabled,
        };
    }
    case ActionTypes.TOGGLE_MULTISELECT_POST: {
        if (!state.enabled) {
            return state;
        }

        const postId = action.data?.postId;
        if (!postId) {
            return state;
        }

        if (state.selectedPostIds.includes(postId)) {
            return {
                ...state,
                selectedPostIds: state.selectedPostIds.filter((id) => id !== postId),
            };
        }

        return {
            ...state,
            selectedPostIds: [...state.selectedPostIds, postId],
        };
    }
    case ActionTypes.CLEAR_MULTISELECT_POSTS:
        return {
            ...state,
            selectedPostIds: [],
        };
    case UserTypes.LOGOUT_SUCCESS:
        return multiSelectDefaultState;
    default:
        return state;
    }
}

export default combineReducers({
    editingPost,
    menuActions,
    multiSelect,
});
