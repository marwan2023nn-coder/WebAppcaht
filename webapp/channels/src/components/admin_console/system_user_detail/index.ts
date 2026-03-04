// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ConnectedProps} from 'react-redux';
import {connect} from 'react-redux';

import type {GlobalState} from '@workspace/types/store';

import {getCustomProfileAttributeFields} from 'workspace-redux/actions/general';
import {getUserPreferences} from 'workspace-redux/actions/preferences';
import {addUserToTeam} from 'workspace-redux/actions/teams';
import {updateUserActive, deleteUser, getUser, patchUser, updateUserMfa, getCustomProfileAttributeValues, saveCustomProfileAttribute} from 'workspace-redux/actions/users';
import {getConfig, getCustomProfileAttributes} from 'workspace-redux/selectors/entities/general';

import {setNavigationBlocked} from 'actions/admin_actions.jsx';
import {openModal} from 'actions/views/modals';
import {getShowLockedManageUserSettings, getShowManageUserSettings} from 'selectors/admin_console';

import SystemUserDetail from './system_user_detail';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const customProfileAttributeFields = Object.values(getCustomProfileAttributes(state));

    const showManageUserSettings = getShowManageUserSettings(state);
    const showLockedManageUserSettings = getShowLockedManageUserSettings(state);

    return {
        mfaEnabled: config?.EnableMultifactorAuthentication === 'true' || false,
        customProfileAttributeFields,
        showManageUserSettings,
        showLockedManageUserSettings,
    };
}

const mapDispatchToProps = {
    getUser,
    patchUser,
    updateUserActive,
    deleteUser,
    updateUserMfa,
    addUserToTeam,
    setNavigationBlocked,
    openModal,
    getUserPreferences,
    getCustomProfileAttributeFields,
    getCustomProfileAttributeValues,
    saveCustomProfileAttribute,
};
const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;
export default connector(SystemUserDetail);
