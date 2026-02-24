// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {Preferences} from 'workspace-redux/constants';
import {getFeatureFlagValue} from 'workspace-redux/selectors/entities/general';
import {getTheme, getBool} from 'workspace-redux/selectors/entities/preferences';
import {getCurrentRelativeTeamUrl} from 'workspace-redux/selectors/entities/teams';

import {getIsRhsExpanded, getIsRhsOpen} from 'selectors/rhs';

import type {GlobalState} from 'types/store';

import PostMessageView from './post_message_view';

function mapStateToProps(state: GlobalState) {
    return {
        enableFormatting: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'formatting', true),
        isRHSExpanded: getIsRhsExpanded(state),
        isRHSOpen: getIsRhsOpen(state),
        pluginPostTypes: state.plugins.postTypes,
        theme: getTheme(state),
        currentRelativeTeamUrl: getCurrentRelativeTeamUrl(state),
        sharedChannelsPluginsEnabled: getFeatureFlagValue(state, 'EnableSharedChannelsPlugins') === 'true',
    };
}

export default connect(mapStateToProps)(PostMessageView);
