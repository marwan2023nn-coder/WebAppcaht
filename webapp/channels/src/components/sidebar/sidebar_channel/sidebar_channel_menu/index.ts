// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {ConnectedProps} from 'react-redux';

import type {Channel} from '@workspace/types/channels';

import {favoriteChannel, unfavoriteChannel, readMultipleChannels} from 'workspace-redux/actions/channels';
import Permissions from 'workspace-redux/constants/permissions';
import {isFavoriteChannel} from 'workspace-redux/selectors/entities/channels';
import {getMyChannelMemberships, getCurrentUserId} from 'workspace-redux/selectors/entities/common';
import {haveIChannelPermission} from 'workspace-redux/selectors/entities/roles';
import {getCurrentTeam, getCurrentTeamId, getMyTeamMember} from 'workspace-redux/selectors/entities/teams';
import {getCurrentUserRoles} from 'workspace-redux/selectors/entities/users';
import {isChannelMuted} from 'workspace-redux/utils/channel_utils';

import {unmuteChannel, muteChannel} from 'actions/channel_actions';
import {markMostRecentPostInChannelAsUnread} from 'actions/post_actions';
import {openModal} from 'actions/views/modals';

import {getSiteURL} from 'utils/url';

import type {GlobalState} from 'types/store';

import SidebarChannelMenu from './sidebar_channel_menu';

export type OwnProps = {
    channel: Channel;
    channelLink: string;
    isUnread: boolean;
    channelLeaveHandler?: (callback: () => void) => void;
    onMenuToggle: (open: boolean) => void;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const member = getMyChannelMemberships(state)[ownProps.channel.id];
    const currentTeam = getCurrentTeam(state);

    let managePublicChannelMembers = false;
    let managePrivateChannelMembers = false;

    if (currentTeam) {
        managePublicChannelMembers = haveIChannelPermission(state, currentTeam.id, ownProps.channel.id, Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS);
        managePrivateChannelMembers = haveIChannelPermission(state, currentTeam.id, ownProps.channel.id, Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS);
    }

    return {
        currentUserId: getCurrentUserId(state),
        isAdmin: (() => {
            const userRoles = getCurrentUserRoles(state) || '';
            const teamId = getCurrentTeamId(state);
            const teamMember = teamId ? getMyTeamMember(state, teamId) : undefined;
            const teamRoles = teamMember?.roles || '';
            return userRoles.includes('system_admin') || teamRoles.includes('team_admin');
        })(),
        isFavorite: isFavoriteChannel(state, ownProps.channel.id),
        isMuted: isChannelMuted(member),
        channelLink: `${getSiteURL()}${ownProps.channelLink}`,
        managePublicChannelMembers,
        managePrivateChannelMembers,
    };
}

const mapDispatchToProps = {
    readMultipleChannels,
    markMostRecentPostInChannelAsUnread,
    favoriteChannel,
    unfavoriteChannel,
    muteChannel,
    unmuteChannel,
    openModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SidebarChannelMenu);
