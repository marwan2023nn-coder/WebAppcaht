// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ClientConfig} from '@workspace/types/config';
import type {GlobalState} from '@workspace/types/store';

import {createSelector} from 'workspace-redux/selectors/create_selector';
import {getConfig} from 'workspace-redux/selectors/entities/general';

export const interactiveDialogAppsFormEnabled = createSelector(
    'interactiveDialogAppsFormEnabled',
    (state: GlobalState) => getConfig(state),
    (config: Partial<ClientConfig>) => {
        return config?.FeatureFlagInteractiveDialogAppsForm === 'true';
    },
);
