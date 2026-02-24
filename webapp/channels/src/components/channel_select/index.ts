// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import type {GlobalState} from '@workspace/types/store';

import {createSelector} from 'workspace-redux/selectors/create_selector';
import {getMyChannels} from 'workspace-redux/selectors/entities/channels';
import {getCurrentUserLocale} from 'workspace-redux/selectors/entities/i18n';
import {sortChannelsByTypeAndDisplayName} from 'workspace-redux/utils/channel_utils';

import ChannelSelect from './channel_select';

const getMyChannelsSorted = createSelector(
    'getMyChannelsSorted',
    getMyChannels,
    getCurrentUserLocale,
    (channels, locale) => {
        const activeChannels = channels.filter((channel) => channel.delete_at === 0);
        return [...activeChannels].sort(sortChannelsByTypeAndDisplayName.bind(null, locale));
    },
);

function mapStateToProps(state: GlobalState) {
    return {
        channels: getMyChannelsSorted(state),
    };
}

export default connect(mapStateToProps)(ChannelSelect);
