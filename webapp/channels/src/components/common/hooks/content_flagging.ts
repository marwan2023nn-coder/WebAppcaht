// Copyright (c) 2015-present Sofa Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Channel} from '@workspace/types/channels';
import type {Post} from '@workspace/types/posts';
import type {Team} from '@workspace/types/teams';

import type {
    ContentFlaggingChannelRequestIdentifier,
    ContentFlaggingTeamRequestIdentifier,
} from 'workspace-redux/actions/content_flagging';
import {
    loadContentFlaggingTeam,
    loadContentFlaggingChannel,
    loadFlaggedPost,
} from 'workspace-redux/actions/content_flagging';
import {
    getContentFlaggingChannel,
    getContentFlaggingTeam,
    getFlaggedPost,
} from 'workspace-redux/selectors/entities/content_flagging';

import {makeUseEntity} from 'components/common/hooks/useEntity';

export const useGetFlaggedPost = makeUseEntity<Post | undefined>({
    name: 'useGetFlaggedPost',
    fetch: loadFlaggedPost,
    selector: getFlaggedPost,
});

export const useGetContentFlaggingChannel = makeUseEntity<Channel | undefined, ContentFlaggingChannelRequestIdentifier>({
    name: 'useGetContentFlaggingChannel',
    fetch: loadContentFlaggingChannel,
    selector: getContentFlaggingChannel,
});

export const useGetContentFlaggingTeam = makeUseEntity<Team | undefined, ContentFlaggingTeamRequestIdentifier>({
    name: 'useGetContentFlaggingTeam',
    fetch: loadContentFlaggingTeam,
    selector: getContentFlaggingTeam,
});
