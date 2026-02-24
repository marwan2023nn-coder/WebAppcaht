// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Bot} from '@workspace/types/bots';
import type {GlobalState} from '@workspace/types/store';

import {createSelector} from 'workspace-redux/selectors/create_selector';
import {getUsers} from 'workspace-redux/selectors/entities/common';

export const ExternalBotAccountNames: string[] = ['workspace-advisor'];

export function getBotAccounts(state: GlobalState) {
    return state.entities.bots.accounts;
}

export const getExternalBotAccounts: (state: GlobalState) => Record<string, Bot> = createSelector(
    'getExternalBotAccounts',
    getBotAccounts,
    getUsers,
    (botAccounts, userProfiles) => {
        const nextState: Record<string, Bot> = {};
        Object.values(botAccounts).forEach((botAccount) => {
            const botUser = userProfiles[botAccount.user_id];
            if (botUser && !ExternalBotAccountNames.includes(botUser.username)) {
                nextState[botAccount.user_id] = botAccount;
            }
        });

        return nextState;
    },
);
