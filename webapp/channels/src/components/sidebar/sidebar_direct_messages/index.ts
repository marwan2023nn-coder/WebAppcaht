// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {getDirectMessageCategoriesForCurrentTeam, isUnreadFilterEnabled} from 'selectors/views/channel_sidebar';
import {getIsLhsOpen} from 'selectors/lhs';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import {getIsMobileView} from 'selectors/views/browser';
import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {isCustomGroupsEnabled} from 'workspace-redux/selectors/entities/preferences';
import {haveICurrentChannelPermission, haveISystemPermission} from 'workspace-redux/selectors/entities/roles';
import {getCurrentTeam} from 'workspace-redux/selectors/entities/teams';
import Permissions from 'workspace-redux/constants/permissions';

import {fetchMyCategories} from 'workspace-redux/actions/channel_categories';
import {clearChannelSelection} from 'actions/views/channel_sidebar';
import {closeModal, openModal} from 'actions/views/modals';
import {closeRightHandSide} from 'actions/views/rhs';


import type {GlobalState} from 'types/store';

import SidebarDirectMessages from './sidebar_direct_messages';

type OwnProps = {};

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const currentTeam = getCurrentTeam(state);
    const unreadFilterEnabled = isUnreadFilterEnabled(state);

    let canCreatePublicChannel = false;
    let canCreatePrivateChannel = false;
    let canJoinPublicChannel = false;

    if (currentTeam) {
        canCreatePublicChannel = haveICurrentChannelPermission(state, Permissions.CREATE_PUBLIC_CHANNEL);
        canCreatePrivateChannel = haveICurrentChannelPermission(state, Permissions.CREATE_PRIVATE_CHANNEL);
        canJoinPublicChannel = haveICurrentChannelPermission(state, Permissions.JOIN_PUBLIC_CHANNELS);
    }

    const canCreateCustomGroups = isCustomGroupsEnabled(state) && haveISystemPermission(state, {permission: Permissions.CREATE_CUSTOM_GROUP});
    return {
        ...ownProps,
        categories: getDirectMessageCategoriesForCurrentTeam(state),
        teamId: currentTeam ? currentTeam.id : '',
        canCreatePrivateChannel,
        canCreatePublicChannel,
        canJoinPublicChannel,
        isOpen: getIsLhsOpen(state),
        unreadFilterEnabled,
        isMobileView: getIsMobileView(state),
        isKeyBoardShortcutModalOpen: isModalOpen(state, ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL),
        canCreateCustomGroups,
        rhsState: getRhsState(state),
        rhsOpen: getIsRhsOpen(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            fetchMyCategories,
            clearChannelSelection,
            openModal,
            closeModal,
            closeRightHandSide,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarDirectMessages);
