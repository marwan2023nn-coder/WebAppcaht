// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import type {Agent} from '@workspace/types/agents';

import type {MMReduxAction} from 'workspace-redux/action_types';

import {AgentTypes} from '../../action_types';

export interface AgentsState {
    agents: Agent[];
}

function agents(state: Agent[] = [], action: MMReduxAction): Agent[] {
    switch (action.type) {
    case AgentTypes.RECEIVED_AGENTS:
        return action.data || [];
    case AgentTypes.AGENTS_FAILURE:
        return [];
    default:
        return state;
    }
}

export default combineReducers({
    agents,
});
