// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {GlobalState} from '@workspace/types/store';

import {getCurrentChannel} from 'workspace-redux/selectors/entities/channels';
import {getCurrentTeam} from 'workspace-redux/selectors/entities/teams';
import {getCurrentUserId} from 'workspace-redux/selectors/entities/users';

import {focusPost} from './actions';
import PermalinkView from './permalink_view';

function mapStateToProps(state: GlobalState) {
    const team = getCurrentTeam(state);
    const channel = getCurrentChannel(state);
    const currentUserId = getCurrentUserId(state);
    const channelId = channel ? channel.id : '';
    const teamName = team ? team.name : '';

    return {
        channelId,
        teamName,
        currentUserId,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            focusPost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PermalinkView);
