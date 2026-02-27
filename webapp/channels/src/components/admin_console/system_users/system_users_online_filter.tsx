// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import Toggle from 'components/toggle';

import {useOnlineUsersFilter} from './hooks';

export function SystemUsersOnlineFilter() {
    const {formatMessage} = useIntl();
    const {showOnlineOnly, toggleOnlineOnly} = useOnlineUsersFilter();

    return (
        <div className='systemUsersOnlineFilterContainer'>
            <span className='systemUsersOnlineFilterLabel'>
                {formatMessage({id: 'admin.system_users.online_only', defaultMessage: 'Show Online Users Only'})}
            </span>
            <Toggle
                onToggle={toggleOnlineOnly}
                toggled={showOnlineOnly}
                size='btn-sm'
                ariaLabel={formatMessage({id: 'admin.system_users.online_only.aria', defaultMessage: 'Show Online Users Only Toggle'})}
            />
        </div>
    );
}
