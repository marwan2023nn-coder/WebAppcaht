// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import type {GlobalState} from '@workspace/types/store';

import {getCurrentRelativeTeamUrl} from 'workspace-redux/selectors/entities/teams';

import EmbeddedBinding from './embedded_binding';

function mapStateToProps(state: GlobalState) {
    return {
        currentRelativeTeamUrl: getCurrentRelativeTeamUrl(state),
    };
}

export default connect(mapStateToProps)(EmbeddedBinding);
