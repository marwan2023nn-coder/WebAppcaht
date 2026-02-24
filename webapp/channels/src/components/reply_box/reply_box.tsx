// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IoCloseOutline} from 'react-icons/io5';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import type {Post} from '@workspace/types/posts';

import {getFile} from 'workspace-redux/selectors/entities/files';
import {getCurrentUserId, getUser} from 'workspace-redux/selectors/entities/users';
import {getFullName} from 'workspace-redux/utils/user_utils';

import FileThumbnail from 'components/file_attachment/file_thumbnail';
import {replaceEmojiCodes} from 'components/sidebar/sidebar_channel/sidebar_channel_link/emoji_helper';
import Avatar from 'components/widgets/users/avatar/avatar';

import type {GlobalState} from 'types/store';
import {imageURLForUser} from 'utils/utils';
import './reply_box.scss';

type Props = {
    post: Post;
    toggleReplyBox: (method: 'open' | 'close', post?: Post) => void;
}

const ReplyBox = ({post, toggleReplyBox}: Props) => {
    const intl = useIntl();
    if (!post) {
        return null;
    }
    const replyToMessage = intl.formatMessage({
        id: 'reply_box.reply_to',
        defaultMessage: 'Reply to',
    });

    const sameUserName = intl.formatMessage({
        id: 'reply_box.you',
        defaultMessage: 'You',
    });

    const fileIds = post.file_ids;
    const fileId = fileIds && fileIds.length > 0 ? fileIds[0] : '';
    const file = useSelector((state: GlobalState) => (fileId ? getFile(state, fileId) : null));
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const currentUserId = useSelector((state: GlobalState) => getCurrentUserId(state));
    const isSameUser = currentUserId === post.user_id;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const user = useSelector((state: GlobalState) => getUser(state, post.user_id));

    const unknownUserName = intl.formatMessage({
        id: 'channel_loader.someone',
        defaultMessage: 'Someone',
    });

    const userFullName = isSameUser ? sameUserName : (user ? (getFullName(user) || user.username) : unknownUserName);

    const getFilePreview = () => {
        if (!fileId) {
            return null;
        }
        if (file) {
            return <FileThumbnail fileInfo={file}/>;
        }
        return <div className='file-icon generic'/>;
    };

    const messageText = post.message || '';
    const messageSnippet = messageText.length > 150 ? `${messageText.substring(0, 150)}...` : messageText;

    return (
        <div className='replyBox'>
            <div className='replyBox__header'>
                <div>
                    {replyToMessage}
                    <span className='replyBox__replyBox__header__name'>
                        {user?.id && user?.username && (
                            <Avatar
                                size='xxs'
                                username={user.username}
                                url={imageURLForUser(user.id, user.last_picture_update)}
                            />
                        )}
                        {` ${userFullName}`}
                    </span>
                </div>
                <button onClick={() => toggleReplyBox('close')}>
                    <IoCloseOutline size={16}/>
                </button>
            </div>
            <div className='replyBox__body'>
                <div className='preview__content'>
                    <p className='preview__content__text'>
                        {messageSnippet ? replaceEmojiCodes(messageSnippet) : null}
                    </p>
                    {getFilePreview()}
                </div>
            </div>
        </div>
    );
};

export default ReplyBox;
