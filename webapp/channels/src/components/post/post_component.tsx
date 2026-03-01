// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState, useMemo, memo } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import type { Emoji } from '@workspace/types/emojis';
import type { Post } from '@workspace/types/posts';
import type { Team } from '@workspace/types/teams';
import type { UserProfile } from '@workspace/types/users';

import { Posts } from 'workspace-redux/constants/index';
import {
    isMeMessage as checkIsMeMessage,
    isPostPendingOrFailed
} from 'workspace-redux/utils/post_utils';
import { getUser } from 'workspace-redux/selectors/entities/users';
import { getFullName } from 'workspace-redux/utils/user_utils';

import AutoHeightSwitcher, { AutoHeightSlots } from 'components/common/auto_height_switcher';
import EditPost from 'components/edit_post';
import FileAttachmentListContainer from 'components/file_attachment_list';
import MessageWithAdditionalContent from 'components/message_with_additional_content';
import PriorityLabel from 'components/post_priority/post_priority_label';
import PostProfilePicture from 'components/post_profile_picture';
import PostAcknowledgements from 'components/post_view/acknowledgements';
import CommentedOn from 'components/post_view/commented_on/commented_on';
import FailedPostOptions from 'components/post_view/failed_post_options';
import PostAriaLabelDiv from 'components/post_view/post_aria_label_div';
import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostMessageContainer from 'components/post_view/post_message_view';
import PostPreHeader from 'components/post_view/post_pre_header';
import PostTime from 'components/post_view/post_time';
import ReactionList from 'components/post_view/reaction_list';
import ThreadFooter from 'components/threading/channel_threads/thread_footer';
import type { Props as TimestampProps } from 'components/timestamp/timestamp';
import ArchiveIcon from 'components/widgets/icons/archive_icon';
import InfoSmallIcon from 'components/widgets/icons/info_small_icon';
import WithTooltip from 'components/with_tooltip';

import { TiArrowForwardOutline } from 'react-icons/ti';

import { getHistory } from 'utils/browser_history';
import Constants, { ActionTypes, A11yCustomEventTypes, AppEvents, Locations } from 'utils/constants';
import type { A11yFocusEventDetail } from 'utils/constants';
import { isKeyPressed } from 'utils/keyboard';
import * as PostUtils from 'utils/post_utils';
import { imageURLForUser, makeIsEligibleForClick } from 'utils/utils';

import { getPermalinkURL } from 'selectors/urls';
import { getIsPostMultiSelectModeEnabled, getMultiSelectedPostIds } from 'selectors/posts';

import type { PostActionComponent, PostPluginComponent } from 'types/store/plugins';
import type { GlobalState } from 'types/store';

import { withPostErrorBoundary } from './post_error_boundary';
import PostOptions from './post_options';
import PostUserProfile from './user_profile';
import PostSearchHeader from './post_search_header';
import './custom.scss';
import ReplyPreview from 'components/reply_preview/reply_preview';
import EmojiIcon from 'components/widgets/icons/emoji_icon';

import BurnOnReadBadge from 'components/post_view/burn_on_read_badge/burn_on_read_badge';
import BurnOnReadConcealedPlaceholder from 'components/post_view/burn_on_read_concealed_placeholder/burn_on_read_concealed_placeholder';
import BurnOnReadTimerChip from 'components/post_view/burn_on_read_timer_chip';
import BurnOnReadConfirmationModal from 'components/burn_on_read_confirmation_modal';

export type Props = {
    post: Post;
    currentTeam?: Team;
    team?: Team;
    currentUserId: string;
    compactDisplay?: boolean;
    colorizeUsernames?: boolean;
    isFlagged: boolean;
    previewCollapsed?: string;
    previewEnabled?: boolean;
    isEmbedVisible?: boolean;
    enableEmojiPicker?: boolean;
    enablePostUsernameOverride?: boolean;
    isReadOnly?: boolean;
    pluginPostTypes?: { [postType: string]: PostPluginComponent };
    channelIsArchived?: boolean;
    channelIsShared?: boolean;
    isConsecutivePost?: boolean;
    isLastPost?: boolean;
    recentEmojis: Emoji[];
    center: boolean;
    handleCardClick?: (post: Post) => void;
    togglePostMenu?: (opened: boolean) => void;
    channelName?: string;
    displayName: string;
    teamDisplayName?: string;
    teamName?: string;
    channelType?: string;
    a11yIndex?: number;
    isBot: boolean;
    hasReplies: boolean;
    isFirstReply?: boolean;
    previousPostIsComment?: boolean;
    matches?: string[];
    term?: string;
    isMentionSearch?: boolean;
    location: keyof typeof Locations;
    actions: {
        markPostAsUnread: (post: Post, location: string) => void;
        emitShortcutReactToLastPostFrom: (emittedFrom: 'CENTER' | 'RHS_ROOT' | 'NO_WHERE') => void;
        selectPost: (post: Post) => void;
        selectPostFromRightHandSideSearch: (post: Post) => void;
        removePost: (post: Post) => void;
        closeRightHandSide: () => void;
        selectPostCard: (post: Post) => void;
        setRhsExpanded: (rhsExpanded: boolean) => void;
        revealBurnOnReadPost: (postId: string) => Promise<{data?: any; error?: any}>;
        burnPostNow?: (postId: string) => Promise<any>;
    };
    timestampProps?: Partial<TimestampProps>;
    shouldHighlight?: boolean;
    isPostBeingEdited?: boolean;
    isCollapsedThreadsEnabled?: boolean;
    isMobileView: boolean;
    canReply?: boolean;
    replyCount?: number;
    isFlaggedPosts?: boolean;
    isPinnedPosts?: boolean;
    clickToReply?: boolean;
    isCommentMention?: boolean;
    parentPost?: Post;
    parentPostUser?: UserProfile | null;
    shortcutReactToLastPostEmittedFrom?: string;
    isPostAcknowledgementsEnabled: boolean;
    isPostPriorityEnabled: boolean;
    isCardOpen?: boolean;
    canDelete?: boolean;
    pluginActions: PostActionComponent[];
    isBurnOnRead?: boolean;
    isRevealed?: boolean;
    isConcealed?: boolean;
    expireAt?: number | null;
    maxExpireAt?: number | null;
};

