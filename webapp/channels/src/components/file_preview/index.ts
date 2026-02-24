// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getConfig} from 'workspace-redux/selectors/entities/general';

import {openModal} from 'actions/views/modals';

import type {GlobalState} from 'types/store';

import FilePreview from './file_preview';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    return {
        enableSVGs: config.EnableSVGs === 'true',
    };
}

function mapDispatchToProps(dispatch: (action: any) => void) {
    return {
        actions: bindActionCreators({openModal}, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilePreview);
