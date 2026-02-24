// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import type {Channel} from '@workspace/types/channels';

import {getDirectTeammate} from 'workspace-redux/selectors/entities/channels';
import {getCurrentUserId} from 'workspace-redux/selectors/entities/users';

import type {GlobalState} from 'types/store';

import SearchChannelSuggestion from './search_channel_suggestion';

type OwnProps = {
    item: Channel;
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
    const teammate = getDirectTeammate(state, ownProps.item.id);

    return {
        teammateIsBot: Boolean(teammate && teammate.is_bot),
        currentUserId: getCurrentUserId(state),
    };
};

export default connect(mapStateToProps, null, null, {forwardRef: true})(SearchChannelSuggestion);
