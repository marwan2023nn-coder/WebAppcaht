// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'workspace-redux/selectors/entities/general';

import type {GlobalState} from 'types/store';

import ExternalImage from './external_image';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    return {
        enableSVGs: config.EnableSVGs === 'true',
        hasImageProxy: config.HasImageProxy === 'true',
    };
}

export default connect(mapStateToProps)(ExternalImage);
