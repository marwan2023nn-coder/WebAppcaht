// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { ReactElement } from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import {getFile} from 'workspace-redux/selectors/entities/files';

import FileThumbnail from 'components/file_attachment/file_thumbnail';
import Avatar from 'components/widgets/users/avatar/avatar';

import type {GlobalState} from 'types/store';

import './reply_preview.scss';
// eslint-disable-next-line import/order
import {replaceEmojiCodes} from 'components/sidebar/sidebar_channel/sidebar_channel_link/emoji_helper';

type Props = {
    userFullName: string | ReactElement;
    text: string;
    username?: string;
    onClick?: (e: React.MouseEvent) => void;
    error?: string;
    userProfileImageURL?: string;
    statusPreviewURL?: string;
    fileId?: string;
    previewComponent?: ReactElement | null;
}

const ReplyPreview = ({userFullName, username, userProfileImageURL, text, fileId, statusPreviewURL, error, onClick, previewComponent}: Props) => {
    const intl = useIntl();
    const mediaText = intl.formatMessage({
        id: 'reply_preview.media',
        defaultMessage: 'Media',
    });

    const file = useSelector((state: GlobalState) => (fileId ? getFile(state, fileId) : null));

    const getFilePreview = () => {
        if (fileId) {
            const fileThumbnail = file ? <FileThumbnail fileInfo={file}/> : <div className='file-icon generic'/>;
            return fileThumbnail;
        }
        return null;
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick(e);
    };

    return (
        <div
            className='preview contentrtl'
            onClick={handleClick}
        >
            <div className='preview__header'>
                {userProfileImageURL && username && (
                    <Avatar
                        size='xxs'
                        username={username}
                        url={userProfileImageURL}
                    />
                )}
                <span>{userFullName}</span>
            </div>
                {previewComponent}
            <div className='preview__content'>
                {error ? (
                    <p className='preview__content__error-msg'>{error}</p>
                ) : (
                    <>
                        <p className='preview__content__text'>
                            {text && text.length > 0 ? (
                                <>
                                    {replaceEmojiCodes(text.substring(0, 150))}
                                    {text.length > 150 && '...'}
                                </>
                            ) : (
                                fileId && mediaText
                            )}
                        </p>

                        {fileId ? getFilePreview() : statusPreviewURL && (<img src={statusPreviewURL}/>)
                        }
                    </>
                )}
            </div>
        </div>
    );
};

export default ReplyPreview;
