// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from '@workspace/types/store';

export function getDisplayableErrors(state: GlobalState) {
    return state.errors.filter((error) => error.displayable);
}
