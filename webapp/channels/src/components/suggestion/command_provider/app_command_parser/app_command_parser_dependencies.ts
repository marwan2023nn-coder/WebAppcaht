// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Channel} from '@workspace/types/channels';
import type {AutocompleteSuggestion} from '@workspace/types/integrations';
import type {UserProfile} from '@workspace/types/users';

import {sendEphemeralPost} from 'actions/global_actions';
import reduxStore from 'stores/redux_store';

import {Constants} from 'utils/constants';
import {isMac} from 'utils/user_agent';
import {localizeAndFormatMessage} from 'utils/utils';

import type {ParsedCommand} from './app_command_parser';

export type {
    AppCall,
    AppCallRequest,
    AppCallValues,
    AppBinding,
    AppField,
    AppContext,
    AppForm,
    AutocompleteElement,
    AutocompleteDynamicSelect,
    AutocompleteStaticSelect,
    AutocompleteUserSelect,
    AutocompleteChannelSelect,
    AppLookupResponse,
    AppSelectOption,
} from '@workspace/types/apps';

export type {
    DoAppCallResult,
} from 'types/apps';

export type {AutocompleteSuggestion};

export type {Channel};

export type {UserAutocomplete} from '@workspace/types/autocomplete';

export type {UserProfile};

export {
    AppBindingLocations,
    AppFieldTypes,
    AppCallResponseTypes,
} from 'workspace-redux/constants/apps';

export {autocompleteUsersInChannel} from 'actions/views/channel';

export {makeAppBindingsSelector, makeRHSAppBindingSelector, getAppCommandForm, getAppRHSCommandForm} from 'workspace-redux/selectors/entities/apps';

export {getPost} from 'workspace-redux/selectors/entities/posts';
export {getChannel as selectChannel, getCurrentChannel, getChannelByName as selectChannelByName} from 'workspace-redux/selectors/entities/channels';
export {getCurrentTeamId, getCurrentTeam} from 'workspace-redux/selectors/entities/teams';
export {getUserByUsername as selectUserByUsername, getUser as selectUser} from 'workspace-redux/selectors/entities/users';

export {getUserByUsername, getUser} from 'workspace-redux/actions/users';
export {getChannelByNameAndTeamName, getChannel, autocompleteChannels} from 'workspace-redux/actions/channels';

export {doAppFetchForm, doAppLookup} from 'actions/apps';

export {
    createCallRequest,
    filterEmptyOptions,
} from 'utils/apps';

export const getStore = () => reduxStore;

export {getChannelSuggestions, getUserSuggestions, inTextMentionSuggestions} from '../mentions';

export const EXECUTE_CURRENT_COMMAND_ITEM_ID = Constants.Integrations.EXECUTE_CURRENT_COMMAND_ITEM_ID;
export const OPEN_COMMAND_IN_MODAL_ITEM_ID = Constants.Integrations.OPEN_COMMAND_IN_MODAL_ITEM_ID;
export const COMMAND_SUGGESTION_ERROR = Constants.Integrations.COMMAND_SUGGESTION_ERROR;
export const COMMAND_SUGGESTION_CHANNEL = Constants.Integrations.COMMAND_SUGGESTION_CHANNEL;
export const COMMAND_SUGGESTION_USER = Constants.Integrations.COMMAND_SUGGESTION_USER;

export {AppsTypes} from 'workspace-redux/action_types';

export const getExecuteSuggestion = (parsed: ParsedCommand): AutocompleteSuggestion | null => {
    let key = 'Ctrl';
    if (isMac()) {
        key = '⌘';
    }

    return {
        Complete: parsed.command.substring(1) + EXECUTE_CURRENT_COMMAND_ITEM_ID,
        Suggestion: 'Execute Current Command',
        Hint: '',
        Description: 'Select this option or use ' + key + '+Enter to execute the current command.',
        IconData: EXECUTE_CURRENT_COMMAND_ITEM_ID,
    };
};

export const getOpenInModalSuggestion = (parsed: ParsedCommand): AutocompleteSuggestion | null => {
    return {
        Complete: parsed.command.substring(1) + OPEN_COMMAND_IN_MODAL_ITEM_ID,
        Suggestion: 'Open in modal',
        Hint: '',
        Description: 'Select this option to open the current command in a modal.',
        IconData: OPEN_COMMAND_IN_MODAL_ITEM_ID,
    };
};

export type ExtendedAutocompleteSuggestion = AutocompleteSuggestion & {
    item?: UserProfile | Channel;
}

export const displayError = (err: string, channelID: string, rootID?: string) => {
    reduxStore.dispatch(sendEphemeralPost(err, channelID, rootID));
};

// Shim of mobile-version intl
export const intlShim = {
    formatMessage: (config: {id: string; defaultMessage?: string}, values?: {[name: string]: any}) => {
        return localizeAndFormatMessage(config, values);
    },
};

export const errorMessage = (intl: typeof intlShim, error: string, _command: string, _position: number): string => { // eslint-disable-line @typescript-eslint/no-unused-vars
    return intl.formatMessage({
        id: 'apps.error.parser',
        defaultMessage: 'Parsing error: {error}',
    }, {
        error,
    });
};
