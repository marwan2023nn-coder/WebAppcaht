// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {saveTheme, deleteTeamSpecificThemes} from 'workspace-redux/actions/preferences';
import {getTheme, getThemePreferences, getThemeForUser} from 'workspace-redux/selectors/entities/preferences';
import {getCurrentTeamId, getMyTeamsCount, getTeamsCountForUser} from 'workspace-redux/selectors/entities/teams';

import {openModal} from 'actions/views/modals';

import type {GlobalState} from 'types/store';

import type {OwnProps} from './user_settings_theme';
import UserSettingsTheme from './user_settings_theme';

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const userId = ownProps.adminMode && ownProps.user ? ownProps.user.id : '';
    const theme = userId ? getThemeForUser(state, userId, ownProps.userPreferences) : getTheme(state);
    const themePreferences = getThemePreferences(state, userId);

    const teamsCount = userId ? getTeamsCountForUser(state, userId) : getMyTeamsCount(state);

    return {
        currentTeamId: getCurrentTeamId(state),
        theme,
        applyToAllTeams: themePreferences.length <= 1,
        showAllTeamsCheckbox: teamsCount > 1,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            saveTheme,
            deleteTeamSpecificThemes,
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsTheme);
