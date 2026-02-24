// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {type WrappedComponentProps, injectIntl, type IntlShape} from 'react-intl';
import {Link} from 'react-router-dom';

import type {Channel} from '@workspace/types/channels';
import type {FileInfo} from '@workspace/types/files';
import {PostPriority, type Post} from '@workspace/types/posts';

import {getFileType} from 'workspace-redux/utils/file_utils';

import {mark} from 'actions/telemetry_actions';

// import BuzzSvg from 'components/advanced_text_editor/buzz_svg';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
// eslint-disable-next-line import/order
import PostMarkdown from 'components/post_markdown';
// eslint-disable-next-line import/order
import SharedChannelIndicator from 'components/shared_channel_indicator';

// eslint-disable-next-line import/order
import {ChannelsAndDirectMessagesTour} from 'components/tours/onboarding_tour';
import WithTooltip from 'components/with_tooltip';

import AudioIcon from 'images/icons/audio.png';
import PictureIcon from 'images/icons/picture.png';
// eslint-disable-next-line import/order
import FileIcon from 'images/icons/file.png';
import VideoIcon from 'images/icons/video.svg';
import Pluggable from 'plugins/pluggable';
import Constants, {RHSStates} from 'utils/constants';
import {isToday, isYesterday} from 'utils/datetime';
import {wrapEmojis} from 'utils/emoji_utils';
import {cmdOrCtrlPressed} from 'utils/keyboard';
import {Mark} from 'utils/performance_telemetry';

import type {RhsState} from 'types/store/rhs';

import ChannelMentionBadge from '../channel_mention_badge';
import ChannelPencilIcon from '../channel_pencil_icon';
import SidebarChannelIcon from '../sidebar_channel_icon';
import SidebarChannelMenu from '../sidebar_channel_menu';

type Props = WrappedComponentProps & {
    channel: Channel;
    link: string;
    label: string;
    ariaLabelPrefix?: string;
    channelLeaveHandler?: (callback: () => void) => void;
    icon: JSX.Element | null;

    /**
     * Number of unread mentions in this channel
     */
    unreadMentions: number;

    /**
     * Whether or not the channel is shown as unread
     */
    isUnread: boolean;

    /**
     * Checks if the current channel is muted
     */
    isMuted: boolean;
    unreadMsgs?: number;
    isChannelSelected: boolean;

    teammateId?: string;

    firstChannelName?: string;

    showChannelsTutorialStep: boolean;

    hasUrgent: boolean;
    rhsState?: RhsState;
    rhsOpen?: boolean;
    isSharedChannel?: boolean;
    remoteNames: string[];
    lastPost?: Post;
    lastPostFirstFileInfo?: FileInfo;

    actions: {
        markMostRecentPostInChannelAsUnread: (channelId: string) => void;
        clearChannelSelection: () => void;
        multiSelectChannelTo: (channelId: string) => void;
        multiSelectChannelAdd: (channelId: string) => void;
        unsetEditingPost: () => void;
        closeRightHandSide: () => void;
        fetchChannelRemotes: (channelId: string) => void;
        getCustomEmojisInText: (text: string) => void;
    };
};

type State = {
    isMenuOpen: boolean;
    showTooltip: boolean;
};

function formatTime(date: Date, intl: IntlShape) {
    if (isToday(date)) {
        return intl.formatTime(date, {hour: 'numeric', minute: 'numeric'});
    }

    if (isYesterday(date)) {
        return intl.formatMessage({id: 'datetime.yesterday', defaultMessage: 'Yesterday'});
    }

    return intl.formatDate(date, {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    });
}

export class SidebarChannelLink extends React.PureComponent<Props, State> {
    labelRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.labelRef = React.createRef();

