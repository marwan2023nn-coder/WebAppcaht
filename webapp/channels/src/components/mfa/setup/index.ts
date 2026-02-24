// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {GlobalState} from '@workspace/types/store';

import {getConfig} from 'workspace-redux/selectors/entities/general';
import {getCurrentUser} from 'workspace-redux/selectors/entities/users';

import {activateMfa, generateMfaSecret} from 'actions/views/mfa';

import Setup from './setup';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    const siteName = config.SiteName;
    const enforceMultifactorAuthentication = config.EnforceMultifactorAuthentication === 'true';

    return {
        currentUser: getCurrentUser(state),
        siteName,
        enforceMultifactorAuthentication,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            activateMfa,
            generateMfaSecret,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Setup);
