// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {CloudUsage} from '@workspace/types/cloud';
import type {GlobalState} from '@workspace/types/store';

export function getUsage(state: GlobalState): CloudUsage {
    return state.entities.usage;
}
