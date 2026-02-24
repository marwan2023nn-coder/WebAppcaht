// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {savePreferences} from 'workspace-redux/actions/preferences';
import {getVisibleDmGmLimit} from 'workspace-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'workspace-redux/selectors/entities/users';

import type {GlobalState} from 'types/store';

import type {OwnProps} from './limit_visible_gms_dms';
import LimitVisibleGMsDMs from './limit_visible_gms_dms';

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const userPreferences = ownProps.adminMode && ownProps.userPreferences ? ownProps.userPreferences : undefined;
    return {
        userId: ownProps.adminMode ? ownProps.userId : getCurrentUserId(state),
        dmGmLimit: getVisibleDmGmLimit(state, userPreferences),
    };
}

const mapDispatchToProps = {
    savePreferences,
};

export default connect(mapStateToProps, mapDispatchToProps)(LimitVisibleGMsDMs);
