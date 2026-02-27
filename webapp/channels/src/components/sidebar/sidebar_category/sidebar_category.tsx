// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import debounce from 'lodash/debounce';
import React, {useCallback, useEffect, useMemo, useRef, useState, memo} from 'react';
import type {MouseEvent, KeyboardEvent} from 'react';
import {Draggable, Droppable} from 'react-beautiful-dnd';
import {FormattedMessage, defineMessages, useIntl} from 'react-intl';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import glyphMap, {PlusIcon, ProductChannelsIcon} from '@workspace/compass-icons/components';
import type {ChannelCategory} from '@workspace/types/channel_categories';
import {CategorySorting} from '@workspace/types/channel_categories';
import type {Channel, ChannelMembership} from '@workspace/types/channels';
import type {PreferenceType} from '@workspace/types/preferences';
import type {UserProfile} from '@workspace/types/users';

import {CategoryTypes} from 'workspace-redux/constants/channel_categories';
import type {ActionResult} from 'workspace-redux/types/actions';
import {localizeMessage} from 'workspace-redux/utils/i18n_utils';

import Scrollbars from 'components/common/scrollbars';
import MessageMultipleUsersDmModal from 'components/message_multiple_users_dm_modal/message_multiple_users_dm_modal';
import UserDetails from 'components/more_direct_channels/list_item/user_details';
import WithTooltip from 'components/with_tooltip';

import {getHistory} from 'utils/browser_history';
import Constants, {A11yCustomEventTypes, DraggingStateTypes, DraggingStates, ModalIdentifiers} from 'utils/constants';
import {isKeyPressed} from 'utils/keyboard';

import type {DraggingState} from 'types/store';

import SidebarCategoryMenu from './sidebar_category_menu';
import SidebarCategorySortingMenu from './sidebar_category_sorting_menu';

// eslint-disable-next-line import/order
import AddChannelsCtaButton from '../add_channels_cta_button';

// import InviteMembersButton from '../invite_members_button';
import {SidebarCategoryHeader} from '../sidebar_category_header';
import SidebarChannel from '../sidebar_channel';
import SidebarBaseChannelIcon from '../sidebar_channel/sidebar_base_channel/sidebar_base_channel_icon';

type Props = {
    category: ChannelCategory;
    categoryIndex: number;
    channelIds: string[];
    setChannelRef: (channelId: string, ref: HTMLLIElement) => void;
    handleOpenMoreDirectChannelsModal: (e: Event) => void;
    isNewCategory: boolean;
    draggingState: DraggingState;
    isDirectMessageList?: boolean;
    currentUserId: string;
    isAdmin: boolean;
    searchBar?: React.ReactNode;
    searchTerm?: string;
    selectedStatusFilter?: string;
    scrollbarRef?: React.RefObject<HTMLElement>;
    onScroll?: (e: Event) => void;
    onClearSearch?: () => void;
    currentTeamId?: string;
    currentTeamName?: string;
    restrictDirectMessage?: string;
    enableSharedChannelsDMs?: boolean;
    existingDirectMessageUserIds?: string[];
    myChannelMemberships: Record<string, ChannelMembership | undefined>;
    actions: {
        setCategoryCollapsed: (categoryId: string, collapsed: boolean) => void;
        setCategorySorting: (categoryId: string, sorting: CategorySorting) => void;
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        openModal: <P>(modalData: import('types/actions').ModalData<P>) => void;
        closeModal: (modalId: string) => void;
        searchProfiles: (term: string, options: any) => Promise<ActionResult<UserProfile[]>>;
        openDirectChannelToUserId: (userId: string) => Promise<ActionResult<Channel>>;
        searchAllChannels: (term: string, options: any) => Promise<ActionResult<any>>;
        joinChannelById: (channelId: string) => Promise<ActionResult>;
        switchToChannel: (channel: Channel) => Promise<ActionResult>;
    };
};

type State = {
    isMenuOpen: boolean;
    newMembersLoading: boolean;
    newMembers: UserProfile[];
    newMembersForTerm: string;

    suggestedChannelsLoading: boolean;
    suggestedChannels: Channel[];
    suggestedChannelsForTerm: string;
}

