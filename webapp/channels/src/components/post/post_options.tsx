// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classnames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {CheckIcon, ContentCopyIcon} from '@workspace/compass-icons/components';

import type {Emoji} from '@workspace/types/emojis';
import type {Post} from '@workspace/types/posts';

import {Posts} from 'workspace-redux/constants/index';
import {isPostEphemeral} from 'workspace-redux/utils/post_utils';

import ActionsMenu from 'components/actions_menu';
import CommentIcon from 'components/common/comment_icon';
import {usePluginVisibilityInSharedChannel} from 'components/common/hooks/usePluginVisibilityInSharedChannel';
import DotMenu from 'components/dot_menu';
import MessageReplyButton from 'components/post_view/message_reply_button/message_reply_button';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import PostReaction from 'components/post_view/post_reaction';
import PostRecentReactions from 'components/post_view/post_recent_reactions';
import WithTooltip from 'components/with_tooltip';

import {Locations, Constants} from 'utils/constants';
import {isSystemMessage, fromAutoResponder} from 'utils/post_utils';
import * as Utils from 'utils/utils';

import type {PostActionComponent} from 'types/store/plugins';

type Props = {
    post: Post;
    teamId: string;
    isFlagged: boolean;
    removePost: (post: Post) => void;
    enableEmojiPicker?: boolean;
    isReadOnly?: boolean;
    channelIsArchived?: boolean;
    channelIsShared?: boolean;
    handleCommentClick?: (e: React.MouseEvent) => void;
    handleJumpClick?: (e: React.MouseEvent) => void;
    handleDropdownOpened?: (e: boolean) => void;
    collapsedThreadsEnabled?: boolean;
    shouldShowActionsMenu?: boolean;
    oneClickReactionsEnabled?: boolean;
    recentEmojis: Emoji[];
    isExpanded?: boolean;
    hover?: boolean;
    isMobileView: boolean;
    hasReplies?: boolean;
    isFirstReply?: boolean;
    canReply?: boolean;
    replyCount?: number;
    location: keyof typeof Locations;
    isLastPost?: boolean;
    shortcutReactToLastPostEmittedFrom?: string;
    isPostHeaderVisible?: boolean | null;
    isPostBeingEdited?: boolean;
    canDelete?: boolean;
    pluginActions: PostActionComponent[];
    toggleReplyBox?: (method: 'open' | 'close', post?: Post) => void;
    replaceFlagWithCopy?: boolean;
    actions: {
        emitShortcutReactToLastPostFrom: (emittedFrom: 'CENTER' | 'RHS_ROOT' | 'NO_WHERE') => void;
    };
};

