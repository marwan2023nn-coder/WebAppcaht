// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'workspace-redux/selectors/entities/general';

import type {GlobalState} from 'types/store';

import PremadeThemeChooser from './premade_theme_chooser';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    const allowedThemes = (config.AllowedThemes && config.AllowedThemes.split(',')) || [];

    return {
        allowedThemes,
    };
}

export default connect(mapStateToProps)(PremadeThemeChooser);
