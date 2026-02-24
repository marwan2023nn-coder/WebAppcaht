// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {getStandardAnalytics} from 'workspace-redux/actions/admin';
import {getCloudSubscription, getCloudCustomer} from 'workspace-redux/actions/cloud';
import {dismissError} from 'workspace-redux/actions/errors';
import {Permissions} from 'workspace-redux/constants';
import {getConfig, getLicense} from 'workspace-redux/selectors/entities/general';
import {haveISystemPermission} from 'workspace-redux/selectors/entities/roles';
import {isCurrentUserSystemAdmin} from 'workspace-redux/selectors/entities/users';
import {getDisplayableErrors} from 'workspace-redux/selectors/errors';

import {dismissNotice} from 'actions/views/notice';

import type {GlobalState} from 'types/store';

import AnnouncementBarController from './announcement_bar_controller';

function mapStateToProps(state: GlobalState) {
    const canViewSystemErrors = haveISystemPermission(state, {permission: Permissions.MANAGE_SYSTEM});
    const license = getLicense(state);
    const config = getConfig(state);
    const errors = getDisplayableErrors(state);
    const isCloud = license.Cloud === 'true';
    const subscription = state.entities.cloud?.subscription;
    const userIsAdmin = isCurrentUserSystemAdmin(state);

    let latestError = null;
    if (errors && errors.length >= 1) {
        latestError = errors[0];
    }

    return {
        license,
        config,
        canViewSystemErrors,
        latestError,
        isCloud,
        subscription,
        userIsAdmin,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    const dismissFirstError = dismissError.bind(null, 0);
    return {
        actions: bindActionCreators({
            getStandardAnalytics,
            dismissError: dismissFirstError,
            dismissNotice,
            getCloudSubscription,
            getCloudCustomer,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AnnouncementBarController);
