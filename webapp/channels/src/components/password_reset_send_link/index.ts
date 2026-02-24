// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {sendPasswordResetEmail} from 'workspace-redux/actions/users';
import {getConfig} from 'workspace-redux/selectors/entities/general';

import type {GlobalState} from 'types/store';

import PasswordResetSendLink from './password_reset_send_link';

function mapStateToProps(state: GlobalState) {
    return {siteName: getConfig(state).SiteName};
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        sendPasswordResetEmail,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PasswordResetSendLink);
