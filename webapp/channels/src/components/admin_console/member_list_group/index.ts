// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {getGroupStats} from 'workspace-redux/actions/groups';
import {searchProfiles, getProfilesInGroup} from 'workspace-redux/actions/users';
import {getGroupMemberCount} from 'workspace-redux/selectors/entities/groups';
import {getProfilesInGroup as selectProfiles, searchProfilesInGroup} from 'workspace-redux/selectors/entities/users';

import {setModalSearchTerm} from 'actions/views/search';

import type {GlobalState} from 'types/store';

import MemberListGroup from './member_list_group';

type Props = {
    groupID: string;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const {groupID} = ownProps;
    const searchTerm = state.views.search.modalSearch;
    let users;
    if (searchTerm) {
        users = searchProfilesInGroup(state, groupID, searchTerm);
    } else {
        users = selectProfiles(state, groupID);
    }

    return {
        searchTerm,
        users,
        total: getGroupMemberCount(state, groupID) || 0,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            getProfilesInGroup,
            searchProfiles,
            setModalSearchTerm,
            getGroupStats,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberListGroup);
