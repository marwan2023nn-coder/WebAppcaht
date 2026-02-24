// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {Bot as BotType} from '@workspace/types/bots';
import type {GlobalState} from '@workspace/types/store';
import type {UserProfile} from '@workspace/types/users';

import {loadBots, disableBot, enableBot} from 'workspace-redux/actions/bots';
import {getAppsBotIDs as fetchAppsBotIDs} from 'workspace-redux/actions/integrations';
import {createUserAccessToken, revokeUserAccessToken, enableUserAccessToken, disableUserAccessToken, getUserAccessTokensForUser, getUser} from 'workspace-redux/actions/users';
import {appsEnabled} from 'workspace-redux/selectors/entities/apps';
import {getExternalBotAccounts} from 'workspace-redux/selectors/entities/bots';
import {getConfig} from 'workspace-redux/selectors/entities/general';
import {getAppsBotIDs} from 'workspace-redux/selectors/entities/integrations';
import * as UserSelectors from 'workspace-redux/selectors/entities/users';

import Bots from './bots';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const createBots = config.EnableBotAccountCreation === 'true';
    const bots = getExternalBotAccounts(state);
    const botValues = Object.values(bots);
    const owners = botValues.
        reduce((result: Record<string, UserProfile>, bot: BotType) => {
            result[bot.user_id] = UserSelectors.getUser(state, bot.owner_id);
            return result;
        }, {});
    const users = botValues.
        reduce((result: Record<string, UserProfile>, bot: BotType) => {
            result[bot.user_id] = UserSelectors.getUser(state, bot.user_id);
            return result;
        }, {});

    return {
        createBots,
        bots,
        accessTokens: state.entities.admin.userAccessTokensByUser,
        owners,
        users,
        appsBotIDs: getAppsBotIDs(state),
        appsEnabled: appsEnabled(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            fetchAppsBotIDs,
            loadBots,
            getUserAccessTokensForUser,
            createUserAccessToken,
            revokeUserAccessToken,
            enableUserAccessToken,
            disableUserAccessToken,
            getUser,
            disableBot,
            enableBot,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Bots);
