// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import debounce from 'lodash/debounce';
import React, {lazy, useCallback, useEffect, useMemo, useRef, useState, memo} from 'react';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';
import type {DropResult, DragStart, BeforeCapture} from 'react-beautiful-dnd';
import {FormattedMessage, useIntl} from 'react-intl';
import {matchPath} from 'react-router-dom';

import type {ChannelCategory} from '@workspace/types/channel_categories';
import type {Channel} from '@workspace/types/channels';
import type {Team} from '@workspace/types/teams';

import {General} from 'workspace-redux/constants';

import {makeAsyncComponent} from 'components/async_load';
import Scrollbars from 'components/common/scrollbars';
import SearchBar from 'components/search_bar/search_bar';
import SidebarCategory from 'components/sidebar/sidebar_category';

import {findNextUnreadChannelId} from 'utils/channel_utils';
import {Constants, DraggingStates, DraggingStateTypes} from 'utils/constants';
import {isKeyPressed, cmdOrCtrlPressed} from 'utils/keyboard';
import {mod} from 'utils/utils';

import type {DraggingState} from 'types/store';
import type {StaticPage} from 'types/store/lhs';
import type {WrappedComponentProps} from 'react-intl';

const DraftsLink = makeAsyncComponent('DraftsLink', lazy(() => import('components/drafts/drafts_link/drafts_link')));
const GlobalThreadsLink = makeAsyncComponent('GlobalThreadsLink', lazy(() => import('components/threading/global_threads_link')));
const UnreadChannelIndicator = makeAsyncComponent('UnreadChannelIndicator', lazy(() => import('../unread_channel_indicator')));
const UnreadChannels = makeAsyncComponent('UnreadChannels', lazy(() => import('../unread_channels')));

type Props = WrappedComponentProps & {
    currentTeam?: Team;
    currentChannelId: string;
    categories?: ChannelCategory[];
    isDirectMessageList?: boolean;
    channelSearchTerm?: string;
    onClearChannelSearchTerm?: () => void;
    unreadChannelIds: string[];
    isUnreadFilterEnabled: boolean;
    isMobileView: boolean;
    displayedChannels: Channel[];
    newCategoryIds: string[];
    draggingState: DraggingState;
    multiSelectedChannelIds: string[];
    showUnreadsCategory: boolean;
    collapsedThreads: boolean;
    hasUnreadThreads: boolean;
    currentStaticPageId: string;
    staticPages: StaticPage[];

    handleOpenMoreDirectChannelsModal: (e: Event) => void;
    onDragStart: (initial: DragStart) => void;
    onDragEnd: (result: DropResult) => void;
    toggleDirectMessagesSidebar?: () => void;
    showDirectMessages?: boolean;

    actions: {
        moveChannelsInSidebar: (categoryId: string, targetIndex: number, draggableChannelId: string) => void;
        moveCategory: (teamId: string, categoryId: string, newIndex: number) => void;
        switchToChannelById: (channelId: string) => void;
        switchToLhsStaticPage: (pageId: string) => void;
        close: () => void;
        setDraggingState: (data: DraggingState) => void;
        stopDragging: () => void;
        clearChannelSelection: () => void;
    };
};

type State = {
    showTopUnread: boolean;
    showBottomUnread: boolean;
    searchTerm: string;
};

// scrollMargin is the margin at the edge of the channel list that we leave when scrolling to a channel.
const scrollMargin = 10;

// categoryHeaderHeight is the height of the category header
const categoryHeaderHeight = 32;

// scrollMarginWithUnread is the margin that we leave at the edge of the channel list when scrolling to a channel so
// that the channel is not under the unread indicator.
const scrollMarginWithUnread = 55;

