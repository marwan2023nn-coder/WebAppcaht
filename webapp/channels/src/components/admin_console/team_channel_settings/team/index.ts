// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import type {GlobalState} from '@workspace/types/store';

import {getConfig} from 'workspace-redux/selectors/entities/general';

import {TeamsSettings} from './team_settings';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const siteName = config.SiteName as string;

    return {
        siteName,
    };
}

export default connect(mapStateToProps)(TeamsSettings);
