// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {defineMessage} from 'react-intl';

import type {UserAutocomplete} from '@workspace/types/autocomplete';
import type {UserProfile} from '@workspace/types/users';

import SharedUserIndicator from 'components/shared_user_indicator';
import BotTag from 'components/widgets/tag/bot_tag';
import Avatar from 'components/widgets/users/avatar';

import * as Utils from 'utils/utils';

import Provider from './provider';
import type {ResultsCallback} from './provider';
import {SuggestionContainer} from './suggestion';
import type {SuggestionProps} from './suggestion';

export const SearchUserSuggestion = React.forwardRef<HTMLLIElement, SuggestionProps<UserProfile>>((props, ref) => {
    const {item} = props;

    const username = item.username;
    const fullName = Utils.getFullName(item).trim();
    const nickname = (item.nickname || '').trim();
    const hasName = Boolean(fullName);

    const mainText = hasName ? fullName : `@${username}`;
    let description = '';
    if (hasName && nickname) {
        description = ` (${nickname})`;
    } else if (!hasName && nickname) {
        description = ` (${nickname})`;
    }

    let sharedIcon;
    if (item.remote_id) {
        sharedIcon = (
            <SharedUserIndicator
                className='mention__shared-user-icon'
            />
        );
    }

    return (
        <SuggestionContainer
            ref={ref}
            {...props}
        >
            <Avatar
                size='sm'
                username={username}
                url={Utils.imageURLForUser(item.id, item.last_picture_update)}
                alt=''
            />
            <div className='suggestion-list__ellipsis'>
                <span className='suggestion-list__main'>
                    {mainText}
                </span>
                {item.is_bot && <BotTag/>}
                {description}
            </div>
            {sharedIcon}
        </SuggestionContainer>
    );
});
SearchUserSuggestion.displayName = 'SearchUserSuggestion';

export default class SearchUserProvider extends Provider {
    private autocompleteUsersInTeam: (username: string, teamId: string) => Promise<UserAutocomplete>;
    constructor(userSearchFunc: (username: string, teamId: string) => Promise<UserAutocomplete>) {
        super();
        this.autocompleteUsersInTeam = userSearchFunc;
    }

    handlePretextChanged(pretext: string, resultsCallback: ResultsCallback<UserProfile>, teamId: string) {
        // no autocomplete on All teams
        if (teamId === '') {
            return false;
        }

        const captured = (/\b(?:from|من):\s*(\S*)$/i).exec(pretext.toLowerCase());

        this.doAutocomplete(captured, teamId, resultsCallback);

        return Boolean(captured);
    }

    async doAutocomplete(captured: RegExpExecArray | null, teamId: string, resultsCallback: ResultsCallback<UserProfile>) {
        if (!captured) {
            return;
        }

        const usernamePrefix = captured[1];

        this.startNewRequest(usernamePrefix);

        const data = await this.autocompleteUsersInTeam(usernamePrefix, teamId);

        if (this.shouldCancelDispatch(usernamePrefix)) {
            return;
        }

        const users = Object.assign([], data.users);
        const mentions = users.map((user: UserProfile) => user.username);

        resultsCallback({
            matchedPretext: usernamePrefix,
            groups: [{
                key: 'users',
                label: defineMessage({
                    id: 'suggestion.users',
                    defaultMessage: 'Users',
                }),
                terms: mentions,
                items: users,
                component: SearchUserSuggestion,
            }],
        });
    }

    allowDividers() {
        return true;
    }
}