export const SidebarList = (props: Props) => {
    const channelRefs = useRef<Map<string, HTMLLIElement>>(new Map());
    const scrollbar = useRef<HTMLElement>(null);

    const [showTopUnread, setShowTopUnread] = useState(false);
    const [showBottomUnread, setShowBottomUnread] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const intl = useIntl();

    const getDisplayedChannelIds = useCallback(() => {
        return props.displayedChannels.map((channel) => channel.id);
    }, [props.displayedChannels]);

    const getDisplayedStaticPageIds = useCallback(() => {
        return props.staticPages.map((item) => item.id);
    }, [props.staticPages]);

    const setChannelRef = useCallback((channelId: string, ref: HTMLLIElement) => {
        if (ref) {
            channelRefs.current.set(channelId, ref);
        } else {
            channelRefs.current.delete(channelId);
        }
    }, []);

    const getFirstUnreadChannelFromChannelIdArray = useCallback((channelIds: string[]) => {
        return channelIds.find((channelId) => {
            return channelId !== props.currentChannelId && props.unreadChannelIds.includes(channelId);
        });
    }, [props.currentChannelId, props.unreadChannelIds]);

    const getFirstUnreadChannel = useCallback(() => {
        return getFirstUnreadChannelFromChannelIdArray(getDisplayedChannelIds());
    }, [getDisplayedChannelIds, getFirstUnreadChannelFromChannelIdArray]);

    const getLastUnreadChannel = useCallback(() => {
        return getFirstUnreadChannelFromChannelIdArray([...getDisplayedChannelIds()].reverse());
    }, [getDisplayedChannelIds, getFirstUnreadChannelFromChannelIdArray]);

    const updateUnreadIndicators = useCallback(() => {
        if (props.draggingState.state) {
            setShowTopUnread(false);
            setShowBottomUnread(false);
            return;
        }

        let nextShowTopUnread = false;
        let nextShowBottomUnread = false;

        const firstUnreadChannel = getFirstUnreadChannel();
        const lastUnreadChannel = getLastUnreadChannel();

        if (firstUnreadChannel) {
            const firstUnreadElement = channelRefs.current.get(firstUnreadChannel);
            if (firstUnreadElement && ((firstUnreadElement.offsetTop + firstUnreadElement.offsetHeight) - scrollMargin - categoryHeaderHeight) < (scrollbar.current?.scrollTop || 0)) {
                nextShowTopUnread = true;
            }
        }

        if (lastUnreadChannel) {
            const lastUnreadElement = channelRefs.current.get(lastUnreadChannel);
            if (lastUnreadElement && (lastUnreadElement.offsetTop + scrollMargin) > ((scrollbar.current?.scrollTop || 0) + (scrollbar.current?.clientHeight || 0))) {
                nextShowBottomUnread = true;
            }
        }

        setShowTopUnread(nextShowTopUnread);
        setShowBottomUnread(nextShowBottomUnread);
    }, [props.draggingState.state, getFirstUnreadChannel, getLastUnreadChannel]);

    const scrollToChannel = useCallback((channelId: string | null | undefined, scrollingToUnread = false) => {
        if (!channelId || !scrollbar.current) {
            return;
        }

        const element = channelRefs.current.get(channelId);
        if (!element) {
            return;
        }

        const top = element.offsetTop;
        const bottom = top + element.offsetHeight;
        const scrollTop = scrollbar.current.scrollTop;
        const clientHeight = scrollbar.current.clientHeight;

        if (top < (scrollTop + categoryHeaderHeight)) {
            const margin = (scrollingToUnread || !showTopUnread) ? scrollMargin : scrollMarginWithUnread;
            const scrollEnd = (getDisplayedChannelIds()[0] === channelId) ? 0 : top - margin - categoryHeaderHeight;
            scrollbar.current.scrollTo({top: scrollEnd, behavior: 'smooth'});
        } else if (bottom > scrollTop + clientHeight) {
            const margin = (scrollingToUnread || !showBottomUnread) ? scrollMargin : scrollMarginWithUnread;
            const scrollEnd = (bottom - clientHeight) + margin;
            scrollbar.current.scrollTo({top: scrollEnd, behavior: 'smooth'});
        }
    }, [showTopUnread, showBottomUnread, getDisplayedChannelIds]);

    const navigateById = useCallback((id: string) => {
        if (props.staticPages.findIndex((i) => i.id === id) === -1) {
            props.actions.switchToChannelById(id);
        } else {
            props.actions.switchToLhsStaticPage(id);
        }
    }, [props.staticPages, props.actions]);

    const handleDirectMessagesToggleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const pathname = window.location?.pathname || '';
        const inGlobalThreads = matchPath(pathname, {path: '/:team/threads/:threadIdentifier?'}) != null;
        const inDrafts = matchPath(pathname, {path: '/:team/drafts'}) != null;
        const inScheduledPosts = matchPath(pathname, {path: '/:team/scheduled_posts'}) != null;

        const fallbackChannelId = props.displayedChannels?.[0]?.id;
        const channelIdToSwitch = props.currentChannelId || fallbackChannelId;

        if ((inGlobalThreads || inDrafts || inScheduledPosts) && channelIdToSwitch) {
            props.actions.switchToChannelById(channelIdToSwitch);
        }

        props.toggleDirectMessagesSidebar?.();
    }, [props.displayedChannels, props.currentChannelId, props.actions, props.toggleDirectMessagesSidebar]);

    const navigateChannelShortcut = useCallback((e: KeyboardEvent) => {
        if (e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && (isKeyPressed(e, Constants.KeyCodes.UP) || isKeyPressed(e, Constants.KeyCodes.DOWN))) {
            e.preventDefault();

            const staticPageIds = getDisplayedStaticPageIds();
            const allIds = [...staticPageIds, ...getDisplayedChannelIds()];

            const curSelectedId = props.currentChannelId || props.currentStaticPageId;
            const curIndex = allIds.indexOf(curSelectedId);

            let nextIndex = isKeyPressed(e, Constants.KeyCodes.DOWN) ? curIndex + 1 : curIndex - 1;
            const nextId = allIds[mod(nextIndex, allIds.length)];

            navigateById(nextId);
            if (nextIndex >= staticPageIds.length) {
                scrollToChannel(nextId);
            }
        } else if (cmdOrCtrlPressed(e) && e.shiftKey && isKeyPressed(e, Constants.KeyCodes.K)) {
            props.handleOpenMoreDirectChannelsModal(e as any);
        }
    }, [getDisplayedStaticPageIds, getDisplayedChannelIds, props.currentChannelId, props.currentStaticPageId, navigateById, scrollToChannel, props.handleOpenMoreDirectChannelsModal]);

    const navigateUnreadChannelShortcut = useCallback((e: KeyboardEvent) => {
        if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && (isKeyPressed(e, Constants.KeyCodes.UP) || isKeyPressed(e, Constants.KeyCodes.DOWN))) {
            e.preventDefault();

            const allChannelIds = getDisplayedChannelIds();
            const unreadChannelIds = [...props.unreadChannelIds];

            if (props.collapsedThreads) {
                allChannelIds.unshift('');
                if (props.hasUnreadThreads) {
                    unreadChannelIds.unshift('');
                }
            }

            const direction = isKeyPressed(e, Constants.KeyCodes.UP) ? -1 : 1;
            const nextIndex = findNextUnreadChannelId(props.currentChannelId, allChannelIds, unreadChannelIds, direction);

            if (nextIndex !== -1) {
                const nextChannelId = allChannelIds[nextIndex];
                navigateById(nextChannelId);
                scrollToChannel(nextChannelId);
            }
        }
    }, [getDisplayedChannelIds, props.unreadChannelIds, props.collapsedThreads, props.hasUnreadThreads, props.currentChannelId, navigateById, scrollToChannel]);

    useEffect(() => {
        document.addEventListener('keydown', navigateChannelShortcut);
        document.addEventListener('keydown', navigateUnreadChannelShortcut);
        return () => {
            document.removeEventListener('keydown', navigateChannelShortcut);
            document.removeEventListener('keydown', navigateUnreadChannelShortcut);
        };
    }, [navigateChannelShortcut, navigateUnreadChannelShortcut]);

    useEffect(() => {
        if (props.currentTeam && props.currentChannelId) {
            updateUnreadIndicators();
        }
    }, [props.currentChannelId, props.currentTeam, updateUnreadIndicators]);

    useEffect(() => {
        if (props.currentChannelId) {
            props.actions.close();
        }
    }, [props.currentChannelId, props.actions]);

    const onScroll = useMemo(() => debounce(() => {
        updateUnreadIndicators();
    }, 100), [updateUnreadIndicators]);

    const onTransitionEnd = useMemo(() => debounce(() => {
        updateUnreadIndicators();
    }, 100), [updateUnreadIndicators]);

    useEffect(() => {
        return () => {
            onScroll.cancel();
            onTransitionEnd.cancel();
        };
    }, [onScroll, onTransitionEnd]);

    const handleClear = useCallback(() => setSearchTerm(''), []);
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value), []);

    const onBeforeCapture = useCallback((before: BeforeCapture) => {
        channelRefs.current.forEach((ref) => ref.classList.remove('animating'));

        if (!props.multiSelectedChannelIds.find((id) => before.draggableId === id)) {
            props.actions.clearChannelSelection();
        }

        const draggingState: DraggingState = {
            state: DraggingStates.CAPTURE,
            id: before.draggableId,
        };

        if (props.categories && props.categories.some((category) => category.id === before.draggableId)) {
            draggingState.type = DraggingStateTypes.CATEGORY;
        } else {
            const draggingChannels = props.displayedChannels.filter((channel) => props.multiSelectedChannelIds.indexOf(channel.id) !== -1 || channel.id === before.draggableId);
            if (draggingChannels.every((channel) => channel.type === General.DM_CHANNEL || channel.type === General.GM_CHANNEL)) {
                draggingState.type = DraggingStateTypes.DM;
            } else if (draggingChannels.every((channel) => channel.type !== General.DM_CHANNEL && channel.type !== General.GM_CHANNEL)) {
                draggingState.type = DraggingStateTypes.CHANNEL;
            } else {
                draggingState.type = DraggingStateTypes.MIXED_CHANNELS;
            }
        }

        props.actions.setDraggingState(draggingState);
    }, [props.multiSelectedChannelIds, props.actions, props.categories, props.displayedChannels]);

    const onBeforeDragStart = useCallback(() => {
        props.actions.setDraggingState({state: DraggingStates.BEFORE});
    }, [props.actions]);

    const onDragStart = useCallback((initial: DragStart) => {
        props.onDragStart(initial);
        props.actions.setDraggingState({state: DraggingStates.DURING});
    }, [props.onDragStart, props.actions]);

    const onDragEnd = useCallback((result: DropResult) => {
        props.onDragEnd(result);
        if (result.reason === 'DROP' && result.destination) {
            if (result.type === 'SIDEBAR_CHANNEL') {
                props.actions.moveChannelsInSidebar(result.destination.droppableId, result.destination.index, result.draggableId);
            } else if (result.type === 'SIDEBAR_CATEGORY') {
                props.actions.moveCategory(props.currentTeam!.id, result.draggableId, result.destination.index);
            }
        }
        props.actions.stopDragging();
    }, [props.onDragEnd, props.actions, props.currentTeam]);

    const renderCategory = (category: ChannelCategory, index: number) => {
        let searchBar: React.ReactNode;
        if (category.type === 'direct_messages') {
            searchBar = (
                <div className='SidebarChannelNavigator'>
                    <SearchBar
                        searchTerms={searchTerm}
                        isSearchingTerm={false}
                        suggestionProviders={[]}
                        updateHighlightedSearchHint={() => {}}
                        handleChange={handleChange}
                        handleSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
                        handleEnterKey={() => {}}
                        handleClear={handleClear}
                        handleFocus={() => {}}
                        handleBlur={() => {}}
                        keepFocused={false}
                        setKeepFocused={() => {}}
                        isFocused={false}
                        searchType={''}
                    />
                </div>
            );
        }

        const categorySearchTerm = category.type === 'direct_messages' ? searchTerm : (category.type === 'channels' ? (props.channelSearchTerm || '') : '');
        const onClearSearch = category.type === 'direct_messages' ? handleClear : (category.type === 'channels' ? props.onClearChannelSearchTerm : undefined);

        return (
            <SidebarCategory
                key={category.id}
                category={category}
                categoryIndex={index}
                setChannelRef={setChannelRef}
                handleOpenMoreDirectChannelsModal={props.handleOpenMoreDirectChannelsModal}
                isNewCategory={props.newCategoryIds.includes(category.id)}
                isDirectMessageList={props.isDirectMessageList}
                searchBar={searchBar}
                searchTerm={categorySearchTerm}
                scrollbarRef={scrollbar}
                onScroll={onScroll}
                onClearSearch={onClearSearch}
            />
        );
    };

    const {categories} = props;

    let channelList: React.ReactNode;
    if (props.isUnreadFilterEnabled && !props.isDirectMessageList) {
        channelList = <UnreadChannels setChannelRef={setChannelRef} />;
    } else {
        let unreadsCategory;
        if (props.showUnreadsCategory && !props.isDirectMessageList) {
            unreadsCategory = <UnreadChannels setChannelRef={setChannelRef} />;
        }

        const filteredCategories = categories?.filter((category) => {
            if (props.isMobileView) {
                return true;
            }
            const isDM = category.type === 'direct_messages';
            return props.isDirectMessageList ? isDM : !isDM;
        });

        const renderedCategories = filteredCategories?.map(renderCategory);

        channelList = (
            <>
                {unreadsCategory}
                <DragDropContext
                    onDragEnd={onDragEnd}
                    onBeforeDragStart={onBeforeDragStart}
                    onBeforeCapture={onBeforeCapture}
                    onDragStart={onDragStart}
                >
                    <Droppable
                        droppableId='droppable-categories'
                        type='SIDEBAR_CATEGORY'
                    >
                        {(provided) => (
                            <div
                                id={'sidebar-droppable-categories'}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {renderedCategories}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </>
        );
    }

    const ariaLabel = intl.formatMessage({id: 'accessibility.sections.lhsList', defaultMessage: 'channel sidebar region'});

    return (
        <>
            {!props.isDirectMessageList && (
                <>
                    {!props.isMobileView && (
                        <ul className='SidebarDirectMessagesToggle NavGroupContent nav nav-pills__container'>
                            <li
                                className={classNames('SidebarChannel', {active: props.showDirectMessages})}
                                tabIndex={-1}
                                id='sidebar-direct-messages-toggle'
                            >
                                <a
                                    onClick={handleDirectMessagesToggleClick}
                                    href={window.location?.pathname || '/'}
                                    id='sidebarItem_direct_messages'
                                    draggable='false'
                                    className={classNames('SidebarLink sidebar-item')}
                                    tabIndex={0}
                                >
                                    <span className='icon'>
                                        <i className='icon icon-account-multiple-outline'/>
                                    </span>
                                    <div className='SidebarChannelLinkLabel_wrapper'>
                                        <span className='SidebarChannelLinkLabel sidebar-item__name'>
                                            {intl.formatMessage({id: 'sidebar.types.direct_messages', defaultMessage: 'DIRECT MESSAGES'})}
                                        </span>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    )}
                    <div
                        onClickCapture={() => {
                            if (props.showDirectMessages) {
                                props.toggleDirectMessagesSidebar?.();
                            }
                        }}
                    >
                        <GlobalThreadsLink/>
                    </div>
                    <div
                        onClickCapture={() => {
                            if (props.showDirectMessages) {
                                props.toggleDirectMessagesSidebar?.();
                            }
                        }}
                    >
                        <DraftsLink/>
                    </div>
                </>
            )}
            <div
                id='sidebar-left'
                role='application'
                aria-label={ariaLabel}
                className={classNames('SidebarNavContainer a11y__region', {
                    disabled: props.isUnreadFilterEnabled,
                })}
                data-a11y-disable-nav={Boolean(props.draggingState.type)}
                data-a11y-sort-order='7'
                onTransitionEnd={onTransitionEnd}
            >
                {!props.isDirectMessageList && (
                    <>
                        <UnreadChannelIndicator
                            name='Top'
                            show={showTopUnread}
                            onClick={() => scrollToChannel(getFirstUnreadChannel(), true)}
                            extraClass='nav-pills__unread-indicator-top'
                            content={<FormattedMessage id='sidebar.unreads' defaultMessage='More unreads' />}
                        />
                        <UnreadChannelIndicator
                            name='Bottom'
                            show={showBottomUnread}
                            onClick={() => scrollToChannel(getLastUnreadChannel(), true)}
                            extraClass='nav-pills__unread-indicator-bottom'
                            content={<FormattedMessage id='sidebar.unreads' defaultMessage='More unreads' />}
                        />
                    </>
                )}
                {props.isDirectMessageList ? channelList : (
                    <Scrollbars
                        ref={scrollbar as any}
                        onScroll={onScroll}
                    >
                        {channelList}
                    </Scrollbars>
                )}
            </div>
        </>
    );
};

export default memo(SidebarList);
