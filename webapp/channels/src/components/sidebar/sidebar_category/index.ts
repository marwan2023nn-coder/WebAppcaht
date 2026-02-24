// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {RefObject} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {ChannelCategory} from '@workspace/types/channel_categories';
import type {UserProfile} from '@workspace/types/users';

import {createSelector} from 'workspace-redux/selectors/create_selector';
import {get as getPreference} from 'workspace-redux/selectors/entities/preferences';
import {setCategoryCollapsed, setCategorySorting} from 'workspace-redux/actions/channel_categories';
import {searchProfiles} from 'workspace-redux/actions/users';
import {savePreferences} from 'workspace-redux/actions/preferences';
import {makeGetChannel} from 'workspace-redux/selectors/entities/channels';
import {getMyChannelMemberships} from 'workspace-redux/selectors/entities/channels';
import {getConfig, getFeatureFlagValue} from 'workspace-redux/selectors/entities/general';
import {getCurrentTeam} from 'workspace-redux/selectors/entities/teams';
import {getCurrentUser, getCurrentUserId} from 'workspace-redux/selectors/entities/users';
import {General} from 'workspace-redux/constants';
import {getUserIdFromChannelName} from 'workspace-redux/utils/channel_utils';
import {isAdmin} from 'workspace-redux/utils/user_utils';

import {searchAllChannels} from 'workspace-redux/actions/channels';

import {openModal, closeModal} from 'actions/views/modals';
import {joinChannelById, switchToChannel} from 'actions/views/channel';
import {openDirectChannelToUserId} from 'actions/channel_actions';

import {getDraggingState, makeGetFilteredChannelIdsForCategory} from 'selectors/views/channel_sidebar';

import type {GlobalState} from 'types/store';

import SidebarCategory from './sidebar_category';

type OwnProps = {
    category: ChannelCategory;
    searchTerm?: string;
    isDirectMessageList?: boolean;
    scrollbarRef?: RefObject<HTMLElement>;
    onScroll?: (e: Event) => void;
    onClearSearch?: () => void;
}

function makeMapStateToProps() {
    const getChannelIdsForCategory = makeGetFilteredChannelIdsForCategory();
    const getChannel = makeGetChannel();

    const getChannelIdsForCategoryWithSearch = createSelector(
        'getChannelIdsForCategoryWithSearch',
        (state: GlobalState, category: ChannelCategory, searchTerm?: string) => getChannelIdsForCategory(state, category),
        (state: GlobalState) => state,
        (_state: GlobalState, category: ChannelCategory) => category,
        getCurrentUserId,
        (_state: GlobalState, _category: ChannelCategory, searchTerm?: string) => searchTerm,
        (channelIds, state, category, currentUserId, searchTerm) => {
            const term = searchTerm?.trim().toLowerCase();
            if (!term) {
                return channelIds;
            }

            const filtered = channelIds.filter((id) => {
                const channel = getChannel(state, id);
                const channelDisplay = channel?.display_name?.toLowerCase() || '';

                if (category.type === 'direct_messages' && channel?.type === General.GM_CHANNEL) {
                    return false;
                }

                if (category.type === 'direct_messages' && channel?.type === General.DM_CHANNEL) {
                    const otherUserId = getUserIdFromChannelName(currentUserId, channel.name);
                    const otherUser = state.entities.users.profiles[otherUserId] as UserProfile | undefined;

                    const haystack = [
                        channelDisplay,
                        otherUser?.username,
                        otherUser?.first_name,
                        otherUser?.last_name,
                        otherUser?.nickname,
                    ].filter(Boolean).join(' ').toLowerCase();

                    return haystack.includes(term);
                }

                return channelDisplay.includes(term);
            });

            return filtered.length === channelIds.length ? channelIds : filtered;
        },
    );

    return (state: GlobalState, ownProps: OwnProps) => {
        const allChannelIds = getChannelIdsForCategory(state, ownProps.category);
        const currentUserId = getCurrentUserId(state);
        const currentTeam = getCurrentTeam(state);
        const config = getConfig(state);
        const enableSharedChannelsDMs = getFeatureFlagValue(state, 'EnableSharedChannelsDMs') === 'true';

        let existingDirectMessageUserIds: string[] = [];
        if (ownProps.category.type === 'direct_messages') {
            existingDirectMessageUserIds = allChannelIds.reduce((acc, id) => {
                const channel = getChannel(state, id);
                if (!channel || channel.type !== General.DM_CHANNEL) {
                    return acc;
                }

                acc.push(getUserIdFromChannelName(currentUserId, channel.name));
                return acc;
            }, [] as string[]);
        }

        return {
            channelIds: getChannelIdsForCategoryWithSearch(state, ownProps.category, ownProps.searchTerm),
            draggingState: getDraggingState(state),
            currentUserId,
            isAdmin: isAdmin(getCurrentUser(state).roles),
            selectedStatusFilter: getPreference(state, 'sidebar_settings', 'dm_gm_status_filter', 'all'),
            currentTeamId: currentTeam?.id,
            currentTeamName: currentTeam?.name,
            restrictDirectMessage: config.RestrictDirectMessage,
            enableSharedChannelsDMs,
            existingDirectMessageUserIds,
            myChannelMemberships: getMyChannelMemberships(state),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            setCategoryCollapsed,
            setCategorySorting,
            savePreferences,
            openModal,
            closeModal,
            searchProfiles,
            openDirectChannelToUserId,
            searchAllChannels,
            joinChannelById,
            switchToChannel,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarCategory);
