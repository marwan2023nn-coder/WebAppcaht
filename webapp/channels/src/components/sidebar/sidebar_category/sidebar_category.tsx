// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import debounce from 'lodash/debounce';
import React from 'react';
import type {MouseEvent, KeyboardEvent} from 'react';
import {Draggable, Droppable} from 'react-beautiful-dnd';
import {FormattedMessage, defineMessages} from 'react-intl';

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

export default class SidebarCategory extends React.PureComponent<Props, State> {
    categoryTitleRef: React.RefObject<HTMLButtonElement>;
    newDropBoxRef: React.RefObject<HTMLDivElement>;

    searchNewMembersDebounced: ReturnType<typeof debounce>;
    searchSuggestedChannelsDebounced: ReturnType<typeof debounce>;

    a11yKeyDownRegistered: boolean;

    constructor(props: Props) {
        super(props);

        this.categoryTitleRef = React.createRef();
        this.newDropBoxRef = React.createRef();

        this.state = {
            isMenuOpen: false,
            newMembersLoading: false,
            newMembers: [],
            newMembersForTerm: '',

            suggestedChannelsLoading: false,
            suggestedChannels: [],
            suggestedChannelsForTerm: '',
        };

        this.searchNewMembersDebounced = debounce((term: string) => {
            this.searchNewMembers(term);
        }, 250);

        this.searchSuggestedChannelsDebounced = debounce((term: string) => {
            this.searchSuggestedChannels(term);
        }, 400);

        this.a11yKeyDownRegistered = false;
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.category.collapsed !== prevProps.category.collapsed && this.newDropBoxRef.current) {
            this.newDropBoxRef.current.classList.add('animating');
        }

        const isDmCategory = this.props.category.type === CategoryTypes.DIRECT_MESSAGES;
        if (isDmCategory) {
            const nextTerm = this.props.searchTerm?.trim() || '';
            const prevTerm = prevProps.searchTerm?.trim() || '';
            if (nextTerm !== prevTerm) {
                this.onNewMembersSearchTermChange(nextTerm);
            }
        }

