// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {ChannelType} from '@workspace/types/channels';

import Constants from 'utils/constants';

type Props = {
    channelType: ChannelType;
}

const SidebarBaseChannelIcon = ({
    channelType,
}: Props) => {
    if (channelType === Constants.OPEN_CHANNEL) {
        return (
            <div className='sidebar-base-channel-icon'>
                <i style={{fontSize: '18px',display: 'contents'}} className='icon icon-globe'/>
            </div>
        );
    }
    if (channelType === Constants.PRIVATE_CHANNEL) {
        return (
             <div className='sidebar-base-channel-icon'>
                <i style={{fontSize: '18px',display: 'contents'}}className='icon icon-lock-outline'/>
            </div>
        );
    }
    return null;
};

export default SidebarBaseChannelIcon;
