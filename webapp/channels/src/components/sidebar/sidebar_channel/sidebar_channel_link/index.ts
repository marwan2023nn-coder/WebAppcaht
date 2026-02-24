// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {Channel} from '@workspace/types/channels';

import {getCustomEmojisInText} from 'workspace-redux/actions/emojis';
import {fetchChannelRemotes} from 'workspace-redux/actions/shared_channels';
import {makeGetChannelUnreadCount} from 'workspace-redux/selectors/entities/channels';
import {makeGetFilesForPost} from 'workspace-redux/selectors/entities/files';
import {getMostRecentPostIdInChannel, getPost} from 'workspace-redux/selectors/entities/posts';
import {getCurrentUserId, getMyChannelMemberships} from 'workspace-redux/selectors/entities/common';
import {getConfig} from 'workspace-redux/selectors/entities/general';
import {getInt} from 'workspace-redux/selectors/entities/preferences';
import {getRemoteNamesForChannel} from 'workspace-redux/selectors/entities/shared_channels';
import {isChannelMuted} from 'workspace-redux/utils/channel_utils';

import {markMostRecentPostInChannelAsUnread, unsetEditingPost} from 'actions/post_actions';
import {clearChannelSelection, multiSelectChannelAdd, multiSelectChannelTo} from 'actions/views/channel_sidebar';
import {closeRightHandSide} from 'actions/views/rhs';
import {getFirstChannelName} from 'selectors/onboarding';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import {isChannelSelected} from 'selectors/views/channel_sidebar';

import {
    GenericTaskSteps,
    OnboardingTaskCategory,
    OnboardingTasksName,
} from 'components/onboarding_tasks';
import {FINISHED, OnboardingTourSteps, TutorialTourName} from 'components/tours';

import type {GlobalState} from 'types/store';

import SidebarChannelLink from './sidebar_channel_link';

type OwnProps = {
    channel: Channel;
}

function makeMapStateToProps() {
    const getUnreadCount = makeGetChannelUnreadCount();
    const getFilesForPost = makeGetFilesForPost();

    return (state: GlobalState, ownProps: OwnProps) => {
        const member = getMyChannelMemberships(state)[ownProps.channel.id];
        const unreadCount = getUnreadCount(state, ownProps.channel.id);
        const lastPostId = getMostRecentPostIdInChannel(state, ownProps.channel.id);
        const lastPost = lastPostId ? getPost(state, lastPostId) : undefined;
        const lastPostFiles = lastPostId ? getFilesForPost(state, lastPostId) : [];
        const lastPostFirstFileInfo = lastPostFiles[0];
        const config = getConfig(state);
        const enableTutorial = config.EnableTutorial === 'true';
        const currentUserId = getCurrentUserId(state);
        const tutorialStep = getInt(state, TutorialTourName.ONBOARDING_TUTORIAL_STEP, currentUserId, 0);
        const triggerStep = getInt(state, OnboardingTaskCategory, OnboardingTasksName.CHANNELS_TOUR, FINISHED);
        const channelTourTriggered = triggerStep === GenericTaskSteps.STARTED;
        const isOnboardingFlowEnabled = config.EnableOnboardingFlow;
        const showChannelsTour = enableTutorial && tutorialStep === OnboardingTourSteps.CHANNELS_AND_DIRECT_MESSAGES;
        const showChannelsTutorialStep = showChannelsTour && channelTourTriggered && isOnboardingFlowEnabled === 'true';

        const remoteNames = ownProps.channel?.shared ?
            getRemoteNamesForChannel(state, ownProps.channel.id) : [];

        return {
            unreadMentions: unreadCount.mentions,
            unreadMsgs: unreadCount.messages,
            isUnread: unreadCount.showUnread,
            isMuted: isChannelMuted(member),
            hasUrgent: unreadCount.hasUrgent,
            isChannelSelected: isChannelSelected(state, ownProps.channel.id),
            firstChannelName: showChannelsTutorialStep ? getFirstChannelName(state) : '',
            showChannelsTutorialStep,
            rhsState: getRhsState(state),
            rhsOpen: getIsRhsOpen(state),
            remoteNames,
            lastPost,
            lastPostFirstFileInfo,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            markMostRecentPostInChannelAsUnread,
            unsetEditingPost,
            clearChannelSelection,
            multiSelectChannelTo,
            multiSelectChannelAdd,
            closeRightHandSide,
            fetchChannelRemotes,
            getCustomEmojisInText,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarChannelLink);
