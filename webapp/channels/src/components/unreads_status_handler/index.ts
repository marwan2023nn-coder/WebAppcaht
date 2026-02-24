// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Location} from 'history';
import {connect} from 'react-redux';
import {withRouter, matchPath} from 'react-router-dom';

import type {GlobalState} from '@workspace/types/store';

import {getCurrentChannel, getUnreadStatus} from 'workspace-redux/selectors/entities/channels';
import {getConfig} from 'workspace-redux/selectors/entities/general';
import {getCurrentTeam} from 'workspace-redux/selectors/entities/teams';

import UnreadsStatusHandler from './unreads_status_handler';

type Props = {location: Location};

function mapStateToProps(state: GlobalState, {location: {pathname}}: Props) {
    const config = getConfig(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeammate = (currentChannel && currentChannel.teammate_id) ? currentChannel : null;
    const currentTeam = getCurrentTeam(state);

    return {
        currentChannel,
        currentTeam,
        currentTeammate,
        siteName: config.SiteName,
        unreadStatus: getUnreadStatus(state),
        inGlobalThreads: matchPath(pathname, {path: '/:team/threads/:threadIdentifier?'}) != null,
        inDrafts: matchPath(pathname, {path: '/:team/drafts'}) != null,
        inScheduledPosts: matchPath(pathname, {path: '/:team/scheduled_posts'}) != null,
    };
}

export default withRouter(connect(mapStateToProps)(UnreadsStatusHandler));
