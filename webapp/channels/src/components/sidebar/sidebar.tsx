// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {lazy, useCallback, useEffect, useState, memo} from 'react';

import {makeAsyncComponent} from 'components/async_load';
import DataPrefetch from 'components/data_prefetch';
import ResizableLhs from 'components/resizable_sidebar/resizable_lhs';
import SidebarHeader from 'components/sidebar/sidebar_header';

import Pluggable from 'plugins/pluggable';
import Constants, {ModalIdentifiers, RHSStates} from 'utils/constants';
import {isKeyPressed, cmdOrCtrlPressed} from 'utils/keyboard';
import {localizeMessage} from 'utils/utils';

import type {ModalData} from 'types/actions';
import type {RhsState} from 'types/store/rhs';

import ChannelNavigator from './channel_navigator';
import SidebarList from './sidebar_list';

const MobileSidebarHeader = makeAsyncComponent('MobileSidebarHeader', lazy(() => import('./mobile_sidebar_header')));
const MoreDirectChannels = makeAsyncComponent('MoreDirectChannels', lazy(() => import('components/more_direct_channels')));
const BrowseChannels = makeAsyncComponent('BrowseChannels', lazy(() => import('components/browse_channels')));
const EditCategoryModal = makeAsyncComponent('EditCategoryModal', lazy(() => import('components/edit_category_modal')));
const CreateUserGroupsModal = makeAsyncComponent('CreateUserGroupsModal', lazy(() => import('components/create_user_groups_modal')));
const InvitationModal = makeAsyncComponent('InvitationModal', lazy(() => import('components/invitation_modal')));
const KeyboardShortcutsModal = makeAsyncComponent('KeyboardShortcutsModal', lazy(() => import('components/keyboard_shortcuts/keyboard_shortcuts_modal/keyboard_shortcuts_modal')));
const NewChannelModal = makeAsyncComponent('NewChannelModal', lazy(() => import('components/new_channel_modal/new_channel_modal')));
const UserSettingsModal = makeAsyncComponent('UserSettingsModal', lazy(() => import('components/user_settings/modal')));

type Props = {
    teamId: string;
    canCreatePublicChannel: boolean;
    canCreatePrivateChannel: boolean;
    canJoinPublicChannel: boolean;
    isOpen: boolean;
    actions: {
        fetchMyCategories: (teamId: string) => void;
        openModal: <P>(modalData: ModalData<P>) => void;
        closeModal: (modalId: string) => void;
        clearChannelSelection: () => void;
        closeRightHandSide: () => void;
    };
    unreadFilterEnabled: boolean;
    isMobileView: boolean;
    isKeyBoardShortcutModalOpen: boolean;
    canCreateCustomGroups: boolean;
    rhsState?: RhsState;
    rhsOpen?: boolean;
    toggleDirectMessagesSidebar?: () => void;
    showDirectMessages?: boolean;
};

type State = {
    showDirectChannelsModal: boolean;
    isDragging: boolean;
    channelSearchTerm: string;
};

