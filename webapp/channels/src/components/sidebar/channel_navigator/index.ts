// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {shouldShowUnreadsCategory} from 'workspace-redux/selectors/entities/preferences';

import type {GlobalState} from 'types/store';

import ChannelNavigator from './channel_navigator';

function mapStateToProps(state: GlobalState) {
    return {
        showUnreadsCategory: shouldShowUnreadsCategory(state),
    };
}

export default connect(mapStateToProps)(ChannelNavigator);
