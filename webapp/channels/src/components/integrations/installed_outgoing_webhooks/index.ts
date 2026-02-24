// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import * as Actions from 'workspace-redux/actions/integrations';
import {Permissions} from 'workspace-redux/constants';
import {getAllChannels} from 'workspace-redux/selectors/entities/channels';
import {getConfig} from 'workspace-redux/selectors/entities/general';
import {getOutgoingHooks} from 'workspace-redux/selectors/entities/integrations';
import {haveITeamPermission} from 'workspace-redux/selectors/entities/roles';
import {getCurrentTeamId} from 'workspace-redux/selectors/entities/teams';
import {getUsers} from 'workspace-redux/selectors/entities/users';

import {loadOutgoingHooksAndProfilesForTeam} from 'actions/integration_actions';

import type {GlobalState} from 'types/store';

import InstalledOutgoingWebhook from './installed_outgoing_webhooks';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const teamId = getCurrentTeamId(state);
    const canManageOthersWebhooks = haveITeamPermission(state, teamId, Permissions.MANAGE_OTHERS_OUTGOING_WEBHOOKS);
    const outgoingHooks = getOutgoingHooks(state);
    const outgoingWebhooks = Object.keys(outgoingHooks).
        map((key) => outgoingHooks[key]).
        filter((outgoingWebhook) => outgoingWebhook.team_id === teamId);
    const enableOutgoingWebhooks = config.EnableOutgoingWebhooks === 'true';

    return {
        outgoingWebhooks,
        channels: getAllChannels(state),
        users: getUsers(state),
        teamId,
        canManageOthersWebhooks,
        enableOutgoingWebhooks,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            loadOutgoingHooksAndProfilesForTeam,
            removeOutgoingHook: Actions.removeOutgoingHook,
            regenOutgoingHookToken: Actions.regenOutgoingHookToken,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstalledOutgoingWebhook);