const Sidebar = (props: Props) => {
    const [showDirectChannelsModal, setShowDirectChannelsModal] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [channelSearchTerm, setChannelSearchTerm] = useState('');

    const handleChannelSearchChange = useCallback((searchTerm: string) => {
        setChannelSearchTerm(searchTerm);
    }, []);

    const handleClearChannelSearch = useCallback(() => {
        setChannelSearchTerm('');
    }, []);

    const closeEditRHS = useCallback(() => {
        if (props.rhsOpen && props.rhsState === RHSStates.EDIT_HISTORY) {
            props.actions.closeRightHandSide();
        }
    }, [props.rhsOpen, props.rhsState, props.actions]);

    useEffect(() => {
        if (props.teamId) {
            props.actions.fetchMyCategories(props.teamId);
        }
    }, [props.teamId, props.actions]);

    const handleClickClearChannelSelection = useCallback((event: MouseEvent) => {
        if (event.defaultPrevented) {
            return;
        }
        props.actions.clearChannelSelection();
    }, [props.actions]);

    const handleKeyDownEvent = useCallback((event: KeyboardEvent) => {
        if (isKeyPressed(event, Constants.KeyCodes.ESCAPE)) {
            props.actions.clearChannelSelection();
            return;
        }

        const ctrlOrMetaKeyPressed = cmdOrCtrlPressed(event, true);

        if (ctrlOrMetaKeyPressed) {
            if (isKeyPressed(event, Constants.KeyCodes.FORWARD_SLASH)) {
                event.preventDefault();
                if (props.isKeyBoardShortcutModalOpen) {
                    props.actions.closeModal(ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL);
                } else {
                    props.actions.openModal({
                        modalId: ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL,
                        dialogType: KeyboardShortcutsModal,
                    });
                }
            } else if (isKeyPressed(event, Constants.KeyCodes.A) && event.shiftKey) {
                event.preventDefault();
                props.actions.openModal({
                    modalId: ModalIdentifiers.USER_SETTINGS,
                    dialogType: UserSettingsModal,
                    dialogProps: {
                        isContentProductSettings: true,
                        focusOriginElement: 'sidebar.tsx',
                    },
                });
            }
        }
    }, [props.actions, props.isKeyBoardShortcutModalOpen]);

    useEffect(() => {
        window.addEventListener('click', handleClickClearChannelSelection);
        window.addEventListener('keydown', handleKeyDownEvent);
        return () => {
            window.removeEventListener('click', handleClickClearChannelSelection);
            window.removeEventListener('keydown', handleKeyDownEvent);
        };
    }, [handleClickClearChannelSelection, handleKeyDownEvent]);

    const showCreateCategoryModal = useCallback(() => {
        props.actions.openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
            dialogProps: {},
        });
    }, [props.actions]);

    const showMoreChannelsModal = useCallback(() => {
        props.actions.openModal({
            modalId: ModalIdentifiers.MORE_CHANNELS,
            dialogType: BrowseChannels,
        });
    }, [props.actions]);

    const invitePeopleModal = useCallback(() => {
        props.actions.openModal({
            modalId: ModalIdentifiers.INVITATION,
            dialogType: InvitationModal,
            dialogProps: {focusOriginElement: 'browseOrAddChannelMenuButton'},
        });
    }, [props.actions]);

    const showNewChannelModal = useCallback(() => {
        props.actions.openModal({
            modalId: ModalIdentifiers.NEW_CHANNEL_MODAL,
            dialogType: NewChannelModal,
        });
        closeEditRHS();
    }, [props.actions, closeEditRHS]);

    const showCreateUserGroupModal = useCallback(() => {
        props.actions.openModal({
            modalId: ModalIdentifiers.USER_GROUPS_CREATE,
            dialogType: CreateUserGroupsModal,
        });
    }, [props.actions]);

    const handleOpenMoreDirectChannelsModal = useCallback((e?: Event) => {
        e?.preventDefault();
        setShowDirectChannelsModal((prev) => {
            if (!prev) {
                closeEditRHS();
            }
            return !prev;
        });
    }, [closeEditRHS]);

    const onDragStart = useCallback(() => setIsDragging(true), []);
    const onDragEnd = useCallback(() => setIsDragging(false), []);

    if (!props.teamId) {
        return (<div/>);
    }

    const ariaLabel = localizeMessage({id: 'accessibility.sections.lhsNavigator', defaultMessage: 'channel navigator region'});

    return (
        <ResizableLhs
            id='SidebarContainer'
            className={classNames({
                'move--right': props.isOpen && props.isMobileView,
                dragging: isDragging,
            })}
        >
            {props.isMobileView ? <MobileSidebarHeader/> : (
                <SidebarHeader
                    showNewChannelModal={showNewChannelModal}
                    showMoreChannelsModal={showMoreChannelsModal}
                    showCreateUserGroupModal={showCreateUserGroupModal}
                    invitePeopleModal={invitePeopleModal}
                    showCreateCategoryModal={showCreateCategoryModal}
                    canCreateChannel={props.canCreatePrivateChannel || props.canCreatePublicChannel}
                    canJoinPublicChannel={props.canJoinPublicChannel}
                    handleOpenDirectMessagesModal={handleOpenMoreDirectChannelsModal}
                    unreadFilterEnabled={props.unreadFilterEnabled}
                    canCreateCustomGroups={props.canCreateCustomGroups}
                />
            )}
            <div
                id='lhsNavigator'
                role='application'
                aria-label={ariaLabel}
                className='a11y__region'
                data-a11y-sort-order='6'
            >
                <ChannelNavigator
                    searchTerm={channelSearchTerm}
                    onSearchTermChange={handleChannelSearchChange}
                    onClearSearchTerm={handleClearChannelSearch}
                />
            </div>
            <div className='sidebar--left__icons'>
                <Pluggable pluggableName='LeftSidebarHeader'/>
            </div>
            <SidebarList
                handleOpenMoreDirectChannelsModal={handleOpenMoreDirectChannelsModal}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                toggleDirectMessagesSidebar={props.toggleDirectMessagesSidebar}
                showDirectMessages={props.showDirectMessages}
                channelSearchTerm={channelSearchTerm}
                onClearChannelSearchTerm={handleClearChannelSearch}
            />
            <DataPrefetch/>
            {showDirectChannelsModal && (
                <MoreDirectChannels
                    onModalDismissed={() => setShowDirectChannelsModal(false)}
                    isExistingChannel={false}
                    focusOriginElement='newDirectMessageButton'
                />
            )}
        </ResizableLhs>
    );
};

export default memo(Sidebar);