        this.state = {
            isMenuOpen: false,
            showTooltip: false,
        };
    }

    componentDidMount(): void {
        this.enableToolTipIfNeeded();

        if (this.props.isSharedChannel && this.props.channel?.id && this.props.remoteNames.length === 0) {
            this.props.actions.fetchChannelRemotes(this.props.channel.id);
        }

        if (this.props.lastPost?.message) {
            this.props.actions.getCustomEmojisInText(this.props.lastPost.message);
        }
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.label !== this.props.label) {
            this.enableToolTipIfNeeded();
        }

        if (this.props.isSharedChannel &&
            (prevProps.channel?.id !== this.props.channel?.id || prevProps.channel?.team_id !== this.props.channel?.team_id) &&
            this.props.remoteNames.length === 0 &&
            this.props.channel?.id) {
            this.props.actions.fetchChannelRemotes(this.props.channel.id);
        }

        const prevMessage = prevProps.lastPost?.message;
        const nextMessage = this.props.lastPost?.message;
        if (nextMessage && prevMessage !== nextMessage) {
            this.props.actions.getCustomEmojisInText(nextMessage);
        }
    }

    enableToolTipIfNeeded = (): void => {
        const element = this.labelRef.current;
        const showTooltip = element && element.offsetWidth < element.scrollWidth;
        this.setState({showTooltip: Boolean(showTooltip)});
    };

    getAriaLabel = (): string => {
        const {label, ariaLabelPrefix, unreadMentions, intl} = this.props;

        let ariaLabel = label;

        if (ariaLabelPrefix) {
            ariaLabel += ` ${ariaLabelPrefix}`;
        }

        if (unreadMentions === 1) {
            ariaLabel += ` ${unreadMentions} ${intl.formatMessage({id: 'accessibility.sidebar.types.mention', defaultMessage: 'mention'})}`;
        } else if (unreadMentions > 1) {
            ariaLabel += ` ${unreadMentions} ${intl.formatMessage({id: 'accessibility.sidebar.types.mentions', defaultMessage: 'mentions'})}`;
        }

        if (this.props.isUnread && unreadMentions === 0) {
            ariaLabel += ` ${intl.formatMessage({id: 'accessibility.sidebar.types.unread', defaultMessage: 'unread'})}`;
        }

        return ariaLabel.toLowerCase();
    };

    handleChannelClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
        mark(Mark.ChannelLinkClicked);
        this.handleSelectChannel(event);

        if (this.props.rhsOpen && this.props.rhsState === RHSStates.EDIT_HISTORY) {
            this.props.actions.closeRightHandSide();
        }
    };

    handleSelectChannel = (event: React.MouseEvent<HTMLAnchorElement>): void => {
        if (event.defaultPrevented || event.button !== 0) {
            return;
        }

        if (cmdOrCtrlPressed(event as unknown as React.KeyboardEvent)) {
            event.preventDefault();
            this.props.actions.multiSelectChannelAdd(this.props.channel.id);
        } else if (event.shiftKey) {
            event.preventDefault();
            this.props.actions.multiSelectChannelTo(this.props.channel.id);
        } else if (event.altKey && !this.props.isUnread) {
            event.preventDefault();
            this.props.actions.markMostRecentPostInChannelAsUnread(this.props.channel.id);
        } else {
            this.props.actions.clearChannelSelection();
        }
    };

    handleMenuToggle = (isMenuOpen: boolean) => {
        this.setState({isMenuOpen});
    };

    stopEventPropagation = (event: React.SyntheticEvent) => {
        event.stopPropagation();
    };

    stopAndPreventEvent = (event: React.SyntheticEvent) => {
        event.preventDefault();
        event.stopPropagation();
    };

    render(): JSX.Element {
        const {
            channel,
            icon,
            isChannelSelected,
            isMuted,
            isUnread,
            label,
            link,
            unreadMsgs,
            unreadMentions,
            firstChannelName,
            showChannelsTutorialStep,
            hasUrgent,
        } = this.props;

        const lastPost = this.props.lastPost;
        const lastPostFirstFileInfo = this.props.lastPostFirstFileInfo;
        const lastPostFirstFile = (lastPost as Post | undefined)?.metadata?.files?.[0];
        const lastPostFirstFileMimeType = lastPostFirstFile?.mime_type || '';
        const lastPostFirstFileName = lastPostFirstFile?.name || '';
        const lastPostType = typeof lastPost?.props?.type === 'string' ? lastPost.props.type : lastPost?.type;
        const isDataSpillageReport = lastPostType === Constants.PostTypes.CUSTOM_DATA_SPILLAGE_REPORT;

        const isGifLastPost = (() => {
            const fileExt = (lastPostFirstFileInfo?.extension || '').toLowerCase();
            if (fileExt === 'gif') {
                return true;
            }

            const nameLower = (lastPostFirstFileName || '').toLowerCase();
            if (nameLower.endsWith('.gif')) {
                return true;
            }

            if (lastPostFirstFileMimeType.toLowerCase() === 'image/gif') {
                return true;
            }

            const message = lastPost?.message || '';
            const gifMarkdownRegex = /!\[[^\]]*\]\(([^)]+)\)/i;
            const match = message.match(gifMarkdownRegex);
            if (match?.[1]?.toLowerCase().includes('.gif')) {
                return true;
            }

            return false;
        })();

        const isBuzzMessage = lastPost?.message === 'BUZZMESSAGE';

        const lastPostHasFiles = Boolean(lastPost?.file_ids?.length);
        const lastPostHasText = Boolean(lastPost?.message?.trim());
        const getLastPostFileCategory = (mimeType: string, filename: string, post?: Post) => {
            const lowerName = (filename || '').toLowerCase();
            const ext = lowerName.includes('.') ? lowerName.split('.').pop() : '';

            // Some common image extensions are not part of Files.IMAGE_TYPES used by getFileType.
            const extraImageExts = ['svg', 'webp', 'heic', 'heif', 'tiff', 'tif'];

            if (lastPostFirstFileInfo?.extension) {
                const storeExt = lastPostFirstFileInfo.extension.toLowerCase();
                if (extraImageExts.includes(storeExt)) {
                    return 'image';
                }

                const fileType = getFileType(lastPostFirstFileInfo);
                if (fileType === 'image' || fileType === 'video' || fileType === 'audio') {
                    return fileType;
                }
            }

            const hasImageMetadata = Boolean(post?.metadata?.images && Object.keys(post.metadata.images).length > 0);

            if (ext) {
                if (extraImageExts.includes(ext)) {
                    return 'image';
                }

                const fileInfo = {extension: ext} as FileInfo;
                const fileType = getFileType(fileInfo);
                if (fileType === 'image' || fileType === 'video' || fileType === 'audio') {
                    return fileType;
                }
            }

            if (mimeType.startsWith('image/')) {
                return 'image';
            }

            if (mimeType.startsWith('video/')) {
                return 'video';
            }

            if (mimeType.startsWith('audio/')) {
                return 'audio';
            }

            if (hasImageMetadata) {
                return 'image';
            }

            return 'file';
        };

        const lastPostAttachmentIcon = (() => {
            if (!lastPostHasFiles) {
                return null;
            }

            const category = getLastPostFileCategory(lastPostFirstFileMimeType, lastPostFirstFileName, lastPost);
            // eslint-disable-next-line no-nested-ternary
            const iconSrc = category === 'image' ? PictureIcon : (category === 'audio' ? AudioIcon : (category === 'video' ? VideoIcon : FileIcon));
            // eslint-disable-next-line no-nested-ternary
            const alt = category === 'image' ? 'Image' : (category === 'audio' ? 'Audio' : (category === 'video' ? 'Video' : 'File'));
            // eslint-disable-next-line no-nested-ternary
            const labelText = category === 'image' ? 'صورة' : (category === 'audio' ? 'صوت' : (category === 'video' ? 'فيديو' : 'ملف'));
            const shouldShowLabelText = !lastPostHasText;

            return (
                <>
                    <img
                        src={iconSrc}
                        alt={alt}
                        style={{
                            width: 12,
                            height: 12,
                            objectFit: 'contain',
                            verticalAlign: 'middle',
                            flexShrink: 0,
                        }}
                    />
                    {' '}
                    {shouldShowLabelText && <span>{labelText}</span>}
                </>
            );
        })();

        let channelsTutorialTip: JSX.Element | null = null;

        // firstChannelName is based on channel.name,
        // but we want to display `display_name` to the user, so we check against `.name` for channel equality but pass in the .display_name value
        if (firstChannelName === channel.name || (!firstChannelName && showChannelsTutorialStep && channel.name === Constants.DEFAULT_CHANNEL)) {
            channelsTutorialTip = firstChannelName ? (<ChannelsAndDirectMessagesTour firstChannelName={channel.display_name}/>) : <ChannelsAndDirectMessagesTour/>;
        }

        let labelElement: JSX.Element = (
            <span
                ref={this.labelRef}
                className='SidebarChannelLinkLabel'
            >
                {wrapEmojis(label)}
            </span>
        );
        if (this.state.showTooltip) {
            labelElement = (
                <WithTooltip
                    title={label}
                >
                    {labelElement}
                </WithTooltip>
            );
        }

        const customStatus = this.props.teammateId ? (
            <CustomStatusEmoji
                userID={this.props.teammateId}
                showTooltip={true}
                spanStyle={{
                    height: 18,
                }}
                emojiStyle={{
                    marginTop: -4,
                    marginBottom: 0,
                    opacity: 0.8,
                }}
            />
        ) : null;

        const sharedChannelIcon = this.props.isSharedChannel ? (
            <SharedChannelIndicator
                className='icon'
                withTooltip={true}
                remoteNames={this.props.remoteNames}
            />
        ) : null;

        const content = (
            <>
                <SidebarChannelIcon
                    isDeleted={channel.delete_at !== 0}
                    icon={icon}
                />
                <div className='SidebarChannelLinkLabel_wrapper'>
                    {labelElement}
                    <div
                        className='SidebarChannelLinkLabel_last-message-container'
                    >
                        <div
                            className='SidebarChannelLinkLabel_last-message'
                        >
                            {isGifLastPost ? (
                                <span>{this.props.intl.formatMessage({id: 'sidebar.channel_link.last_message.gif', defaultMessage: 'Animated image'})}</span>
                            ) : (
                                <>
                                    {lastPostAttachmentIcon}
                                    {isDataSpillageReport ? (
                                        <span className='SidebarChannelLinkLabel_last-message-data-spillage'>
                                            {this.props.intl.formatMessage({
                                                id: 'sidebar.channel_link.last_message.data_spillage_report',
                                                defaultMessage: 'Flagged message for review',
                                            })}
                                        </span>
                                    ) : isBuzzMessage ? (
                                        <span className='SidebarChannelLinkLabel_last-message-buzz'>{'تنبيه !'}</span>
                                    ) : (
                                        // eslint-disable-next-line react/jsx-max-props-per-line
                                        <PostMarkdown message={this.props.lastPost?.message || ''} post={this.props.lastPost || undefined} channelId={this.props.channel.id} showPostEditedIndicator={false}/>
                                    )}
                                </>
                            )}
                        </div>
                        <span className='SidebarChannelLinkLabel_last-time'>{this.props.lastPost && formatTime(new Date(this.props.lastPost.create_at), this.props.intl)}</span>
                    </div>
                </div>
                {customStatus}
                <Pluggable
                    pluggableName='SidebarChannelLinkLabel'
                    channel={this.props.channel}
                />
                {sharedChannelIcon}
                <ChannelPencilIcon id={channel.id}/>
                {(() => {
                    const hasImportant = this.props.lastPost?.metadata?.priority?.priority === PostPriority.IMPORTANT;
                    return (
                        <ChannelMentionBadge
                            unreadMentions={unreadMsgs || unreadMentions}
                            hasUrgent={hasUrgent}
                            hasImportant={hasImportant}
                        />
                    );
                })()}
                <div
                    className={classNames(
                        'SidebarMenu',
                        'MenuWrapper',
                        {menuOpen: this.state.isMenuOpen},
                        {'MenuWrapper--open': this.state.isMenuOpen},
                    )}
                >
                    <SidebarChannelMenu
                        channel={channel}
                        channelLink={link}
                        isUnread={isUnread}
                        channelLeaveHandler={this.props.channelLeaveHandler}
                        onMenuToggle={this.handleMenuToggle}
                    />
                </div>
            </>
        );

        // NOTE: class added to temporarily support the desktop app's at-mention DOM scraping of the old sidebar
        const className = classNames([
            'SidebarLink',
            {
                menuOpen: this.state.isMenuOpen,
                muted: isMuted,
                'unread-title': this.props.isUnread,
                selected: isChannelSelected,
            },
        ]);
        return (
            <Link
                className={className}
                id={`sidebarItem_${channel.name}`}
                aria-label={this.getAriaLabel()}
                to={link}
                onClick={this.handleChannelClick}
                tabIndex={0}
            >
                {content}
                {channelsTutorialTip}
            </Link>
        );
    }
}

export default injectIntl(SidebarChannelLink);
