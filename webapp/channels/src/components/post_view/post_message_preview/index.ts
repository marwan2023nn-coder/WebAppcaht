// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {PostPreviewMetadata} from '@workspace/types/posts';

import {General} from 'workspace-redux/constants';
import {makeGetChannel} from 'workspace-redux/selectors/entities/channels';
import {getConfig} from 'workspace-redux/selectors/entities/general';
import {getPost, isPostPriorityEnabled} from 'workspace-redux/selectors/entities/posts';
import {get} from 'workspace-redux/selectors/entities/preferences';
import {getCurrentRelativeTeamUrl} from 'workspace-redux/selectors/entities/teams';
import {getUser} from 'workspace-redux/selectors/entities/users';

import {toggleEmbedVisibility} from 'actions/post_actions';
import {isEmbedVisible} from 'selectors/posts';

import {Preferences} from 'utils/constants';

import type {GlobalState} from 'types/store';

import PostMessagePreview from './post_message_preview';

export type OwnProps = {
    metadata: PostPreviewMetadata;
    preventClickAction?: boolean;
    previewFooterMessage?: string;
    usePostAsSource?: boolean;
}

function makeMapStateToProps() {
    const getChannel = makeGetChannel();

    return (state: GlobalState, ownProps: OwnProps) => {
        const config = getConfig(state);
        const currentTeamUrl = getCurrentRelativeTeamUrl(state);
        let user = null;
        let embedVisible = false;
        let channelDisplayName = ownProps.metadata.channel_display_name;
        const previewPost = ownProps.metadata.post || getPost(state, ownProps.metadata.post_id);

        if (previewPost && previewPost.user_id) {
            user = getUser(state, previewPost.user_id);
        }
        if (previewPost && previewPost.id) {
            embedVisible = isEmbedVisible(state, previewPost.id);
        }

        if (ownProps.metadata.channel_type === General.DM_CHANNEL) {
            channelDisplayName = getChannel(state, ownProps.metadata.channel_id)?.display_name || '';
        }

        return {
            currentTeamUrl,
            channelDisplayName,
            hasImageProxy: config.HasImageProxy === 'true',
            enablePostIconOverride: config.EnablePostIconOverride === 'true',
            previewPost,
            user,
            isEmbedVisible: embedVisible,
            compactDisplay: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT) === Preferences.MESSAGE_DISPLAY_COMPACT,
            isPostPriorityEnabled: isPostPriorityEnabled(state),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({toggleEmbedVisibility}, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostMessagePreview);
