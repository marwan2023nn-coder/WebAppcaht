// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState, memo} from 'react';

import type {Channel} from '@workspace/types/channels';
import type {ProductIdentifier} from '@workspace/types/products';
import type {Team} from '@workspace/types/teams';

import ChannelInfoRhs from 'components/channel_info_rhs';
import ChannelMembersRhs from 'components/channel_members_rhs';
import FileUploadOverlay from 'components/file_upload_overlay';
import {DropOverlayIdRHS} from 'components/file_upload_overlay/file_upload_overlay';
import LoadingScreen from 'components/loading_screen';
import PostEditHistory from 'components/post_edit_history';
import ResizableRhs from 'components/resizable_sidebar/resizable_rhs';
import RhsCard from 'components/rhs_card';
import RhsThread from 'components/rhs_thread';
import Search from 'components/search/index';

import RhsPlugin from 'plugins/rhs_plugin';
import a11yController from 'utils/a11y_controller_instance';
import {focusElement, getFirstFocusableChild} from 'utils/a11y_utils';
import Constants from 'utils/constants';
import {cmdOrCtrlPressed, isKeyPressed} from 'utils/keyboard';
import {isMac} from 'utils/user_agent';

import type {RhsState} from 'types/store/rhs';

export type Props = {
    isExpanded: boolean;
    isOpen: boolean;
    channel?: Channel;
    team?: Team;
    teamId: Team['id'];
    productId: ProductIdentifier;
    postRightVisible: boolean;
    postCardVisible: boolean;
    searchVisible: boolean;
    isPinnedPosts: boolean;
    isChannelFiles: boolean;
    isChannelInfo: boolean;
    isChannelMembers: boolean;
    isPluginView: boolean;
    isPostEditHistory: boolean;
    previousRhsState: RhsState;
    rhsChannel?: Channel;
    selectedPostId: string;
    selectedPostCardId: string;
    isSavedPosts?: boolean;
    isRecentMentions?: boolean;
    ariaLabel?: string;
    ariaLabeledby?: string;
    actions: {
        setRhsExpanded: (expanded: boolean) => void;
        showPinnedPosts: (channelId: string) => void;
        openRHSSearch: () => void;
        closeRightHandSide: () => void;
        openAtPrevious: (previous: Partial<Props> | undefined) => void;
        updateSearchTerms: (terms: string) => void;
        showChannelFiles: (channelId: string) => void;
        showChannelInfo: (channelId: string) => void;
    };
}

type State = {
    isOpened: boolean;
}

