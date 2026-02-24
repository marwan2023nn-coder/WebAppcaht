// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {moveCategory} from 'workspace-redux/actions/channel_categories';
import {getCurrentChannelId, getUnreadChannelIds} from 'workspace-redux/selectors/entities/channels';
import {shouldShowUnreadsCategory, isCollapsedThreadsEnabled} from 'workspace-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'workspace-redux/selectors/entities/teams';
import {getThreadCountsInCurrentTeam} from 'workspace-redux/selectors/entities/threads';

import {switchToChannelById} from 'actions/views/channel';
import {
    moveChannelsInSidebar,
    setDraggingState,
    stopDragging,
    clearChannelSelection,
} from 'actions/views/channel_sidebar';
import {close, switchToLhsStaticPage} from 'actions/views/lhs';
import {getCurrentStaticPageId, getVisibleStaticPages} from 'selectors/lhs';
import {
    getDisplayedChannels,
    getDraggingState,
    getCategoriesForCurrentTeam,
    isUnreadFilterEnabled,
} from 'selectors/views/channel_sidebar';
import {getIsMobileView} from 'selectors/views/browser';

import type {ChannelCategory} from '@workspace/types/channel_categories';
import type {GlobalState} from 'types/store';

import SidebarList from './sidebar_list';

function mapStateToProps(state: GlobalState, ownProps: {categories?: ChannelCategory[]}) {
    const currentTeam = getCurrentTeam(state);
    const collapsedThreads = isCollapsedThreadsEnabled(state);

    let hasUnreadThreads = false;
    if (collapsedThreads) {
        hasUnreadThreads = Boolean(getThreadCountsInCurrentTeam(state)?.total_unread_threads);
    }

    return {
        isMobileView: getIsMobileView(state),
        currentTeam,
        currentChannelId: getCurrentChannelId(state),
        categories: ownProps.categories || getCategoriesForCurrentTeam(state),
        isUnreadFilterEnabled: isUnreadFilterEnabled(state),
        unreadChannelIds: getUnreadChannelIds(state),
        displayedChannels: getDisplayedChannels(state),
        draggingState: getDraggingState(state),
        newCategoryIds: state.views.channelSidebar.newCategoryIds,
        multiSelectedChannelIds: state.views.channelSidebar.multiSelectedChannelIds,
        showUnreadsCategory: shouldShowUnreadsCategory(state),
        collapsedThreads,
        hasUnreadThreads,
        currentStaticPageId: getCurrentStaticPageId(state),
        staticPages: getVisibleStaticPages(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            close,
            switchToChannelById,
            moveChannelsInSidebar,
            moveCategory,
            setDraggingState,
            stopDragging,
            clearChannelSelection,
            switchToLhsStaticPage,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarList);
