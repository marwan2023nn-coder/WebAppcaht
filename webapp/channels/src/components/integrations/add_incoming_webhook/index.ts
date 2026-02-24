// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {GlobalState} from '@workspace/types/store';

import {createIncomingHook} from 'workspace-redux/actions/integrations';
import {Permissions} from 'workspace-redux/constants';
import {getConfig} from 'workspace-redux/selectors/entities/general';
import {haveICurrentTeamPermission} from 'workspace-redux/selectors/entities/roles';

import AddIncomingWebhook from './add_incoming_webhook';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
    const enablePostIconOverride = config.EnablePostIconOverride === 'true';
    const canBypassChannelLock = haveICurrentTeamPermission(state, Permissions.BYPASS_INCOMING_WEBHOOK_CHANNEL_LOCK);

    return {
        enablePostUsernameOverride,
        enablePostIconOverride,
        canBypassChannelLock,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            createIncomingHook,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddIncomingWebhook);
