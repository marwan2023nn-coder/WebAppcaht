// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {View} from '@workspace/types/views';
import type {GlobalState} from '@workspace/types/store';

import {createSelector} from 'workspace-redux/selectors/create_selector';

export function getView(state: GlobalState, viewId: string): View | undefined {
    return state.entities.views.views[viewId];
}

export const getViewsForChannel = createSelector(
    'getViewsForChannel',
    (state: GlobalState, channelId: string) => state.entities.views.viewsByChannel[channelId],
    (state: GlobalState) => state.entities.views.views,
    (viewIds, views) => {
        if (!viewIds) {
            return [];
        }

        return viewIds.map((id) => views[id]).filter(Boolean);
    },
);