const SidebarCategory = (props: Props) => {
    const categoryTitleRef = useRef<HTMLButtonElement>(null);
    const newDropBoxRef = useRef<HTMLDivElement>(null);

    const [isMenuOpen] = useState(false);
    const [newMembersLoading, setNewMembersLoading] = useState(false);
    const [newMembers, setNewMembers] = useState<UserProfile[]>([]);
    const [suggestedChannelsLoading, setSuggestedChannelsLoading] = useState(false);
    const [suggestedChannels, setSuggestedChannels] = useState<Channel[]>([]);

    const intl = useIntl();

    const searchNewMembers = useCallback(async (term: string) => {
        const currentTerm = props.searchTerm?.trim() || '';
        if (!term || term !== currentTerm) {
            return;
        }

        try {
            const teamId = props.restrictDirectMessage === 'any' ? '' : props.currentTeamId;
            const options: Record<string, any> = {team_id: teamId};
            if (props.enableSharedChannelsDMs === false) {
                options.exclude_remote = true;
            }

            const {data} = await props.actions.searchProfiles(term, options);
            const existing = new Set(props.existingDirectMessageUserIds || []);
            const filtered = (data || []).filter((u) => u && !existing.has(u.id));

            if ((props.searchTerm?.trim() || '') === term) {
                setNewMembers(filtered.slice(0, 10));
                setNewMembersLoading(false);
            }
        } catch {
            if ((props.searchTerm?.trim() || '') === term) {
                setNewMembers([]);
                setNewMembersLoading(false);
            }
        }
    }, [props.searchTerm, props.restrictDirectMessage, props.currentTeamId, props.enableSharedChannelsDMs, props.existingDirectMessageUserIds, props.actions]);

    const searchNewMembersDebounced = useMemo(() => debounce(searchNewMembers, 250), [searchNewMembers]);

    const searchSuggestedChannels = useCallback(async (term: string) => {
        const currentTerm = props.searchTerm?.trim() || '';
        if (!term || term.length < 2 || term !== currentTerm) {
            return;
        }

        try {
            const teamId = props.currentTeamId;
            if (!teamId) {
                setSuggestedChannels([]);
                setSuggestedChannelsLoading(false);
                return;
            }

            const {data} = await props.actions.searchAllChannels(term, {team_ids: [teamId], nonAdminSearch: true, include_deleted: true}) as ActionResult<Channel[]>;
            const channels = (data || []).filter((c) => c && c.team_id === teamId);
            const memberships = props.myChannelMemberships || {};
            const filtered = channels.filter((c) => c.delete_at === 0 && c.type === Constants.OPEN_CHANNEL && !memberships[c.id]);

            if ((props.searchTerm?.trim() || '') === term) {
                setSuggestedChannels(filtered.slice(0, 10));
                setSuggestedChannelsLoading(false);
            }
        } catch {
            if ((props.searchTerm?.trim() || '') === term) {
                setSuggestedChannels([]);
                setSuggestedChannelsLoading(false);
            }
        }
    }, [props.searchTerm, props.currentTeamId, props.actions, props.myChannelMemberships]);

    const searchSuggestedChannelsDebounced = useMemo(() => debounce(searchSuggestedChannels, 400), [searchSuggestedChannels]);

    useEffect(() => {
        const term = props.searchTerm?.trim() || '';
        if (props.category.type === CategoryTypes.DIRECT_MESSAGES) {
            if (!term) {
                setNewMembers([]);
                setNewMembersLoading(false);
            } else {
                setNewMembersLoading(true);
                searchNewMembersDebounced(term);
            }
        } else if (props.category.type === CategoryTypes.CHANNELS) {
            if (!term || term.length < 2) {
                setSuggestedChannels([]);
                setSuggestedChannelsLoading(false);
            } else {
                setSuggestedChannelsLoading(true);
                searchSuggestedChannelsDebounced(term);
            }
        }
    }, [props.searchTerm, props.category.type, searchNewMembersDebounced, searchSuggestedChannelsDebounced]);

    useEffect(() => {
        return () => {
            searchNewMembersDebounced.cancel();
            searchSuggestedChannelsDebounced.cancel();
        };
    }, [searchNewMembersDebounced, searchSuggestedChannelsDebounced]);

    const handleNewMemberClick = useCallback(async (userId: string) => {
        const result = await props.actions.openDirectChannelToUserId(userId);
        const channel = result?.data;
        if (channel?.name && props.currentTeamName) {
            getHistory().push('/' + props.currentTeamName + '/channels/' + channel.name);
            props.onClearSearch?.();
        }
    }, [props.actions, props.currentTeamName, props.onClearSearch]);

    const handleSuggestedChannelClick = useCallback(async (channel: Channel) => {
        const joinResult = await props.actions.joinChannelById(channel.id);
        if (!joinResult?.error) {
            const switchResult = await props.actions.switchToChannel(channel);
            if (!switchResult?.error) {
                props.onClearSearch?.();
            }
        }
    }, [props.actions, props.onClearSearch]);

    const handleCollapse = useCallback(() => {
        if (!props.isDirectMessageList) {
            props.actions.setCategoryCollapsed(props.category.id, !props.category.collapsed);
        }
    }, [props.isDirectMessageList, props.category.id, props.category.collapsed, props.actions]);

    const handleA11yKeyDown = useCallback((e: KeyboardEvent) => {
        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            e.preventDefault();
            handleCollapse();
        }
    }, [handleCollapse]);

    useEffect(() => {
        const el = categoryTitleRef.current;
        const handleActivate = () => el?.addEventListener('keydown', handleA11yKeyDown as any);
        const handleDeactivate = () => el?.removeEventListener('keydown', handleA11yKeyDown as any);

        el?.addEventListener(A11yCustomEventTypes.ACTIVATE, handleActivate);
        el?.addEventListener(A11yCustomEventTypes.DEACTIVATE, handleDeactivate);

        return () => {
            el?.removeEventListener(A11yCustomEventTypes.ACTIVATE, handleActivate);
            el?.removeEventListener(A11yCustomEventTypes.DEACTIVATE, handleDeactivate);
            el?.removeEventListener('keydown', handleA11yKeyDown as any);
        };
    }, [handleA11yKeyDown]);

    useEffect(() => {
        if (newDropBoxRef.current) {
            newDropBoxRef.current.classList.add('animating');
        }
    }, [props.category.collapsed]);

    const removeAnimation = useCallback(() => {
        newDropBoxRef.current?.classList.remove('animating');
    }, []);

    const handleOpenDirectMessagesModal = useCallback((event: MouseEvent<HTMLLIElement | HTMLButtonElement> | KeyboardEvent<HTMLLIElement | HTMLButtonElement>) => {
        event.preventDefault();
        props.handleOpenMoreDirectChannelsModal(event.nativeEvent);
    }, [props.handleOpenMoreDirectChannelsModal]);

    const openMessageMultipleUsersDmModal = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        props.actions.openModal({
            modalId: ModalIdentifiers.MESSAGE_MULTIPLE_USERS_DM,
            dialogType: MessageMultipleUsersDmModal,
            dialogProps: {
                onExited: () => props.actions.closeModal(ModalIdentifiers.MESSAGE_MULTIPLE_USERS_DM),
            },
        });
    }, [props.actions]);

    const clearStatusFilter = useCallback(() => {
        props.actions.savePreferences(props.currentUserId, [{
            user_id: props.currentUserId,
            category: Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
            name: 'dm_gm_status_filter',
            value: 'all',
        }]);
    }, [props.currentUserId, props.actions]);

    const isDropDisabled = useCallback(() => {
        if (props.category.type === CategoryTypes.DIRECT_MESSAGES) {
            return props.draggingState.type === DraggingStateTypes.CHANNEL;
        } else if (props.category.type === CategoryTypes.CHANNELS) {
            return props.draggingState.type === DraggingStateTypes.DM;
        }
        return false;
    }, [props.category.type, props.draggingState.type]);

    const showPlaceholder = useCallback(() => {
        if (props.category.sorting === CategorySorting.Alphabetical || props.category.sorting === CategorySorting.Recency || props.isNewCategory) {
            return Boolean(props.channelIds.find((id) => id === props.draggingState.id));
        }
        return true;
    }, [props.category.sorting, props.isNewCategory, props.channelIds, props.draggingState.id]);

    const renderChannel = (channelId: string, index: number) => (
        <SidebarChannel
            key={channelId}
            channelIndex={index}
            channelId={channelId}
            isDraggable={true}
            setChannelRef={props.setChannelRef}
            isCategoryCollapsed={props.category.collapsed}
            isCategoryDragged={props.draggingState.type === DraggingStateTypes.CATEGORY && props.draggingState.id === props.category.id}
            isAutoSortedCategory={props.category.sorting === CategorySorting.Alphabetical || props.category.sorting === CategorySorting.Recency}
        />
    );
    const {category, categoryIndex, channelIds, isNewCategory} = props;

    if (!category || (category.type === CategoryTypes.FAVORITES && !channelIds?.length)) {
        return null;
    }

    const renderedChannels = channelIds.map(renderChannel);
    const searchTermTrimmed = props.searchTerm?.trim();
    const shouldShowNewMembers = category.type === CategoryTypes.DIRECT_MESSAGES && Boolean(searchTermTrimmed);
    const showNewMembersHeader = shouldShowNewMembers && (newMembers.length > 0 || newMembersLoading);
    const shouldShowSuggestedChannels = category.type === CategoryTypes.CHANNELS && Boolean(searchTermTrimmed);
    const showSuggestedChannelsHeader = shouldShowSuggestedChannels && (suggestedChannels.length > 0 || suggestedChannelsLoading);

    let noResults = null;
    if (props.searchTerm && renderedChannels.length === 0 && newMembers.length === 0 && suggestedChannels.length === 0 && !newMembersLoading && !suggestedChannelsLoading) {
        noResults = (
            <li className='SidebarChannel'>
                <p className='w-full text-center'>
                    <FormattedMessage id='sidebar.no.results' defaultMessage='No results found' />
                </p>
            </li>
        );
    }

    let categoryMenu: JSX.Element;
    let newLabel: JSX.Element | null = null;
    let isCollapsible = !props.isDirectMessageList;

    if (isNewCategory) {
        newLabel = (
            <div className='SidebarCategory_newLabel'>
                <FormattedMessage id='sidebar_left.sidebar_category.newLabel' defaultMessage='new' />
            </div>
        );
        categoryMenu = <SidebarCategoryMenu category={category}/>;
    } else if (category.type === CategoryTypes.DIRECT_MESSAGES) {
        const messageMultipleHelpLabel = localizeMessage({id: 'sidebar.dm_menu.message_multiple', defaultMessage: 'Message multiple people'});
        categoryMenu = (
            <div className='SidebarChannelGroupHeader_actions'>
                <WithTooltip title={messageMultipleHelpLabel}>
                    <button
                        id='messageMultipleUsersDmButton'
                        className='SidebarChannelGroupHeader_addButton'
                        onClick={openMessageMultipleUsersDmModal}
                        aria-label={messageMultipleHelpLabel}
                    >
                        <ProductChannelsIcon size={'1.8rem'}/>
                    </button>
                </WithTooltip>
                <SidebarCategorySortingMenu
                    category={category}
                    handleOpenDirectMessagesModal={handleOpenMoreDirectChannelsModal}
                />
            </div>
        );
        if (props.isDirectMessageList || !channelIds || !channelIds.length) {
            isCollapsible = false;
        }
    } else {
        categoryMenu = <SidebarCategoryMenu category={category}/>;
    }

    let displayName = category.display_name;
    if (category.type !== CategoryTypes.CUSTOM) {
        const message = categoryNames[category.type as keyof typeof categoryNames];
        displayName = localizeMessage({id: message.id, defaultMessage: message.defaultMessage});
    }

    const addChannelsCtaButton = (category.type === CategoryTypes.CHANNELS && !category.collapsed) ? <AddChannelsCtaButton iconOnly={true}/> : null;

    return (
        <Draggable draggableId={category.id} index={categoryIndex} disableInteractiveElementBlocking={true}>
            {(provided, snapshot) => (
                <div
                    className={classNames('SidebarChannelGroup a11y__section', {
                        'direct-messages': category.type === CategoryTypes.DIRECT_MESSAGES,
                        dropDisabled: isDropDisabled(),
                        menuIsOpen: isMenuOpen,
                        capture: props.draggingState.state === DraggingStates.CAPTURE,
                        isCollapsed: category.collapsed,
                    })}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                >
                    <Droppable droppableId={category.id} type='SIDEBAR_CHANNEL' isDropDisabled={isDropDisabled()}>
                        {(droppableProvided, droppableSnapshot) => (
                            <div
                                {...droppableProvided.droppableProps}
                                ref={droppableProvided.innerRef}
                                className={classNames({draggingOver: droppableSnapshot.isDraggingOver})}
                            >
                                <SidebarCategoryHeader
                                    ref={categoryTitleRef}
                                    displayName={displayName}
                                    dragHandleProps={provided.dragHandleProps}
                                    isCollapsed={category.collapsed}
                                    isCollapsible={isCollapsible}
                                    isDragging={snapshot.isDragging}
                                    isDraggingOver={droppableSnapshot.isDraggingOver}
                                    muted={category.muted}
                                    onClick={handleCollapse}
                                >
                                    {newLabel}
                                    {addChannelsCtaButton}
                                    {categoryMenu}
                                </SidebarCategoryHeader>
                                <div className='SidebarChannelGroup_content'>
                                    {category.type === CategoryTypes.DIRECT_MESSAGES && props.isDirectMessageList && props.searchBar}
                                    {category.type === CategoryTypes.DIRECT_MESSAGES && props.selectedStatusFilter && props.selectedStatusFilter !== 'all' && (
                                        <div className='SidebarDMFilterNotice'>
                                            <span className='SidebarDMFilterNotice__label'>
                                                <FormattedMessage id='sidebar.filterByStatus' defaultMessage='Filter' />
                                                <FormattedMessage id={`sidebar.status.${props.selectedStatusFilter}`} defaultMessage={props.selectedStatusFilter} />
                                            </span>
                                            <button type='button' className='SidebarDMFilterNotice__clear' onClick={clearStatusFilter}>
                                                <i className='icon icon-close-circle'/>
                                                <FormattedMessage id='widget.input.clear' defaultMessage='Clear' />
                                            </button>
                                        </div>
                                    )}
                                    {category.type === CategoryTypes.DIRECT_MESSAGES && props.isDirectMessageList ? (
                                        <Scrollbars ref={props.scrollbarRef} onScroll={props.onScroll}>
                                            <ul className='NavGroupContent'>
                                                {isNewCategory && !channelIds?.length && (
                                                    <div className='SidebarCategory_newDropBox'>
                                                        <div
                                                            ref={newDropBoxRef}
                                                            className={classNames('SidebarCategory_newDropBox-content', {
                                                                collapsed: category.collapsed || (props.draggingState.type === DraggingStateTypes.CATEGORY && props.draggingState.id === category.id),
                                                                isDraggingOver: droppableSnapshot.isDraggingOver,
                                                            })}
                                                            onTransitionEnd={removeAnimation}
                                                        >
                                                            <i className='icon-hand-right'/>
                                                            <span className='SidebarCategory_newDropBox-label'>
                                                                <FormattedMessage id='sidebar_left.sidebar_category.newDropBoxLabel' defaultMessage='Drag channels here...' />
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                {showSuggestedChannelsHeader && (
                                                    <li className='SidebarChannel SidebarNewMembersHeader'>
                                                        <span className='SidebarChannelLinkLabel'>
                                                            <FormattedMessage id='suggestionList.label' defaultMessage='Suggestions' />
                                                        </span>
                                                    </li>
                                                )}
                                                {suggestedChannels.map((c) => (
                                                    <li key={c.id} className='SidebarChannel SidebarNewMembersItem'>
                                                        <a className='SidebarLink sidebar-item SidebarNewMembersLink' href='#' onClick={(e) => { e.preventDefault(); handleSuggestedChannelClick(c); }}>
                                                            <span className='icon'><SidebarBaseChannelIcon channelType={c.type}/></span>
                                                            <div className='SidebarChannelLinkLabel_wrapper'><span className='SidebarChannelLinkLabel sidebar-item__name'>{c.display_name}</span></div>
                                                        </a>
                                                    </li>
                                                ))}
                                                {renderedChannels}
                                                {showNewMembersHeader && (
                                                    <li className='SidebarChannel SidebarNewMembersHeader'>
                                                        <span className='SidebarChannelLinkLabel'>
                                                            <FormattedMessage id='sidebar.new_members' defaultMessage='New members' />
                                                        </span>
                                                    </li>
                                                )}
                                                {newMembers.map((u) => (
                                                    <li key={u.id} className={classNames('SidebarChannel SidebarNewMembersItem', {SidebarNewMembersItem__self: u.id === props.currentUserId})}>
                                                        <a className='SidebarLink sidebar-item SidebarNewMembersLink' href='#' onClick={(e) => { e.preventDefault(); if (u.id !== props.currentUserId) { handleNewMemberClick(u.id); } }}>
                                                            <UserDetails option={u}/>
                                                        </a>
                                                    </li>
                                                ))}
                                                {noResults}
                                                {showPlaceholder() && droppableProvided.placeholder}
                                            </ul>
                                        </Scrollbars>
                                    ) : (
                                        <>
                                            {props.searchBar}
                                            <ul className='NavGroupContent'>
                                                {isNewCategory && !channelIds?.length && (
                                                    <div className='SidebarCategory_newDropBox'>
                                                        <div
                                                            ref={newDropBoxRef}
                                                            className={classNames('SidebarCategory_newDropBox-content', {
                                                                collapsed: category.collapsed || (props.draggingState.type === DraggingStateTypes.CATEGORY && props.draggingState.id === category.id),
                                                                isDraggingOver: droppableSnapshot.isDraggingOver,
                                                            })}
                                                            onTransitionEnd={removeAnimation}
                                                        >
                                                            <i className='icon-hand-right'/>
                                                            <span className='SidebarCategory_newDropBox-label'>
                                                                <FormattedMessage id='sidebar_left.sidebar_category.newDropBoxLabel' defaultMessage='Drag channels here...' />
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                {showNewMembersHeader && (
                                                    <li className='SidebarChannel SidebarNewMembersHeader'>
                                                        <span className='SidebarChannelLinkLabel'>
                                                            <FormattedMessage id='sidebar.new_members' defaultMessage='New members' />
                                                        </span>
                                                    </li>
                                                )}
                                                {newMembers.map((u) => (
                                                    <li key={u.id} className={classNames('SidebarChannel SidebarNewMembersItem', {SidebarNewMembersItem__self: u.id === props.currentUserId})}>
                                                        <a className='SidebarLink sidebar-item SidebarNewMembersLink' href='#' onClick={(e) => { e.preventDefault(); if (u.id !== props.currentUserId) { handleNewMemberClick(u.id); } }}>
                                                            <UserDetails option={u}/>
                                                        </a>
                                                    </li>
                                                ))}
                                                {showSuggestedChannelsHeader && (
                                                    <li className='SidebarChannel SidebarNewMembersHeader'>
                                                        <span className='SidebarChannelLinkLabel'>
                                                            <FormattedMessage id='suggestionList.label' defaultMessage='Suggestions' />
                                                        </span>
                                                    </li>
                                                )}
                                                {suggestedChannels.map((c) => (
                                                    <li key={c.id} className='SidebarChannel SidebarNewMembersItem'>
                                                        <a className='SidebarLink sidebar-item SidebarNewMembersLink' href='#' onClick={(e) => { e.preventDefault(); handleSuggestedChannelClick(c); }}>
                                                            <span className='icon'><SidebarBaseChannelIcon channelType={c.type}/></span>
                                                            <div className='SidebarChannelLinkLabel_wrapper'><span className='SidebarChannelLinkLabel sidebar-item__name'>{c.display_name}</span></div>
                                                        </a>
                                                    </li>
                                                ))}
                                                {renderedChannels}
                                                {noResults}
                                                {showPlaceholder() && droppableProvided.placeholder}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </Droppable>
                </div>
            )}
        </Draggable>
    );
};

export default memo(SidebarCategory);

const categoryNames = defineMessages({
    channels: {
        id: 'sidebar.types.channels',
        defaultMessage: 'CHANNELS',
    },
    direct_messages: {
        id: 'sidebar.types.direct_messages',
        defaultMessage: 'DIRECT MESSAGES',
    },
    favorites: {
        id: 'sidebar.types.favorites',
        defaultMessage: 'FAVORITES',
    },
});
