// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {GlobalState} from '@workspace/types/store';

import {addChannelMember} from 'workspace-redux/actions/channels';
import {removePost} from 'workspace-redux/actions/posts';
import {getChannel} from 'workspace-redux/selectors/entities/channels';
import {getPost} from 'workspace-redux/selectors/entities/posts';
import {getCurrentUser} from 'workspace-redux/selectors/entities/users';

import PostAddChannelMember from './post_add_channel_member';

type OwnProps = {
    postId: string;
    userIds: string[];
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const post = getPost(state, ownProps.postId) || {};
    let channelType = '';
    let isPolicyEnforced = false;
    if (post && post.channel_id) {
        const channel = getChannel(state, post.channel_id);
        if (channel && channel.type) {
            channelType = channel.type;
            isPolicyEnforced = Boolean(channel.policy_enforced);
        }
    }

    return {
        channelType,
        currentUser: getCurrentUser(state),
        post,
        isPolicyEnforced,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            addChannelMember,
            removePost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostAddChannelMember);
