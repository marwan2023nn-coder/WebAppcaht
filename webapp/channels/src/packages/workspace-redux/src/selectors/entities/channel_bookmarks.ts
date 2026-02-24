// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ChannelBookmarksState} from '@workspace/types/channel_bookmarks';
import type {GlobalState} from '@workspace/types/store';

const EMPTY_BOOKMARKS = {};

export const getChannelBookmarks = (state: GlobalState, channelId: string): ChannelBookmarksState['byChannelId'][string] => {
    const bookmarks = state.entities.channelBookmarks.byChannelId[channelId];

    if (!bookmarks) {
        return EMPTY_BOOKMARKS;
    }

    return bookmarks;
};

export const getChannelBookmark = (state: GlobalState, channelId: string, bookmarkId: string) => {
    return getChannelBookmarks(state, channelId)[bookmarkId];
};