const SidebarRight = (props: Props) => {
    const sidebarRight = useRef<HTMLDivElement>(null);
    const sidebarRightWidthHolder = useRef<HTMLDivElement>(null);
    const previousRef = useRef<Partial<Props>>();
    const focusSearchBarRef = useRef<() => void>();
    const previousActiveElementRef = useRef<HTMLElement | null>(null);

    const setPrevious = useCallback(() => {
        if (!props.isOpen) {
            return;
        }

        previousRef.current = {
            searchVisible: props.searchVisible,
            isPinnedPosts: props.isPinnedPosts,
            isRecentMentions: props.isRecentMentions,
            isSavedPosts: props.isSavedPosts,
            isChannelFiles: props.isChannelFiles,
            isChannelInfo: props.isChannelInfo,
            isChannelMembers: props.isChannelMembers,
            isPostEditHistory: props.isPostEditHistory,
            selectedPostId: props.selectedPostId,
            selectedPostCardId: props.selectedPostCardId,
            previousRhsState: props.previousRhsState,
            teamId: props.teamId,
            productId: props.productId,
            channel: props.channel,
        };
    }, [props.isOpen, props.searchVisible, props.isPinnedPosts, props.isRecentMentions, props.isSavedPosts, props.isChannelFiles, props.isChannelInfo, props.isChannelMembers, props.isPostEditHistory, props.selectedPostId, props.selectedPostCardId, props.previousRhsState, props.teamId, props.productId, props.channel]);

    const handleShortcut = useCallback((e: KeyboardEvent) => {
        const channelInfoShortcutMac = isMac() && e.shiftKey;
        const channelInfoShortcut = !isMac() && e.altKey;

        if (cmdOrCtrlPressed(e, true)) {
            if (e.shiftKey && isKeyPressed(e, Constants.KeyCodes.PERIOD)) {
                e.preventDefault();
                if (props.isOpen) {
                    props.actions.setRhsExpanded(!props.isExpanded);
                } else {
                    props.actions.openAtPrevious(previousRef.current);
                }
            } else if (isKeyPressed(e, Constants.KeyCodes.PERIOD)) {
                e.preventDefault();
                if (props.isOpen) {
                    props.actions.closeRightHandSide();
                } else {
                    props.actions.openAtPrevious(previousRef.current);
                }
            } else if (isKeyPressed(e, Constants.KeyCodes.I) && (channelInfoShortcutMac || channelInfoShortcut)) {
                e.preventDefault();
                if (props.isOpen && props.isChannelInfo) {
                    props.actions.closeRightHandSide();
                } else if (props.channel) {
                    props.actions.showChannelInfo(props.channel.id);
                }
            }
        }
    }, [props.isOpen, props.isExpanded, props.isChannelInfo, props.channel, props.actions]);

    const handleClickOutside = useCallback((e: MouseEvent) => {
        if (
            (props.isOpen && props.isExpanded) &&
            e.target &&
            document.getElementById('root')?.contains(e.target as Element) &&
            !sidebarRight.current?.contains(e.target as Element) &&
            !document.getElementById('global-header')?.contains(e.target as Element) &&
            !document.querySelector('.app-bar')?.contains(e.target as Element)
        ) {
            props.actions.setRhsExpanded(false);
        }
    }, [props.isOpen, props.isExpanded, props.actions]);

    useEffect(() => {
        document.addEventListener('keydown', handleShortcut);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleShortcut);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleShortcut, handleClickOutside]);

    const handleRHSFocus = useCallback((wasOpen: boolean) => {
        const isOpen = props.isOpen;

        const contentChanged = (
            (props.isPinnedPosts !== previousRef.current?.isPinnedPosts) ||
            (props.isRecentMentions !== previousRef.current?.isRecentMentions) ||
            (props.isSavedPosts !== previousRef.current?.isSavedPosts) ||
            (props.isChannelFiles !== previousRef.current?.isChannelFiles) ||
            (props.isChannelInfo !== previousRef.current?.isChannelInfo) ||
            (props.isChannelMembers !== previousRef.current?.isChannelMembers) ||
            (props.isPostEditHistory !== previousRef.current?.isPostEditHistory) ||
            (props.rhsChannel?.id !== previousRef.current?.rhsChannel?.id) ||
            (props.teamId !== previousRef.current?.teamId)
        );

        if (isOpen && (contentChanged || (!wasOpen && isOpen))) {
            previousActiveElementRef.current = document.activeElement as HTMLElement;

            setTimeout(() => {
                if (sidebarRight.current) {
                    const rhsContainer = sidebarRight.current.querySelector('#rhsContainer') as HTMLElement;
                    const searchContainer = sidebarRight.current.querySelector('#searchContainer') as HTMLElement;
                    if (rhsContainer || searchContainer) {
                        const firstFocusable = getFirstFocusableChild(rhsContainer || searchContainer);
                        focusElement(firstFocusable || rhsContainer, true);
                    } else {
                        const firstFocusable = getFirstFocusableChild(sidebarRight.current);
                        focusElement(firstFocusable || sidebarRight.current, true);
                    }
                }
            }, 0);
        } else if (!isOpen && wasOpen) {
            if (a11yController.originElement) {
                a11yController.restoreOriginFocus();
            } else {
                setTimeout(() => {
                    if (previousActiveElementRef.current) {
                        focusElement(previousActiveElementRef.current, true);
                        previousActiveElementRef.current = null;
                    }
                }, 0);
            }
        }
    }, [props.isOpen, props.isPinnedPosts, props.isRecentMentions, props.isSavedPosts, props.isChannelFiles, props.isChannelInfo, props.isChannelMembers, props.isPostEditHistory, props.rhsChannel?.id, props.teamId]);

    const prevOpen = useRef(props.isOpen);
    useEffect(() => {
        handleRHSFocus(prevOpen.current);
        prevOpen.current = props.isOpen;
    }, [props.isOpen, handleRHSFocus]);

    useEffect(() => {
        if (props.isPinnedPosts && props.rhsChannel && props.rhsChannel.id !== previousRef.current?.rhsChannel?.id) {
            props.actions.showPinnedPosts(props.rhsChannel.id);
        }

        if (props.isChannelFiles && props.rhsChannel && props.rhsChannel.id !== previousRef.current?.rhsChannel?.id) {
            props.actions.showChannelFiles(props.rhsChannel.id);
        }

        if (props.channel && previousRef.current?.channel && props.channel.id !== previousRef.current.channel.id) {
            props.actions.setRhsExpanded(false);
        }

        if ((props.teamId && previousRef.current?.teamId && props.teamId !== previousRef.current.teamId) || (props.productId && previousRef.current?.productId && props.productId !== previousRef.current?.productId)) {
            props.actions.closeRightHandSide();
        }

        setPrevious();
    }, [props.isPinnedPosts, props.rhsChannel, props.isChannelFiles, props.channel, props.teamId, props.productId, props.actions, setPrevious]);

    const handleUpdateSearchTerms = useCallback((term: string) => {
        props.actions.updateSearchTerms(term);
        focusSearchBarRef.current?.();
    }, [props.actions]);

    const getSearchBarFocus = useCallback((focusSearchBar: () => void) => {
        focusSearchBarRef.current = focusSearchBar;
    }, []);

    const {
        team,
        channel,
        rhsChannel,
        postRightVisible,
        postCardVisible,
        previousRhsState,
        isPluginView,
        isOpen,
        isChannelInfo,
        isChannelMembers,
        isExpanded,
        isPostEditHistory,
        searchVisible,
    } = props;

    if (!isOpen) {
        return null;
    }

    let content = null;
    if (postRightVisible) {
        content = (
            <div className='post-right__container'>
                <FileUploadOverlay overlayType='right' id={DropOverlayIdRHS} />
                <RhsThread previousRhsState={previousRhsState}/>
            </div>
        );
    } else if (postCardVisible) {
        content = <RhsCard previousRhsState={previousRhsState}/>;
    } else if (isPluginView) {
        content = <RhsPlugin/>;
    } else if (isChannelInfo) {
        content = <ChannelInfoRhs/>;
    } else if (isChannelMembers) {
        content = <ChannelMembersRhs/>;
    } else if (isPostEditHistory) {
        content = <PostEditHistory/>;
    }

    const isRHSLoading = Boolean((!team) || (postRightVisible && !rhsChannel) || ((isChannelInfo || isChannelMembers) && !channel));
    const channelDisplayName = rhsChannel ? rhsChannel.display_name : '';
    const isSidebarRightExpanded = (postRightVisible || postCardVisible || isPluginView || searchVisible || isPostEditHistory) && isExpanded;
    const containerClassName = classNames('sidebar--right', 'move--left is-open', {
        'sidebar--right--expanded expanded': isSidebarRightExpanded,
    });

    return (
        <>
            <div className={'sidebar--right sidebar--right--width-holder'} ref={sidebarRightWidthHolder} />
            <ResizableRhs
                className={containerClassName}
                id='sidebar-right'
                role='region'
                rightWidthHolderRef={sidebarRightWidthHolder}
                ariaLabel={props.ariaLabel}
                ariaLabeledby={props.ariaLabeledby}
            >
                <div tabIndex={-1} className='sidebar-right-container' ref={sidebarRight} >
                    {isRHSLoading ? (
                        <div className='sidebar-right__body'>
                            <LoadingScreen centered={true}/>
                        </div>
                    ) : (
                        <Search
                            isSideBarRight={true}
                            isSideBarRightOpen={true}
                            getFocus={getSearchBarFocus}
                            channelDisplayName={channelDisplayName}
                        >
                            {content}
                        </Search>
                    )}
                </div>
            </ResizableRhs>
        </>
    );
};

export default memo(SidebarRight);
