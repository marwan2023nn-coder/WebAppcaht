// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback} from 'react';

import type {Channel} from '@workspace/types/channels';
import type {PreferenceType} from '@workspace/types/preferences';
import {MdGroups} from 'react-icons/md';
import type {ActionResult} from 'workspace-redux/types/actions';

import SidebarChannelLink from 'components/sidebar/sidebar_channel/sidebar_channel_link';

import {getHistory} from 'utils/browser_history';
import Constants from 'utils/constants';

type Props = {
    channel: Channel;
    currentTeamName: string;
    currentUserId: string;
    redirectChannel: string;
    active: boolean;
    membersCount: number;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<ActionResult>;
    };
};

const SidebarGroupChannel = ({
    channel,
    currentUserId,
    actions,
    active,
    currentTeamName,
    redirectChannel,
    membersCount,
}: Props) => {
    const handleLeaveChannel = useCallback((callback: () => void) => {
        const id = channel.id;
        const category = Constants.Preferences.CATEGORY_GROUP_CHANNEL_SHOW;

        actions.savePreferences(currentUserId, [{user_id: currentUserId, category, name: id, value: 'false'}]).then(callback);

        if (active) {
            getHistory().push(`/${currentTeamName}/channels/${redirectChannel}`);
        }
    }, [channel.id, actions, active, currentTeamName, redirectChannel, currentUserId]);

    const getIcon = () => {
        return (
            <div className='status status--group'>
                <MdGroups className='status__group-icon' size={18}/>
                <span className='status__group-count'>{membersCount}</span>
            </div>
        );
    };

    return (
        <SidebarChannelLink
            channel={channel}
            link={`/${currentTeamName}/messages/${channel.name}`}
            label={channel.display_name}
            channelLeaveHandler={handleLeaveChannel}
            icon={getIcon()}
        />
    );
};

export default memo(SidebarGroupChannel);
