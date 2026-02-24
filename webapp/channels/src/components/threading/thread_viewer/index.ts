// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {Channel} from '@workspace/types/channels';
import type {ClientConfig} from '@workspace/types/config';
import type {UserThread} from '@workspace/types/threads';

import {fetchRHSAppsBindings} from 'workspace-redux/actions/apps';
import {getNewestPostThread, getPostThread} from 'workspace-redux/actions/posts';
import {getThread as fetchThread, updateThreadRead} from 'workspace-redux/actions/threads';
import {appsEnabled} from 'workspace-redux/selectors/entities/apps';
import {makeGetChannel} from 'workspace-redux/selectors/entities/channels';
import {getConfig} from 'workspace-redux/selectors/entities/general';
import {getPost, makeGetPostIdsForThread} from 'workspace-redux/selectors/entities/posts';
import {isCollapsedThreadsEnabled} from 'workspace-redux/selectors/entities/preferences';
import {getCurrentTeamId} from 'workspace-redux/selectors/entities/teams';
import {getThread} from 'workspace-redux/selectors/entities/threads';
import {getCurrentUserId} from 'workspace-redux/selectors/entities/users';

import {selectPostCard} from 'actions/views/rhs';
import {updateThreadLastOpened, updateThreadLastUpdateAt} from 'actions/views/threads';
import {getHighlightedPostId, getSelectedPostFocussedAt} from 'selectors/rhs';
import {getThreadLastUpdateAt} from 'selectors/views/threads';
import {getSocketStatus} from 'selectors/views/websocket';

import type {GlobalState} from 'types/store';

import ThreadViewer from './thread_viewer';

type OwnProps = {
    rootPostId: string;
};

function makeMapStateToProps() {
    const getPostIdsForThread = makeGetPostIdsForThread();
    const getChannel = makeGetChannel();

    return function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
        const currentUserId = getCurrentUserId(state);
        const currentTeamId = getCurrentTeamId(state);
        const selected = getPost(state, ownProps.rootPostId);
        const socketStatus = getSocketStatus(state);
        const highlightedPostId = getHighlightedPostId(state);
        const selectedPostFocusedAt = getSelectedPostFocussedAt(state);
        const config: Partial<ClientConfig> = getConfig(state);
        const enableWebSocketEventScope = config.FeatureFlagWebSocketEventScope === 'true';

        let postIds: string[] = [];
        let userThread: UserThread | null = null;
        let channel: Channel | undefined;
        let lastUpdateAt: number = 0;

        if (selected) {
            postIds = getPostIdsForThread(state, selected.id);
            userThread = getThread(state, selected.id);
            channel = getChannel(state, selected.channel_id);
            lastUpdateAt = getThreadLastUpdateAt(state, selected.id);
        }

        return {
            isCollapsedThreadsEnabled: isCollapsedThreadsEnabled(state),
            appsEnabled: appsEnabled(state),
            currentUserId,
            currentTeamId,
            userThread,
            selected,
            postIds,
            socketConnectionStatus: socketStatus.connected,
            channel,
            highlightedPostId,
            selectedPostFocusedAt,
            enableWebSocketEventScope,
            lastUpdateAt,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            fetchRHSAppsBindings,
            getNewestPostThread,
            getPostThread,
            getThread: fetchThread,
            selectPostCard,
            updateThreadLastOpened,
            updateThreadRead,
            updateThreadLastUpdateAt,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(ThreadViewer);
