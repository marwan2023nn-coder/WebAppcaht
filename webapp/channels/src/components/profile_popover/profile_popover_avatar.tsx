// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';

import RootPortal from 'components/root_portal';
import StatusIcon from 'components/status_icon';
import Avatar from 'components/widgets/users/avatar';

type Props = {
    username?: string;
    hideStatus?: boolean;
    status?: string;
    urlSrc: string;
}
const ProfilePopoverAvatar = ({
    username,
    hideStatus,
    status,
    urlSrc,
}: Props) => {
    const [isZoomed, setIsZoomed] = useState(false);

    const toggleZoom = useCallback((e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsZoomed((prev) => !prev);
    }, []);

    const closeZoom = useCallback((e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsZoomed(false);
    }, []);

    return (
        <>
            <div className='user-popover-image'>
                <button
                    type='button'
                    className='user-popover-image__avatar-button'
                    onClick={toggleZoom}
                    aria-label={username ? `Zoom profile picture for ${username}` : 'Zoom profile picture'}
                >
                    <Avatar
                        id='userAvatar'
                        size='xxl'
                        username={username}
                        url={urlSrc}
                        tabIndex={-1}
                    />
                </button>
            <StatusIcon
                className='status user-popover-status'
                status={hideStatus ? undefined : status}
                button={true}
            />
            </div>
            {isZoomed && (
                <RootPortal>
                    <div
                        className='user-popover-avatar-zoom__backdrop'
                        role='presentation'
                        onClick={closeZoom}
                    >
                        <button
                            type='button'
                            className='user-popover-avatar-zoom__content'
                            onClick={toggleZoom}
                            aria-label='Close zoomed profile picture'
                        >
                            <img
                                className='user-popover-avatar-zoom__image'
                                src={urlSrc}
                                alt=''
                            />
                        </button>
                    </div>
                </RootPortal>
            )}
        </>
    );
};

export default ProfilePopoverAvatar;