        const isChannelsCategory = this.props.category.type === CategoryTypes.CHANNELS;
        if (isChannelsCategory) {
            const nextTerm = this.props.searchTerm?.trim() || '';
            const prevTerm = prevProps.searchTerm?.trim() || '';
            if (nextTerm !== prevTerm) {
                this.onSuggestedChannelsSearchTermChange(nextTerm);
            }
        }
    }

    onNewMembersSearchTermChange = (term: string) => {
        if (!term) {
            this.setState({newMembers: [], newMembersLoading: false, newMembersForTerm: ''});
            return;
        }

        this.setState({newMembersLoading: true, newMembersForTerm: term});
        this.searchNewMembersDebounced(term);
    };

    searchNewMembers = async (term: string) => {
        const currentTerm = this.props.searchTerm?.trim() || '';
        if (!term || term !== currentTerm) {
            return;
        }

        try {
            const teamId = this.props.restrictDirectMessage === 'any' ? '' : this.props.currentTeamId;
            const options: Record<string, any> = {};
            if (teamId !== undefined) {
                options.team_id = teamId;
            }
            if (this.props.enableSharedChannelsDMs === false) {
                options.exclude_remote = true;
            }

            const {data} = await this.props.actions.searchProfiles(term, options);
            const existing = new Set(this.props.existingDirectMessageUserIds || []);
            const filtered = (data || []).filter((u) => {
                if (!u) {
                    return false;
                }
                return !existing.has(u.id);
            });

            const stillCurrent = (this.props.searchTerm?.trim() || '') === term;
            if (!stillCurrent) {
                return;
            }

            this.setState({newMembers: filtered.slice(0, 10), newMembersLoading: false, newMembersForTerm: term});
        } catch {
            const stillCurrent = (this.props.searchTerm?.trim() || '') === term;
            if (!stillCurrent) {
                return;
            }

            this.setState({newMembers: [], newMembersLoading: false, newMembersForTerm: term});
        }
    };

    handleNewMemberClick = async (userId: string) => {
        const result = await this.props.actions.openDirectChannelToUserId(userId);
        const channel = result?.data;
        if (channel?.name && this.props.currentTeamName) {
            getHistory().push('/' + this.props.currentTeamName + '/channels/' + channel.name);
            this.props.onClearSearch?.();
        }
    };

    onSuggestedChannelsSearchTermChange = (term: string) => {
        if (!term || term.length < 2) {
            this.setState({suggestedChannels: [], suggestedChannelsLoading: false, suggestedChannelsForTerm: ''});
            return;
        }

        this.setState({suggestedChannelsLoading: true, suggestedChannelsForTerm: term});
        this.searchSuggestedChannelsDebounced(term);
    };

    searchSuggestedChannels = async (term: string) => {
        const currentTerm = this.props.searchTerm?.trim() || '';
        if (!term || term.length < 2 || term !== currentTerm) {
            return;
        }

        try {
            const teamId = this.props.currentTeamId;
            if (!teamId) {
                this.setState({suggestedChannels: [], suggestedChannelsLoading: false, suggestedChannelsForTerm: term});
                return;
            }

            const {data} = await this.props.actions.searchAllChannels(term, {team_ids: [teamId], nonAdminSearch: true, include_deleted: true}) as ActionResult<Channel[]>;
            const channels = (data || []).filter((c) => c && c.team_id === teamId);

            const memberships = this.props.myChannelMemberships || {};
            const filtered = channels.filter((c) => {
                if (c.delete_at !== 0) {
                    return false;
                }
                if (c.type !== Constants.OPEN_CHANNEL) {
                    return false;
                }
                return !memberships[c.id];
            });

            const stillCurrent = (this.props.searchTerm?.trim() || '') === term;
            if (!stillCurrent) {
                return;
            }

            this.setState({suggestedChannels: filtered.slice(0, 10), suggestedChannelsLoading: false, suggestedChannelsForTerm: term});
        } catch {
            const stillCurrent = (this.props.searchTerm?.trim() || '') === term;
            if (!stillCurrent) {
                return;
            }

            this.setState({suggestedChannels: [], suggestedChannelsLoading: false, suggestedChannelsForTerm: term});
        }
    };

    handleSuggestedChannelClick = async (channel: Channel) => {
        const joinResult = await this.props.actions.joinChannelById(channel.id);
        if (joinResult?.error) {
            return;
        }

        const switchResult = await this.props.actions.switchToChannel(channel);
        if (switchResult?.error) {
            return;
        }

        this.props.onClearSearch?.();
    };

    componentDidMount() {
        this.categoryTitleRef.current?.addEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
        this.categoryTitleRef.current?.addEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
    }

    componentWillUnmount() {
        this.categoryTitleRef.current?.removeEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
        this.categoryTitleRef.current?.removeEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);

        this.searchNewMembersDebounced.cancel();
        this.searchSuggestedChannelsDebounced.cancel();

        if (this.a11yKeyDownRegistered) {
            this.handleA11yDeactivateEvent();
        }
    }

    handleA11yActivateEvent = () => {
        this.categoryTitleRef.current?.addEventListener('keydown', this.handleA11yKeyDown);

        this.a11yKeyDownRegistered = true;
    };

    handleA11yDeactivateEvent = () => {
        this.categoryTitleRef.current?.removeEventListener('keydown', this.handleA11yKeyDown);

        this.a11yKeyDownRegistered = false;
    };

    handleA11yKeyDown = (e: KeyboardEvent<HTMLButtonElement>['nativeEvent']) => {
        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            e.preventDefault();
            this.handleCollapse();
        }
    };

    renderChannel = (channelId: string, index: number) => {
        const {setChannelRef, category, draggingState} = this.props;
        return (
            <SidebarChannel
                key={channelId}
                channelIndex={index}
                channelId={channelId}
                isDraggable={true}
                setChannelRef={setChannelRef}
                isCategoryCollapsed={category.collapsed}
                isCategoryDragged={draggingState.type === DraggingStateTypes.CATEGORY && draggingState.id === category.id}
                isAutoSortedCategory={category.sorting === CategorySorting.Alphabetical || category.sorting === CategorySorting.Recency}
            />
        );
    };

    handleCollapse = () => {
        const {category} = this.props;

        if (this.props.isDirectMessageList) {
            return;
        }

        this.props.actions.setCategoryCollapsed(category.id, !category.collapsed);
    };

    removeAnimation = () => {
        if (this.newDropBoxRef.current) {
            this.newDropBoxRef.current.classList.remove('animating');
        }
    };

    handleOpenDirectMessagesModal = (event: MouseEvent<HTMLLIElement | HTMLButtonElement> | KeyboardEvent<HTMLLIElement | HTMLButtonElement>) => {
        event.preventDefault();

        this.props.handleOpenMoreDirectChannelsModal(event.nativeEvent);
    };

    private openMessageMultipleUsersDmModal = (e: React.MouseEvent) => {
        e.preventDefault();

        this.props.actions.openModal({
            modalId: ModalIdentifiers.MESSAGE_MULTIPLE_USERS_DM,
            dialogType: MessageMultipleUsersDmModal,
            dialogProps: {
                onExited: () => this.props.actions.closeModal(ModalIdentifiers.MESSAGE_MULTIPLE_USERS_DM),
            },
        });
    };

    clearStatusFilter = () => {
        const {currentUserId} = this.props;
        this.props.actions.savePreferences(currentUserId, [{
            user_id: currentUserId,
            category: Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
            name: 'dm_gm_status_filter',
            value: 'all',
        }]);
    };

    isDropDisabled = () => {
        const {draggingState, category} = this.props;

        if (category.type === CategoryTypes.DIRECT_MESSAGES) {
            return draggingState.type === DraggingStateTypes.CHANNEL;
        } else if (category.type === CategoryTypes.CHANNELS) {
            return draggingState.type === DraggingStateTypes.DM;
        }

        return false;
    };

    renderNewDropBox = (isDraggingOver: boolean) => {
        const {draggingState, category, isNewCategory, channelIds} = this.props;

        if (!isNewCategory || channelIds?.length) {
            return null;
        }
        return (
            <>
                <Draggable
                    draggableId={`NEW_CHANNEL_SPACER__${category.id}`}
                    isDragDisabled={true}
                    index={0}
                >
                    {(provided) => {
                        // NEW_CHANNEL_SPACER here is used as a spacer to ensure react-beautiful-dnd will not try and place the first channel
                        // on the header. This acts as a space filler for the header so that the first channel dragged in will float below it.
                        return (
                            <li
                                ref={provided.innerRef}
                                draggable='false'
                                className={'SidebarChannel noFloat newChannelSpacer'}
                                {...provided.draggableProps}
                                tabIndex={-1}
                            />
                        );
                    }}
                </Draggable>
                <div className='SidebarCategory_newDropBox'>
                    <div
                        ref={this.newDropBoxRef}
                        className={classNames('SidebarCategory_newDropBox-content', {
                            collapsed: category.collapsed || (draggingState.type === DraggingStateTypes.CATEGORY && draggingState.id === category.id),
                            isDraggingOver,
                        })}
                        onTransitionEnd={this.removeAnimation}
                    >
                        <i className='icon-hand-right'/>
                        <span className='SidebarCategory_newDropBox-label'>
                            <FormattedMessage
                                id='sidebar_left.sidebar_category.newDropBoxLabel'
                                defaultMessage='Drag channels here...'
                            />
                        </span>
                    </div>
                </div>
            </>
        );
    };

    showPlaceholder = () => {
        const {channelIds, draggingState, category, isNewCategory} = this.props;

        if (category.sorting === CategorySorting.Alphabetical ||
            category.sorting === CategorySorting.Recency ||
            isNewCategory) {
            // Always show the placeholder if the channel being dragged is from the current category
            if (channelIds.find((id) => id === draggingState.id)) {
                return true;
            }

            return false;
        }

        return true;
    };

    render() {
        const {
            category,
            categoryIndex,
            channelIds,
            isNewCategory,
        } = this.props;

        if (!category) {
            return null;
        }

        if (category.type === CategoryTypes.FAVORITES && !channelIds?.length) {
            return null;
        }

        const renderedChannels = channelIds.map(this.renderChannel);

        const shouldShowNewMembers = category.type === CategoryTypes.DIRECT_MESSAGES && Boolean(this.props.searchTerm?.trim());
        const showNewMembersHeader = shouldShowNewMembers && (this.state.newMembers.length > 0 || this.state.newMembersLoading);

        let newMembersSection = null;
        if (showNewMembersHeader) {
            newMembersSection = (
                <>
                    <li className='SidebarChannel SidebarNewMembersHeader'>
                        <span className='SidebarChannelLinkLabel'>
                            <FormattedMessage
                                id='sidebar.new_members'
                                defaultMessage='New members'
                            />
                        </span>
                    </li>
                    {this.state.newMembers.map((u) => (
                        <li
                            key={u.id}
                            className={classNames('SidebarChannel SidebarNewMembersItem', {
                                SidebarNewMembersItem__self: u.id === this.props.currentUserId,
                            })}
                        >
                            <a
                                className='SidebarLink sidebar-item SidebarNewMembersLink'
                                draggable='false'
                                href='#'
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (u.id === this.props.currentUserId) {
                                        return;
                                    }
                                    this.handleNewMemberClick(u.id);
                                }}
                            >
                                <UserDetails option={u}/>
                            </a>
                        </li>
                    ))}
                </>
            );
        }

        const shouldShowSuggestedChannels = category.type === CategoryTypes.CHANNELS && Boolean(this.props.searchTerm?.trim());
        const showSuggestedChannelsHeader = shouldShowSuggestedChannels && (this.state.suggestedChannels.length > 0 || this.state.suggestedChannelsLoading);

        let suggestedChannelsSection = null;
        if (showSuggestedChannelsHeader) {
            suggestedChannelsSection = (
                <>
                    <li className='SidebarChannel SidebarNewMembersHeader'>
                        <span className='SidebarChannelLinkLabel'>
                            <FormattedMessage
                                id='suggestionList.label'
                                defaultMessage='Suggestions'
                            />
                        </span>
                    </li>
                    {this.state.suggestedChannels.map((c) => (
                        <li
                            key={c.id}
                            className='SidebarChannel SidebarNewMembersItem'
                        >
                            <a
                                className='SidebarLink sidebar-item SidebarNewMembersLink'
                                draggable='false'
                                href='#'
                                onClick={(e) => {
                                    e.preventDefault();
                                    this.handleSuggestedChannelClick(c);
                                }}
                            >
                                <span className='icon'>
                                    <SidebarBaseChannelIcon channelType={c.type}/>
                                </span>
                                <div className='SidebarChannelLinkLabel_wrapper'>
                                    <span className='SidebarChannelLinkLabel sidebar-item__name'>
                                        {c.display_name}
                                    </span>
                                </div>
                            </a>
                        </li>
                    ))}
                </>
            );
        }

        let noResults = null;
        if (this.props.searchTerm && renderedChannels.length === 0 && this.state.newMembers.length === 0 && this.state.suggestedChannels.length === 0 && !this.state.newMembersLoading && !this.state.suggestedChannelsLoading) {
            noResults = (
                <li className='SidebarChannel'>
                    <p className='w-full text-center'>
                        <FormattedMessage
                            id='sidebar.no.results'
                            defaultMessage='No results found'
                        />
                    </p>
                </li>
            );
        }

        let categoryMenu: JSX.Element;
        let newLabel: JSX.Element;
        const directMessagesModalButton: JSX.Element | null = null;
        let isCollapsible = !this.props.isDirectMessageList;
        if (isNewCategory) {
            newLabel = (
                <div className='SidebarCategory_newLabel'>
                    <FormattedMessage
                        id='sidebar_left.sidebar_category.newLabel'
                        defaultMessage='new'
                    />
                </div>
            );

            categoryMenu = <SidebarCategoryMenu category={category}/>;
        } else if (category.type === CategoryTypes.DIRECT_MESSAGES) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const addHelpLabel = localizeMessage({id: 'sidebar.createDirectMessage', defaultMessage: 'Create new direct message'});
            const messageMultipleHelpLabel = localizeMessage({id: 'sidebar.dm_menu.message_multiple', defaultMessage: 'Message multiple people'});

            categoryMenu = (
                <div className='SidebarChannelGroupHeader_actions'>
                    {/* <WithTooltip
                        title={
                            addHelpLabel
                        }
                    >
                        <button
                            id='newDirectMessageButton'
                            className='SidebarChannelGroupHeader_addButton'
                            onClick={this.handleOpenDirectMessagesModal}
                            aria-label={addHelpLabel}
                        >
                           <PlusIcon size={'1.8rem'}/>
                        </button>
                    </WithTooltip> */}
                    <WithTooltip
                        title={
                            messageMultipleHelpLabel
                        }
                    >
                        <button
                            id='messageMultipleUsersDmButton'
                            className='SidebarChannelGroupHeader_addButton'
                            onClick={this.openMessageMultipleUsersDmModal}
                            aria-label={messageMultipleHelpLabel}
                        >
                            <ProductChannelsIcon size={'1.8rem'}/>
                        </button>
                    </WithTooltip>
                    <SidebarCategorySortingMenu
                        category={category}
                        handleOpenDirectMessagesModal={this.handleOpenDirectMessagesModal}
                    />

                </div>
            );

            if (this.props.isDirectMessageList) {
                isCollapsible = false;
            } else if (!channelIds || !channelIds.length) {
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

        return (
            <Draggable
                draggableId={category.id}
                index={categoryIndex}
                disableInteractiveElementBlocking={true}
            >
                {(provided, snapshot) => {
                    // let inviteMembersButton = null;
                    // if (category.type === 'direct_messages' && !category.collapsed) {
                    //     inviteMembersButton = (
                    //         <InviteMembersButton
                    //             className='followingSibling'
                    //         />
                    //     );
                    // }

                    let addChannelsCtaButton = null;
                    if (category.type === CategoryTypes.CHANNELS && !category.collapsed) {
                        addChannelsCtaButton = (
                            <AddChannelsCtaButton iconOnly={true}/>
                        );
                    }

                    return (
                        <div
                            className={classNames('SidebarChannelGroup a11y__section', {
                                'direct-messages': category.type === CategoryTypes.DIRECT_MESSAGES,
                                dropDisabled: this.isDropDisabled(),
                                menuIsOpen: this.state.isMenuOpen,
                                capture: this.props.draggingState.state === DraggingStates.CAPTURE,
                                isCollapsed: category.collapsed,
                            })}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                        >
                            <Droppable
                                droppableId={category.id}
                                type='SIDEBAR_CHANNEL'
                                isDropDisabled={this.isDropDisabled()}
                            >
                                {(droppableProvided, droppableSnapshot) => {
                                    return (
                                        <div
                                            {...droppableProvided.droppableProps}
                                            ref={droppableProvided.innerRef}
                                            className={classNames({
                                                draggingOver: droppableSnapshot.isDraggingOver,
                                            })}
                                        >
                                            <SidebarCategoryHeader
                                                ref={this.categoryTitleRef}
                                                displayName={displayName}
                                                dragHandleProps={provided.dragHandleProps}
                                                isCollapsed={category.collapsed}
                                                isCollapsible={isCollapsible}
                                                isDragging={snapshot.isDragging}
                                                isDraggingOver={droppableSnapshot.isDraggingOver}
                                                muted={category.muted}
                                                onClick={this.handleCollapse}
                                            >
                                                {newLabel}

                                                {directMessagesModalButton}

                                                {addChannelsCtaButton}
                                                {categoryMenu}
                                            </SidebarCategoryHeader>
                                            <div
                                                className={classNames('SidebarChannelGroup_content')}
                                            >
                                                {category.type === CategoryTypes.DIRECT_MESSAGES && this.props.isDirectMessageList ? this.props.searchBar : null}
                                                {category.type === CategoryTypes.DIRECT_MESSAGES && this.props.selectedStatusFilter && this.props.selectedStatusFilter !== 'all' && (
                                                    <div className='SidebarDMFilterNotice'>
                                                        <span className='SidebarDMFilterNotice__label'>
                                                            <FormattedMessage
                                                                id='sidebar.filterByStatus'
                                                                defaultMessage='Filter'
                                                            />
                                                            {this.props.selectedStatusFilter === 'online' && (
                                                                <FormattedMessage
                                                                    id='sidebar.status.online'
                                                                    defaultMessage='Online'
                                                                />
                                                            )}
                                                            {this.props.selectedStatusFilter === 'away' && (
                                                                <FormattedMessage
                                                                    id='sidebar.status.away'
                                                                    defaultMessage='Away'
                                                                />
                                                            )}
                                                            {this.props.selectedStatusFilter === 'offline' && (
                                                                <FormattedMessage
                                                                    id='sidebar.status.offline'
                                                                    defaultMessage='Offline'
                                                                />
                                                            )}
                                                        </span>
                                                        <button
                                                            type='button'
                                                            className='SidebarDMFilterNotice__clear'
                                                            onClick={this.clearStatusFilter}
                                                        >
                                                            <i className='icon icon-close-circle'/>
                                                            <FormattedMessage
                                                                id='widget.input.clear'
                                                                defaultMessage='Clear'
                                                            />
                                                        </button>
                                                    </div>
                                                )}
                                                {category.type === CategoryTypes.DIRECT_MESSAGES && this.props.isDirectMessageList ? (
                                                    <Scrollbars
                                                        ref={this.props.scrollbarRef}
                                                        onScroll={this.props.onScroll}
                                                    >
                                                        <ul
                                                            className='NavGroupContent'
                                                        >
                                                            {this.renderNewDropBox(droppableSnapshot.isDraggingOver)}
                                                            {suggestedChannelsSection}
                                                            {renderedChannels}
                                                            {newMembersSection}
                                                            {noResults}
                                                            {this.showPlaceholder() ? droppableProvided.placeholder : null}
                                                        </ul>
                                                    </Scrollbars>
                                                ) : (
                                                    <>
                                                        {this.props.searchBar}
                                                        <ul
                                                            className='NavGroupContent'
                                                        >
                                                            {this.renderNewDropBox(droppableSnapshot.isDraggingOver)}
                                                            {newMembersSection}
                                                            {suggestedChannelsSection}
                                                            {renderedChannels}
                                                            {noResults}
                                                            {this.showPlaceholder() ? droppableProvided.placeholder : null}
                                                        </ul>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }}
                            </Droppable>
                            {/* {inviteMembersButton} */}
                        </div>
                    );
                }}
            </Draggable>
        );
    }
}

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