const PostOptions = (props: Props): JSX.Element => {
    const intl = useIntl();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showDotMenu, setShowDotMenu] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const copyResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const toggleEmojiPicker = useCallback((show: boolean) => {
        setShowEmojiPicker(show);
        props.handleDropdownOpened!(show);
    }, [props.handleDropdownOpened]);

    const lastEmittedFrom = useRef(props.shortcutReactToLastPostEmittedFrom);
    useEffect(() => {
        // Confirm that lastEmittedFrom actually changed to avoid toggling the emoji picker when another dependency
        // changes without the user pressing the hotkey again
        if (lastEmittedFrom.current === props.shortcutReactToLastPostEmittedFrom) {
            return;
        }

        lastEmittedFrom.current = props.shortcutReactToLastPostEmittedFrom;

        const locationToUse = props.location === 'RHS_COMMENT' ? Locations.RHS_ROOT : props.location;

        if (props.isLastPost &&
            (props.shortcutReactToLastPostEmittedFrom === locationToUse) &&
                props.isPostHeaderVisible) {
            props.actions.emitShortcutReactToLastPostFrom(Locations.NO_WHERE);
            toggleEmojiPicker(!showEmojiPicker);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isLastPost, props.shortcutReactToLastPostEmittedFrom, props.location, props.isPostHeaderVisible, showEmojiPicker]);

    const {
        channelIsArchived,
        collapsedThreadsEnabled,
        isReadOnly,
        post,
        oneClickReactionsEnabled,
        isMobileView,
    } = props;

    const isEphemeral = isPostEphemeral(post);
    const systemMessage = isSystemMessage(post);
    const isFromAutoResponder = fromAutoResponder(post);

    const copyText = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsCopied(true);

        if (copyResetTimeoutRef.current) {
            clearTimeout(copyResetTimeoutRef.current);
        }

        copyResetTimeoutRef.current = setTimeout(() => {
            setIsCopied(false);
            copyResetTimeoutRef.current = null;
        }, 2000);
        Utils.copyToClipboard(post.message_source || post.message);
    }, [post]);

    useEffect(() => {
        return () => {
            if (copyResetTimeoutRef.current) {
                clearTimeout(copyResetTimeoutRef.current);
                copyResetTimeoutRef.current = null;
            }
        };
    }, []);

    function removePost() {
        props.removePost(props.post);
    }

    const handleDotMenuOpened = (open: boolean) => {
        setShowDotMenu(open);
        props.handleDropdownOpened!(open);
    };

    const handleActionsMenuOpened = (open: boolean) => {
        setShowActionsMenu(open);
        props.handleDropdownOpened!(open);
    };

    const isPostDeleted = post && post.state === Posts.POST_DELETED;
    const hoverLocal = props.hover || showEmojiPicker || showDotMenu || showActionsMenu;
    const showCommentIcon = isFromAutoResponder || (!systemMessage && (isMobileView ||
            hoverLocal || (!post.root_id && Boolean(props.hasReplies)) ||
            props.isFirstReply) && props.location === Locations.CENTER);
    const commentIconExtraClass = isMobileView ? '' : 'pull-right';

    const replyMessageButton = (!systemMessage && props.toggleReplyBox) ? (
        <li>
            <MessageReplyButton
                post={post}
                onClick={props.toggleReplyBox}
            />
        </li>
    ) : null;

    let commentIcon;
    if (showCommentIcon) {
        commentIcon = (
            <li>
                <CommentIcon
                    handleCommentClick={props.handleCommentClick}
                    postId={post.id}
                    extraClass={commentIconExtraClass}
                    commentCount={props.collapsedThreadsEnabled ? 0 : props.replyCount}
                />
            </li>
        );
    }

    const showRecentlyUsedReactions = (!isMobileView && !isReadOnly && !isEphemeral && !post.failed && !systemMessage && !channelIsArchived && oneClickReactionsEnabled && props.enableEmojiPicker && hoverLocal);

    let showRecentReactions: ReactNode;
    if (showRecentlyUsedReactions) {
        const showMoreReactions = props.isExpanded ||
            props.location === 'CENTER' ||
            (document.getElementById('sidebar-right')?.getBoundingClientRect().width ?? 0) > Constants.SIDEBAR_MINIMUM_WIDTH;

        showRecentReactions = (
            <PostRecentReactions
                channelId={post.channel_id}
                postId={post.id}
                teamId={props.teamId}
                emojis={props.recentEmojis}
                size={showMoreReactions ? 3 : 1}
            />
        );
    }

    const showReactionIcon = !systemMessage && !isReadOnly && !isEphemeral && !post.failed && props.enableEmojiPicker && !channelIsArchived;
    let postReaction;
    if (showReactionIcon) {
        postReaction = (
            <li>
                <PostReaction
                    channelId={post.channel_id}
                    location={props.location}
                    postId={post.id}
                    teamId={props.teamId}
                    showEmojiPicker={showEmojiPicker}
                    setShowEmojiPicker={toggleEmojiPicker}
                />
            </li>
        );
    }

    let flagIcon: ReactNode = null;
    if (!isMobileView && (!isEphemeral && !post.failed && !systemMessage)) {
        if (props.replaceFlagWithCopy) {
            flagIcon = (
                <li>
                    <WithTooltip
                        title={
                            isCopied ? (
                                <FormattedMessage
                                    id='copied.message'
                                    defaultMessage='Copied'
                                />
                            ) : (
                                <FormattedMessage
                                    id='post_info.copy'
                                    defaultMessage='Copy Text'
                                />
                            )
                        }
                    >
                        <button
                            aria-label={isCopied ? intl.formatMessage({id: 'copied.message', defaultMessage: 'Copied'}).toLowerCase() : intl.formatMessage({id: 'post_info.copy', defaultMessage: 'Copy Text'}).toLowerCase()}
                            className='post-menu__item'
                            onClick={copyText}
                        >
                            {isCopied ? <CheckIcon size={16}/> : <ContentCopyIcon size={16}/>}
                        </button>
                    </WithTooltip>
                </li>
            );
        } else {
            flagIcon = (
                <li>
                    <PostFlagIcon
                        location={props.location}
                        postId={post.id}
                        isFlagged={props.isFlagged}
                    />
                </li>
            );
        }
    }

    // Action menus
    const showActionsMenuIcon = props.shouldShowActionsMenu && (isMobileView || hoverLocal);
    const actionsMenu = showActionsMenuIcon && (
        <li>
            <ActionsMenu
                post={post}
                location={props.location}
                handleDropdownOpened={handleActionsMenuOpened}
                isMenuOpen={showActionsMenu}
            />
        </li>
    );

    let pluginItems: ReactNode = null;
    const pluginItemsVisible = usePluginVisibilityInSharedChannel(post.channel_id);

    if ((!isEphemeral && !post.failed && !systemMessage) && hoverLocal && pluginItemsVisible) {
        pluginItems = props.pluginActions?.
            map((item) => {
                if (item.component) {
                    const Component = item.component;
                    return (
                        <li key={item.id}>
                            <Component
                                post={props.post}
                            />
                        </li>
                    );
                }
                return null;
            }) || [];
    }

    const dotMenu = (
        <li>
            <DotMenu
                post={props.post}
                location={props.location}
                isFlagged={props.isFlagged}
                handleDropdownOpened={handleDotMenuOpened}
                handleCommentClick={props.handleCommentClick}
                handleAddReactionClick={toggleEmojiPicker}
                isReadOnly={isReadOnly || channelIsArchived}
                isMenuOpen={showDotMenu}
                enableEmojiPicker={props.enableEmojiPicker}
            />
        </li>
    );

    // Build post options
    let options: ReactNode;
    if (isEphemeral) {
        options = (
            <div className='col col__remove'>
                <button
                    className='post__remove theme color--link style--none'
                    onClick={removePost}
                >
                    {'×'}
                </button>
            </div>
        );
    } else if (isPostDeleted || (systemMessage && !props.canDelete)) {
        options = null;
    } else if (props.location === Locations.SEARCH) {
        const hasCRTFooter = props.collapsedThreadsEnabled && !post.root_id && (post.reply_count > 0 || post.is_following);
        options = (
            <ul className='col__controls post-menu'>
                {dotMenu}
                {flagIcon}
                {props.canReply && !hasCRTFooter &&
                <li>
                    <CommentIcon
                        location={props.location}
                        handleCommentClick={props.handleCommentClick}
                        commentCount={props.replyCount}
                        postId={post.id}
                        searchStyle={'search-item__comment'}
                        extraClass={props.replyCount ? 'icon--visible' : ''}
                    />
                </li>
                }
                <li>
                    <a
                        href='#'
                        onClick={props.handleJumpClick}
                        className='search-item__jump'
                    >
                        <FormattedMessage
                            id='search_item.jump'
                            defaultMessage='Jump'
                        />
                    </a>
                </li>
            </ul>
        );
    } else if (!props.isPostBeingEdited) {
        options = (
            <ul
                data-testid={`post-menu-${props.post.id}`}
                className={classnames('col post-menu', {'post-menu--position': !hoverLocal && showCommentIcon})}
            >
                {!collapsedThreadsEnabled && !showRecentlyUsedReactions && dotMenu}
                {showRecentReactions}
                {postReaction}
                {flagIcon}
                {pluginItems}
                {actionsMenu}
                {replyMessageButton}
                {commentIcon}
                {(collapsedThreadsEnabled || showRecentlyUsedReactions) && dotMenu}
            </ul>
        );
    }

    return <>{options}</>;
};

export default PostOptions;
