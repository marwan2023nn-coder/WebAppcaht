// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import { channelBannerEnabled } from '@workspace/types/channels';
import type { GlobalState } from '@workspace/types/store';

import { General } from 'workspace-redux/constants';
import { getChannel, getChannelBanner } from 'workspace-redux/selectors/entities/channels';

export const selectShowChannelBanner = (state: GlobalState, channelId: string): boolean => {
    const channelBannerInfo = getChannelBanner(state, channelId);
    const channel = getChannel(state, channelId);
    const isValidChannelType = Boolean(channel); // Allow all channel types
    return isValidChannelType && channelBannerEnabled(channelBannerInfo);
};
