// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'workspace-redux/selectors/entities/general';

import type {GlobalState} from 'types/store';

import FileThumbnail from './file_thumbnail';

function mapStateToProps(state: GlobalState) {
    return {
        enableSVGs: getConfig(state).EnableSVGs === 'true',
    };
}

export default connect(mapStateToProps)(FileThumbnail);