function PostComponent(props: Props) {
    const { post, shouldHighlight, togglePostMenu } = props;

    const dispatch = useDispatch();

    const isPostMultiSelectModeEnabled = useSelector(getIsPostMultiSelectModeEnabled);
    const multiSelectedPostIds = useSelector(getMultiSelectedPostIds);
    const isMultiSelected = Boolean(post?.id) && multiSelectedPostIds.includes(post.id);

    const postClickDelay = 170;

    const intl = useIntl();

    const isSearchResultItem = (props.matches && props.matches.length > 0) || props.isMentionSearch || (props.term && props.term.length > 0);
    const isRHS = props.location === Locations.RHS_ROOT || props.location === Locations.RHS_COMMENT || props.location === Locations.SEARCH;
    const postRef = useRef<HTMLDivElement>(null);
    const postHeaderRef = useRef<HTMLDivElement>(null);
    const clickDebounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const teamId = props.team?.id ?? props.currentTeam?.id ?? '';

    const [hover, setHover] = useState(false);
    const [a11yActive, setA11y] = useState(false);
    const [dropdownOpened, setDropdownOpened] = useState(false);
    const [fileDropdownOpened, setFileDropdownOpened] = useState(false);
    const [showWhatsAppPostOptions, setShowWhatsAppPostOptions] = useState(false);
    const [fadeOutHighlight, setFadeOutHighlight] = useState(false);
    const [alt, setAlt] = useState(false);
    const [hasReceivedA11yFocus, setHasReceivedA11yFocus] = useState(false);
    const [isHoveringWhatsAppPostOptions, setIsHoveringWhatsAppPostOptions] = useState(false);

    const [burnOnReadRevealing, setBurnOnReadRevealing] = useState(false);
    const [burnOnReadRevealError, setBurnOnReadRevealError] = useState<string | null>(null);

    const [burnOnReadConfirmModalVisible, setBurnOnReadConfirmModalVisible] = useState(false);
    const [burnOnReadConfirmModalLoading, setBurnOnReadConfirmModalLoading] = useState(false);
    const [burnOnReadConfirmModalIsSenderDelete, setBurnOnReadConfirmModalIsSenderDelete] = useState(false);

    const whatsAppPostOptionsRef = useRef<HTMLDivElement>(null);
    const whatsAppPostOptionsTriggerRef = useRef<HTMLButtonElement>(null);
    const whatsAppPostOptionsMenuRef = useRef<HTMLDivElement>(null);
    const [whatsAppPostOptionsPosition, setWhatsAppPostOptionsPosition] = useState<{ left: number; bottom: number } | null>(null);
    const pendingCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const jumpHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dropdownOpenedRef = useRef(dropdownOpened);
    const isHoveringWhatsAppPostOptionsRef = useRef(isHoveringWhatsAppPostOptions);

    const clamp = (value: number, min: number, max: number) => {
        if (min > max) {
            return value;
        }
        return Math.min(max, Math.max(min, value));
    };

    const isNarrowViewportForWhatsAppOptions = props.isMobileView || (typeof window !== 'undefined' && window.innerWidth <= 750);
    const usePortalForWhatsAppOptions = !isNarrowViewportForWhatsAppOptions;

    const isSystemMessage = PostUtils.isSystemMessage(post);
    const fromAutoResponder = PostUtils.fromAutoResponder(post);

    const isBoRPost = post.type === Constants.PostTypes.BURN_ON_READ && post.state !== Posts.POST_DELETED;
    const hasPriorityLabel = Boolean(post.metadata?.priority && props.isPostPriorityEnabled && post.state !== Posts.POST_DELETED);
    const isConsecutivePostForUI = Boolean(props.isConsecutivePost) && !(isBoRPost || hasPriorityLabel);

    useEffect(() => {
        if (shouldHighlight) {
            setFadeOutHighlight(false);
            const timer = setTimeout(() => setFadeOutHighlight(true), 5000);
            return () => {
                clearTimeout(timer);
            };
        }

        setFadeOutHighlight(false);
        return undefined;
    }, [shouldHighlight]);

    const clearClickDebounceTimeout = useCallback(() => {
        if (clickDebounceTimeout.current) {
            clearTimeout(clickDebounceTimeout.current);
            clickDebounceTimeout.current = null;
        }
    }, []);

    const clearJumpHighlightTimeout = useCallback(() => {
        if (jumpHighlightTimeoutRef.current) {
            clearTimeout(jumpHighlightTimeoutRef.current);
            jumpHighlightTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (usePortalForWhatsAppOptions) {
            return;
        }

        if (showWhatsAppPostOptions) {
            setShowWhatsAppPostOptions(false);
            togglePostMenu?.(false);
            setDropdownOpened(false);
        }
    }, [usePortalForWhatsAppOptions, showWhatsAppPostOptions, togglePostMenu]);

    useEffect(() => {
        return () => {
            clearClickDebounceTimeout();
            clearJumpHighlightTimeout();
        };
    }, [clearClickDebounceTimeout, clearJumpHighlightTimeout]);

    const [jumpHighlightPostId, setJumpHighlightPostId] = useState<string | null>(null);

    const highlightPostElementTemporarily = useCallback((postId: string) => {
        if (!postId) {
            return;
        }

        clearJumpHighlightTimeout();
        setJumpHighlightPostId(postId);

        jumpHighlightTimeoutRef.current = setTimeout(() => {
            setJumpHighlightPostId(null);
            jumpHighlightTimeoutRef.current = null;
        }, 5000);
    }, [clearJumpHighlightTimeout]);

    const handleA11yActivateEvent = () => setA11y(true);
    const handleA11yDeactivateEvent = () => setA11y(false);
    const handleAlt = (e: KeyboardEvent) => setAlt(e.altKey);

    const handleA11yKeyboardFocus = useCallback((e: KeyboardEvent) => {
        if (!hasReceivedA11yFocus && shouldHighlight && isKeyPressed(e, Constants.KeyCodes.TAB) && e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();

            setHasReceivedA11yFocus(true);

            document.dispatchEvent(new CustomEvent<A11yFocusEventDetail>(
                A11yCustomEventTypes.FOCUS, {
                detail: {
                    target: postRef.current,
                    keyboardOnly: true,
                },
            },
            ));
        }
    }, [hasReceivedA11yFocus, shouldHighlight]);

    useEffect(() => {
        if (a11yActive) {
            postRef.current?.dispatchEvent(new Event(A11yCustomEventTypes.UPDATE));
        }
    }, [a11yActive]);

    useEffect(() => {
        let removeEventListener: (type: string, listener: EventListener) => void;

        if (postRef.current) {
            postRef.current.addEventListener(A11yCustomEventTypes.ACTIVATE, handleA11yActivateEvent);
            postRef.current.addEventListener(A11yCustomEventTypes.DEACTIVATE, handleA11yDeactivateEvent);
            removeEventListener = postRef.current.removeEventListener;
        }

        return () => {
            if (removeEventListener) {
                removeEventListener(A11yCustomEventTypes.ACTIVATE, handleA11yActivateEvent);
                removeEventListener(A11yCustomEventTypes.DEACTIVATE, handleA11yDeactivateEvent);
            }
        };
    }, []);

    useEffect(() => {
        if (hover) {
            document.addEventListener('keydown', handleAlt);
            document.addEventListener('keyup', handleAlt);
        }

        return () => {
            document.removeEventListener('keydown', handleAlt);
            document.removeEventListener('keyup', handleAlt);
        };
    }, [hover]);

    useEffect(() => {
        document.addEventListener('keyup', handleA11yKeyboardFocus);

        return () => {
            document.removeEventListener('keyup', handleA11yKeyboardFocus);
        };
    }, [handleA11yKeyboardFocus]);

    const hasSameRoot = (props: Props) => {
        if (props.isFirstReply) {
            return false;
        } else if (!post.root_id && !props.previousPostIsComment && isConsecutivePostForUI) {
            return true;
        } else if (post.root_id) {
            return true;
        }
        return false;
    };

    const getChannelName = () => {
        let name: React.ReactNode = props.channelName;

        const isDirectMessage = props.channelType === Constants.DM_CHANNEL;
        const isPartOfThread = props.isCollapsedThreadsEnabled && (post.reply_count > 0 || post.is_following);

        if (isDirectMessage && isPartOfThread) {
            name = (
                <FormattedMessage
                    id='search_item.thread_direct'
                    defaultMessage='Thread in Direct Message (with {username})'
                    values={{
                        username: props.displayName,
                    }}
                />
            );
        } else if (isPartOfThread) {
            name = (
                <FormattedMessage
                    id='search_item.thread'
                    defaultMessage='Thread in {channel}'
                    values={{
                        channel: props.channelName,
                    }}
                />
            );
        } else if (isDirectMessage) {
            name = (
                <FormattedMessage
                    id='search_item.direct'
                    defaultMessage='Direct Message (with {username})'
                    values={{
                        username: props.displayName,
                    }}
                />
            );
        }

        return name;
    };

    const getPostHeaderVisible = (): boolean | null => {
        const boundingRectOfPostInfo: DOMRect | undefined = postHeaderRef.current?.getBoundingClientRect();

        let isPostHeaderVisibleToUser: boolean | null = null;
        if (boundingRectOfPostInfo) {
            isPostHeaderVisibleToUser = (boundingRectOfPostInfo.top - 65) > 0 &&
                boundingRectOfPostInfo.bottom < (window.innerHeight - 85);
        }

        return isPostHeaderVisibleToUser;
    };

    const getClassName = () => {
        const isMeMessage = checkIsMeMessage(post);
        const hovered =
            hover || fileDropdownOpened || dropdownOpened || a11yActive || props.isPostBeingEdited || (shouldHighlight && !fadeOutHighlight);
        return classNames('a11y__section post', {
            'post--highlight': shouldHighlight && !fadeOutHighlight,
            'post--jump-highlight': jumpHighlightPostId === post.id,
            'same--root': hasSameRoot(props),
            'other--root': !hasSameRoot(props) && !isSystemMessage,
            'post--bot': PostUtils.isFromBot(post),
            'post--editing': props.isPostBeingEdited,
            'current--user': props.currentUserId === post.user_id && !isSystemMessage,
            'post--system': isSystemMessage || isMeMessage,
            'post--root': props.hasReplies && !(post.root_id && post.root_id.length > 0),
            'post--comment': (post.root_id && post.root_id.length > 0 && !props.isCollapsedThreadsEnabled) || (props.location === Locations.RHS_COMMENT),
            'post--compact': props.compactDisplay,
            // 'post--hovered': hovered,
            'same--user': isConsecutivePostForUI && (!props.compactDisplay || props.location === Locations.RHS_COMMENT),
            'cursor--pointer': alt && !props.channelIsArchived,
            'post--hide-controls': post.failed || post.state === Posts.POST_DELETED,
            'post--comment same--root': fromAutoResponder,
            'post--pinned-or-flagged': (post.is_pinned || props.isFlagged) && props.location === Locations.CENTER,
            'mention-comment': props.isCommentMention,
            'post--thread': isRHS,
        });
    };

    const handleFileDropdownOpened = useCallback((open: boolean) => setFileDropdownOpened(open), []);

    const handleDropdownOpened = useCallback((opened: boolean) => {
        if (togglePostMenu) {
            togglePostMenu(opened);
        }
        setDropdownOpened(opened);
    }, [togglePostMenu]);

    useEffect(() => {
        dropdownOpenedRef.current = dropdownOpened;
    }, [dropdownOpened]);

    useEffect(() => {
        isHoveringWhatsAppPostOptionsRef.current = isHoveringWhatsAppPostOptions;
    }, [isHoveringWhatsAppPostOptions]);

    const toggleWhatsAppPostOptions = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowWhatsAppPostOptions((prev) => {
            const next = !prev;
            handleDropdownOpened(next);
            return next;
        });
    }, [handleDropdownOpened]);

    const updateWhatsAppPostOptionsPosition = useCallback(() => {
        const trigger = whatsAppPostOptionsTriggerRef.current;
        if (!trigger) {
            setWhatsAppPostOptionsPosition(null);
            return;
        }

        const rect = trigger.getBoundingClientRect();
        setWhatsAppPostOptionsPosition({
            left: rect.left + (rect.width / 2),
            bottom: window.innerHeight - rect.top + 6,
        });
    }, []);

    useEffect(() => {
        if (!usePortalForWhatsAppOptions || !showWhatsAppPostOptions || !whatsAppPostOptionsPosition) {
            return;
        }

        const raf = window.requestAnimationFrame(() => {
            const menu = whatsAppPostOptionsMenuRef.current;
            if (!menu) {
                return;
            }

            const menuRect = menu.getBoundingClientRect();
            const margin = 8;
            const halfWidth = menuRect.width / 2;

            const nextLeft = clamp(
                whatsAppPostOptionsPosition.left,
                halfWidth + margin,
                window.innerWidth - halfWidth - margin,
            );

            const nextBottom = clamp(
                whatsAppPostOptionsPosition.bottom,
                margin,
                window.innerHeight - menuRect.height - margin,
            );

            if (nextLeft !== whatsAppPostOptionsPosition.left || nextBottom !== whatsAppPostOptionsPosition.bottom) {
                setWhatsAppPostOptionsPosition({ left: nextLeft, bottom: nextBottom });
            }
        });

        return () => {
            window.cancelAnimationFrame(raf);
        };
    }, [usePortalForWhatsAppOptions, showWhatsAppPostOptions, whatsAppPostOptionsPosition]);

    useEffect(() => {
        if (!showWhatsAppPostOptions) {
            setWhatsAppPostOptionsPosition(null);
            return undefined;
        }

        let handleScroll: EventListener | null = null;
        let handleResize: EventListener | null = null;

        if (usePortalForWhatsAppOptions) {
            if (typeof window !== 'undefined' && window.innerWidth <= 750) {
                setShowWhatsAppPostOptions(false);
                handleDropdownOpened(false);
                return undefined;
            }

            updateWhatsAppPostOptionsPosition();

            handleScroll = () => updateWhatsAppPostOptionsPosition();
            handleResize = () => {
                if (typeof window !== 'undefined' && window.innerWidth <= 750) {
                    setShowWhatsAppPostOptions(false);
                    handleDropdownOpened(false);
                    return;
                }
                updateWhatsAppPostOptionsPosition();
            };

            document.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleResize);
        }

        const handleOutsideClick: EventListener = (event) => {
            const target = (event.target as Node | null);
            if (!target) {
                return;
            }

            if (dropdownOpenedRef.current) {
                return;
            }

            const targetEl = target as HTMLElement;
            if (targetEl.closest?.('.emoji-picker, .emoji-picker-overlay')) {
                return;
            }

            if (whatsAppPostOptionsRef.current?.contains(target) || whatsAppPostOptionsMenuRef.current?.contains(target)) {
                return;
            }

            setShowWhatsAppPostOptions(false);
            handleDropdownOpened(false);
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);

            if (handleScroll) {
                document.removeEventListener('scroll', handleScroll, true);
            }

            if (handleResize) {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, [showWhatsAppPostOptions, handleDropdownOpened, updateWhatsAppPostOptionsPosition, usePortalForWhatsAppOptions]);

    const handleMouseOver = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
        setHover(true);
        setAlt(e.altKey);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHover(false);
        setAlt(false);

        if (!showWhatsAppPostOptions) {
            return;
        }

        if (pendingCloseTimeoutRef.current) {
            clearTimeout(pendingCloseTimeoutRef.current);
        }

        pendingCloseTimeoutRef.current = setTimeout(() => {
            if (dropdownOpenedRef.current || isHoveringWhatsAppPostOptionsRef.current) {
                return;
            }

            setShowWhatsAppPostOptions(false);
            handleDropdownOpened(false);
        }, 150);
    }, [showWhatsAppPostOptions, handleDropdownOpened]);

    const handleCardClick = (post?: Post) => {
        if (!post) {
            return;
        }
        if (props.handleCardClick) {
            props.handleCardClick(post);
        }
        props.actions.selectPostCard(post);
    };

    // When adding clickable targets within a root post to exclude from post's on click to open thread,
    // please add to/maintain the selector below
    const isEligibleForClick = useMemo(() => makeIsEligibleForClick('.post-image__column, .embed-responsive-item, .attachment, .hljs, code'), []);

    const handlePostClick = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
        if (!post || props.channelIsArchived) {
            return;
        }

        if (isPostMultiSelectModeEnabled && props.location === Locations.CENTER) {
            dispatch({
                type: ActionTypes.TOGGLE_MULTISELECT_POST,
                data: { postId: post.id },
            });
            return;
        }

        if (
            !e.altKey &&
            props.clickToReply &&
            (fromAutoResponder || !isSystemMessage) &&
            isEligibleForClick(e) &&
            props.location === Locations.CENTER &&
            !props.isPostBeingEdited
        ) {
            clearClickDebounceTimeout();
            clickDebounceTimeout.current = setTimeout(() => {
                props.actions.selectPost(post);
            }, postClickDelay);
        }

        if (e.altKey) {
            props.actions.markPostAsUnread(post, props.location);
        }
    }, [
        post,
        isPostMultiSelectModeEnabled,
        fromAutoResponder,
        isEligibleForClick,
        isSystemMessage,
        props.channelIsArchived,
        props.clickToReply,
        props.actions,
        props.location,
        props.isPostBeingEdited,
        clearClickDebounceTimeout,
        postClickDelay,
        dispatch,
    ]);

    const handleJumpClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (props.isMobileView) {
            props.actions.closeRightHandSide();
        }

        props.actions.setRhsExpanded(false);
        getHistory().push(`/${props.teamName}/pl/${post.id}`);
    }, [props.isMobileView, props.actions, props.teamName, post?.id]);

    const { selectPostFromRightHandSideSearch } = props.actions;

    const handleCommentClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!post) {
            return;
        }
        selectPostFromRightHandSideSearch(post);
    }, [post, selectPostFromRightHandSideSearch]);

    const handleThreadClick = useCallback((e: React.MouseEvent) => {
        if (props.currentTeam?.id === teamId) {
            handleCommentClick(e);
        } else {
            handleJumpClick(e);
        }
    }, [handleCommentClick, handleJumpClick, props.currentTeam?.id, teamId]);

    const handleRevealBurnOnRead = useCallback(async (postId: string) => {
        setBurnOnReadRevealing(true);
        setBurnOnReadRevealError(null);

        try {
            const result = await props.actions.revealBurnOnReadPost(postId);

            if (result && typeof result === 'object' && 'error' in result) {
                let errorMessage = intl.formatMessage({
                    id: 'post.burn_on_read.reveal_error.generic',
                    defaultMessage: 'Failed to reveal message. Please try again.',
                });

                const statusCode = (result as any).error?.status_code;
                if (statusCode === 404) {
                    errorMessage = intl.formatMessage({
                        id: 'post.burn_on_read.reveal_error.not_found',
                        defaultMessage: 'This message is no longer available.',
                    });
                } else if (statusCode === 403) {
                    errorMessage = intl.formatMessage({
                        id: 'post.burn_on_read.reveal_error.forbidden',
                        defaultMessage: "You don't have permission to view this message.",
                    });
                }

                setBurnOnReadRevealError(errorMessage);
            }
        } finally {
            setBurnOnReadRevealing(false);
        }
    }, [props.actions, intl]);

    const handleOpenBurnOnReadConfirmModal = useCallback((isSenderDelete: boolean) => {
        setBurnOnReadConfirmModalIsSenderDelete(isSenderDelete);
        setBurnOnReadConfirmModalVisible(true);
    }, []);

    const handleCloseBurnOnReadConfirmModal = useCallback(() => {
        if (burnOnReadConfirmModalLoading) {
            return;
        }

        setBurnOnReadConfirmModalVisible(false);
    }, [burnOnReadConfirmModalLoading]);

    const handleConfirmBurnOnReadDelete = useCallback(async (_skipConfirmation: boolean) => {
        if (!props.actions.burnPostNow) {
            setBurnOnReadConfirmModalVisible(false);
            return;
        }

        setBurnOnReadConfirmModalLoading(true);
        try {
            await props.actions.burnPostNow(post.id);
            setBurnOnReadConfirmModalVisible(false);
        } finally {
            setBurnOnReadConfirmModalLoading(false);
        }
    }, [post.id, props.actions]);

    const handleTimerChipClick = useCallback(() => {
        handleOpenBurnOnReadConfirmModal(post.user_id === props.currentUserId);
    }, [handleOpenBurnOnReadConfirmModal, post.user_id, props.currentUserId]);

    const postClass = classNames('post__body', { 'post--edited': PostUtils.isEdited(post), 'search-item-snippet': isSearchResultItem });

    let comment;
    if (props.isFirstReply && post.type !== Constants.PostTypes.EPHEMERAL) {
        comment = (
            <CommentedOn
                onCommentClick={handleCommentClick}
                rootId={post.root_id}
                enablePostUsernameOverride={props.enablePostUsernameOverride}
            />
        );
    }

    let visibleMessage = null;
    if (post.type === Constants.PostTypes.EPHEMERAL && !props.compactDisplay && post.state !== Posts.POST_DELETED) {
        visibleMessage = (
            <span className='post__visibility'>
                <FormattedMessage
                    id='post_info.message.visible'
                    defaultMessage='(Only visible to you)'
                />
            </span>
        );
    }

    let profilePic;
    const hideProfilePicture = hasSameRoot(props) && (!post.root_id && !props.hasReplies) && !PostUtils.isFromBot(post);
    const hideProfileCase = !(props.location === Locations.RHS_COMMENT && props.compactDisplay && isConsecutivePostForUI);
    if (!hideProfilePicture && hideProfileCase) {
        profilePic = (
            <PostProfilePicture
                compactDisplay={props.compactDisplay}
                post={post}
                userId={post.user_id}
            />
        );

        if (fromAutoResponder) {
            profilePic = (
                <span className='auto-responder'>
                    {profilePic}
                </span>
            );
        }
    }

    const message = isSearchResultItem ? (
        <PostBodyAdditionalContent
            post={post}
            options={{
                searchTerm: props.term,
                searchMatches: props.matches,
            }}
        >
            <PostMessageContainer
                post={post}
                options={{
                    searchTerm: props.term,
                    searchMatches: props.matches,
                    mentionHighlight: props.isMentionSearch,
                }}
                isRHS={isRHS}
            />
        </PostBodyAdditionalContent>
    ) : (
        <MessageWithAdditionalContent
            post={post}
            isEmbedVisible={props.isEmbedVisible}
            pluginPostTypes={props.pluginPostTypes}
            isRHS={isRHS}
            compactDisplay={props.compactDisplay}
        />
    );

    const slotBasedOnEditOrMessageView = props.isPostBeingEdited ? AutoHeightSlots.SLOT2 : AutoHeightSlots.SLOT1;
    const threadFooter = props.location !== Locations.RHS_ROOT && props.isCollapsedThreadsEnabled && !post.root_id && (props.hasReplies || post.is_following) ? (
        <ThreadFooter
            threadId={post.id}
            replyClick={handleThreadClick}
        />
    ) : null;
    const channelDisplayName = getChannelName();
    const showConcealedPlaceholder = Boolean(props.isConcealed) && !props.isRevealed;
    const showReactions = (props.location !== Locations.SEARCH || props.isPinnedPosts || props.isFlaggedPosts) && !showConcealedPlaceholder;

    const isPostForwarded = Boolean(post.props?.is_forwarded);
    const forwardedPostMessageText = (post.props?.forwarded_post_message_text as string) || '';

    const forwardedPermalinkPostId = useMemo(() => {
        if (!isPostForwarded) {
            return '';
        }

        const msg = post.message || '';
        const match = msg.match(/\/pl\/([a-z0-9]+)/i);
        return match?.[1] || '';
    }, [isPostForwarded, post.message]);

    const forwardedPermalink = useSelector((state: GlobalState) => {
        if (!forwardedPermalinkPostId || !teamId) {
            return '';
        }
        return getPermalinkURL(state, teamId, forwardedPermalinkPostId);
    });

    const repliedToPost = post.props?.repliedToPost as Post | undefined;
    const repliedToPermalink = useSelector((state: GlobalState) => {
        if (!repliedToPost?.id || !teamId) {
            return '';
        }
        return getPermalinkURL(state, teamId, repliedToPost.id);
    });
    const repliedToUser = useSelector((state: GlobalState) => {
        if (!repliedToPost?.user_id) {
            return null;
        }
        return getUser(state, repliedToPost.user_id);
    });
    const repliedToUserFullName = repliedToUser ? (getFullName(repliedToUser) || repliedToUser.username) : '';
    const repliedToUserProfileImageURL = repliedToUser?.id ? imageURLForUser(repliedToUser.id, repliedToUser.last_picture_update) : undefined;

    const forwardedText = (
        <div className='post-forward-info mb-1'>
            <TiArrowForwardOutline size={14} />
            {intl.formatMessage({
                id: 'post_props.props.forwarded',
                defaultMessage: 'Forwarded',
            })}
        </div>
    );
    const getTestId = () => {
        let idPrefix: string;
        switch (props.location) {
            case 'CENTER':
                idPrefix = 'post';
                break;
            case 'RHS_ROOT':
            case 'RHS_COMMENT':
                idPrefix = 'rhsPost';
                break;
            case 'SEARCH':
                idPrefix = 'searchResult';
                break;

            default:
                idPrefix = 'post';
        }

        return idPrefix + `_${post.id}`;
    };

    const burnOnReadBadge = isBoRPost ? (
        <BurnOnReadBadge
            post={post}
            isSender={post.user_id === props.currentUserId}
            revealed={Boolean(props.isRevealed)}
            expireAt={props.expireAt}
            maxExpireAt={props.maxExpireAt}
            onReveal={handleRevealBurnOnRead}
            onSenderDelete={() => handleOpenBurnOnReadConfirmModal(true)}
        />
    ) : null;

    let priority;
    if (post.metadata?.priority && props.isPostPriorityEnabled && post.state !== Posts.POST_DELETED) {
        priority = <span className='d-flex mr-2 ml-1'><PriorityLabel priority={post.metadata.priority.priority} /></span>;
    }

    let burnOnReadTimerChip;
    if (isBoRPost && !showConcealedPlaceholder) {
        const hasExpireAt = typeof post.metadata?.expire_at === 'number';

        if (hasExpireAt) {
            burnOnReadTimerChip = (
                <BurnOnReadTimerChip
                    expireAt={post.metadata.expire_at as number}
                    onClick={handleTimerChipClick}
                />
            );
        }
    }
    let postAriaLabelDivTestId = '';
    if (props.location === Locations.CENTER) {
        postAriaLabelDivTestId = 'postView';
    } else if (props.location === Locations.RHS_ROOT || props.location === Locations.RHS_COMMENT) {
        postAriaLabelDivTestId = 'rhsPostView';
    }

    const showFileAttachments = post.file_ids && post.file_ids.length > 0 && !props.isPostBeingEdited && !showConcealedPlaceholder;

    // cSpell:ignore BUZZMESSAGE
    const BUZZMESSAGE = 'BUZZMESSAGE';

    const messageWrapperClass = classNames({
        'buzz-message ': post.message === BUZZMESSAGE,
        'post--left1': post.message !== BUZZMESSAGE && props.currentUserId === post.user_id,
        'post--right1': post.message !== BUZZMESSAGE && props.currentUserId !== post.user_id,
        'first-post': !isConsecutivePostForUI,
        'post--multiselected': isMultiSelected,
    });

    const handleDoublePostClick = useCallback(() => {
        clearClickDebounceTimeout();
        dispatch({
            type: 'SET_FOCUS_POST',
            post,
        });
    }, [clearClickDebounceTimeout, dispatch, post]);

    const onToggleReplyBox = useCallback((method: 'open' | 'close', targetPost?: Post) => {
        dispatch({
            type: 'TOGGLE_REPLY_BOX',
            method,
            post: targetPost,
        });
    }, [dispatch]);

    return (
        <>
            <PostAriaLabelDiv
                ref={postRef}
                id={getTestId()}
                data-testid={postAriaLabelDivTestId}
                post={post}
                className={getClassName()}
                onClick={handlePostClick}
                onDoubleClick={props.isPostBeingEdited ? undefined : handleDoublePostClick}
                onMouseOver={handleMouseOver}
                onMouseLeave={handleMouseLeave}
            >
                <PostSearchHeader
                    post={post}
                    location={props.location}
                    isFlagged={props.isFlagged}
                    isFlaggedPosts={props.isFlaggedPosts}
                    isPinnedPosts={props.isPinnedPosts}
                    channelDisplayName={channelDisplayName}
                    teamDisplayName={props.teamDisplayName}
                    channelIsArchived={props.channelIsArchived}
                />
                <div className={props.currentUserId === post.user_id ? 'post--left' : 'post--right'}>
                    <PostPreHeader
                        isFlagged={props.isFlagged}
                        isPinned={post.is_pinned}
                        skipPinned={props.location === Locations.SEARCH && props.isPinnedPosts}
                        skipFlagged={props.location === Locations.SEARCH && props.isFlaggedPosts}
                        channelId={post.channel_id}
                    />
                </div>
                <div
                    className={`post__content ${props.center ? 'center' : ''} ${props.currentUserId === post.user_id ? 'post--left' : 'post--right'
                        }`}
                    data-testid='postContent'
                >
                    <div className='post__img'>
                        {profilePic}
                    </div>
                    <div>
                        <div
                            className='post__header'
                            ref={postHeaderRef}
                        >
                            <PostUserProfile
                                post={post}
                                compactDisplay={props.compactDisplay}
                                colorizeUsernames={props.colorizeUsernames}
                                enablePostUsernameOverride={props.enablePostUsernameOverride}
                                isConsecutivePost={isConsecutivePostForUI}
                                isBot={props.isBot}
                                isSystemMessage={isSystemMessage}
                                isMobileView={props.isMobileView}
                                location={props.location}
                            />
                            <div className='col d-flex align-items-center'>
                                {!isConsecutivePostForUI && (
                                    <PostTime
                                        isPermalink={false}
                                        teamName={props.team?.name}
                                        eventTime={post.create_at}
                                        postId={post.id}
                                        location={props.location}
                                        timestampProps={{ ...props.timestampProps, style: isConsecutivePostForUI && !props.compactDisplay ? 'narrow' : undefined }}
                                    />
                                )}
                                {burnOnReadBadge}
                                {priority}
                                {burnOnReadTimerChip}
                                {Boolean(post.props && post.props.card) &&
                                    <WithTooltip
                                        title={
                                            <FormattedMessage
                                                id='post_info.info.view_additional_info'
                                                defaultMessage='View additional info'
                                            />
                                        }
                                    >
                                        <button
                                            className={'card-icon__container icon--show style--none ' + (props.isCardOpen ? 'active' : '')}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleCardClick(post);
                                            }}
                                        >
                                            <InfoSmallIcon
                                                className='icon icon__info'
                                                aria-hidden='true'
                                            />
                                        </button>
                                    </WithTooltip>
                                }
                                {visibleMessage}
                            </div>

                            {!props.isPostBeingEdited && !usePortalForWhatsAppOptions && (
                                <PostOptions
                                    {...props}
                                    teamId={teamId}
                                    handleDropdownOpened={handleDropdownOpened}
                                    handleCommentClick={handleCommentClick}
                                    hover={hover || a11yActive || dropdownOpened}
                                    removePost={props.actions.removePost}
                                    handleJumpClick={handleJumpClick}
                                    isPostHeaderVisible={getPostHeaderVisible()}
                                    toggleReplyBox={onToggleReplyBox}
                                />
                            )}
                        </div>
                        {comment}
                        <div
                            className={postClass}
                            id={isRHS ? undefined : `${post.id}_message`}
                        >
                            <div
                                className='whatsapp-message-row'
                                ref={whatsAppPostOptionsRef}
                            >
                                {isPostMultiSelectModeEnabled && props.location === Locations.CENTER && (
                                    <input
                                        type='checkbox'
                                        checked={isMultiSelected}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            dispatch({
                                                type: ActionTypes.TOGGLE_MULTISELECT_POST,
                                                data: { postId: post.id },
                                            });
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ marginInline: '6px', marginTop: '2px' }}
                                    />
                                )}
                                <div className={messageWrapperClass}>
                                    {post.failed && <FailedPostOptions post={post} />}
                                    {!props.isPostBeingEdited && repliedToPost && (
                                        <ReplyPreview
                                            username={repliedToUser?.username}
                                            userFullName={repliedToUserFullName}
                                            userProfileImageURL={repliedToUserProfileImageURL}
                                            text={repliedToPost?.message || ''}
                                            fileId={repliedToPost?.file_ids?.[0]}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();

                                                if (!repliedToPost?.id) {
                                                    return;
                                                }

                                                const targetId = `${repliedToPost.id}_message`;
                                                const targetEl = document.getElementById(targetId);
                                                if (targetEl) {
                                                    targetEl.scrollIntoView({ block: 'center' });
                                                    highlightPostElementTemporarily(repliedToPost.id);
                                                    return;
                                                }

                                                // Not currently rendered/loaded: fallback to permalink navigation (loads only when needed).
                                                if (repliedToPermalink) {
                                                    getHistory().push(repliedToPermalink);
                                                }
                                            }}
                                        />
                                    )}
                                    {showFileAttachments && (
                                        <FileAttachmentListContainer
                                            post={post}
                                            compactDisplay={props.compactDisplay}
                                            handleFileDropdownOpened={handleFileDropdownOpened}
                                        />
                                    )}
                                    {isPostForwarded && forwardedPostMessageText && (
                                        <ReplyPreview
                                            userFullName={forwardedText}
                                            text={forwardedPostMessageText}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();

                                                if (!forwardedPermalinkPostId) {
                                                    return;
                                                }

                                                const targetId = `${forwardedPermalinkPostId}_message`;
                                                const targetEl = document.getElementById(targetId);
                                                if (targetEl) {
                                                    targetEl.scrollIntoView({ block: 'center' });
                                                    highlightPostElementTemporarily(forwardedPermalinkPostId);
                                                    return;
                                                }

                                                // Not currently rendered/loaded: fallback to permalink navigation (loads only when needed).
                                                if (forwardedPermalink) {
                                                    getHistory().push(forwardedPermalink);
                                                }
                                            }}
                                            previewComponent={
                                                post.file_ids && post.file_ids.length > 0 ? (
                                                    <FileAttachmentListContainer
                                                        post={post}
                                                        compactDisplay={props.compactDisplay}
                                                        handleFileDropdownOpened={handleFileDropdownOpened}
                                                    />
                                                ) : null
                                            }
                                        />
                                    )}
                                    {showConcealedPlaceholder ? (
                                        <BurnOnReadConcealedPlaceholder
                                            postId={post.id}
                                            authorName={props.displayName || post.user_id}
                                            onReveal={handleRevealBurnOnRead}
                                            loading={burnOnReadRevealing}
                                            error={burnOnReadRevealError}
                                        />
                                    ) : (
                                        <AutoHeightSwitcher
                                            showSlot={slotBasedOnEditOrMessageView}
                                            shouldScrollIntoView={props.isPostBeingEdited}
                                            slot1={message}
                                            slot2={<EditPost />}
                                            onTransitionEnd={() => document.dispatchEvent(new Event(AppEvents.FOCUS_EDIT_TEXTBOX))}
                                        />
                                    )}
                                    {!props.isPostBeingEdited && (
                                        <div
                                            className='d-flex pt-1 post-time-in-bubble'
                                            style={{ gap: '4px', justifyContent: 'end' }}
                                        >
                                            {(props.isConsecutivePost || props.expireAt) && (
                                                <div className='d-flex align-items-center' style={{ gap: '4px' }}>
                                                    {props.isConsecutivePost && (
                                                        <PostTime
                                                            isPermalink={false}
                                                            teamName={props.team?.name}
                                                            eventTime={post.create_at}
                                                            postId={post.id}
                                                            location={props.location}
                                                            timestampProps={{ ...props.timestampProps, style: props.isConsecutivePost && !props.compactDisplay ? 'narrow' : undefined }}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            <div className='post__body-reactions-acks'>
                                                {(post.props?.ack === true || Boolean(post.props?.acknowledgements)) &&
                                                    post.message !== BUZZMESSAGE && (
                                                        <PostAcknowledgements
                                                            authorId={post.user_id}
                                                            isDeleted={post.state === Posts.POST_DELETED}
                                                            postId={post.id}
                                                        />
                                                    )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {usePortalForWhatsAppOptions && !props.isPostBeingEdited && (hover || a11yActive || showWhatsAppPostOptions) && (
                                    <div className='whatsapp-post-options-anchor'>
                                        <button
                                            type='button'
                                            className='whatsapp-post-options-trigger'
                                            onClick={toggleWhatsAppPostOptions}
                                            ref={whatsAppPostOptionsTriggerRef}
                                        >
                                            <EmojiIcon />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {usePortalForWhatsAppOptions && showWhatsAppPostOptions && whatsAppPostOptionsPosition && createPortal(
                                <div
                                    className='whatsapp-post-options-bar'
                                    ref={whatsAppPostOptionsMenuRef}
                                    onMouseEnter={() => {
                                        if (pendingCloseTimeoutRef.current) {
                                            clearTimeout(pendingCloseTimeoutRef.current);
                                            pendingCloseTimeoutRef.current = null;
                                        }
                                        setIsHoveringWhatsAppPostOptions(true);
                                    }}
                                    onMouseLeave={() => {
                                        setIsHoveringWhatsAppPostOptions(false);
                                    }}
                                    style={{
                                        position: 'fixed',
                                        left: whatsAppPostOptionsPosition.left,
                                        bottom: whatsAppPostOptionsPosition.bottom,
                                        transform: 'translateX(-50%)',
                                        zIndex: 999,
                                    }}
                                >
                                    <PostOptions
                                        {...props}
                                        teamId={teamId}
                                        handleDropdownOpened={handleDropdownOpened}
                                        handleCommentClick={handleCommentClick}
                                        hover={true}
                                        replaceFlagWithCopy={true}
                                        removePost={props.actions.removePost}
                                        handleJumpClick={handleJumpClick}
                                        isPostHeaderVisible={getPostHeaderVisible()}
                                        toggleReplyBox={onToggleReplyBox}
                                    />
                                </div>,
                                document.body,
                            )}
                            {showReactions && <ReactionList post={post} />}
                            {threadFooter}
                        </div>
                    </div>
                </div>
            </PostAriaLabelDiv>

            <BurnOnReadConfirmationModal
                show={burnOnReadConfirmModalVisible}
                onConfirm={handleConfirmBurnOnReadDelete}
                onCancel={handleCloseBurnOnReadConfirmModal}
                loading={burnOnReadConfirmModalLoading}
                isSenderDelete={burnOnReadConfirmModalIsSenderDelete}
            />
        </>
    );
}

export default withPostErrorBoundary(memo(PostComponent));
