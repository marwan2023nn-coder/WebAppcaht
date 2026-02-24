// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getChannelMember} from 'workspace-redux/actions/channels';
import {getTeamMember} from 'workspace-redux/actions/teams';

import type {ThunkActionFunc} from 'types/store';

export function getMembershipForEntities(teamId: string, userId: string, channelId?: string): ThunkActionFunc<unknown> {
    return (dispatch) => {
        return Promise.all([
            dispatch(getTeamMember(teamId, userId)),
            channelId && dispatch(getChannelMember(channelId, userId)),
        ]);
    };
}
