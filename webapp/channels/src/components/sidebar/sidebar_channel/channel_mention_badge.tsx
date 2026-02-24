// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';

type Props = {
    unreadMentions: number;
    hasUrgent?: boolean;
    hasImportant?: boolean;
    icon?: React.ReactNode;
    className?: string;
};

export default function ChannelMentionBadge({unreadMentions, hasUrgent, hasImportant, icon, className}: Props) {
    if (unreadMentions > 0) {
        return (
            <span
                id='unreadMentions'
                className={classNames({badge: true, urgent: hasUrgent, important: hasImportant}, className)}
            >
                {icon}
                <span className='unreadMentions'>
                    {unreadMentions}
                </span>
            </span>
        );
    }

    return null;
}
