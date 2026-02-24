// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {UserProfile} from '@workspace/types/users';

import {getMissingProfilesByUsernames} from 'workspace-redux/actions/users';

import {getPotentialMentionsForName} from 'utils/post_utils';

import type {ActionFuncAsync} from 'types/store';

export function getMissingMentionedUsers(text: string): ActionFuncAsync<Array<UserProfile['username']>> {
    return getMissingProfilesByUsernames(getPotentialMentionsForName(text));
}
