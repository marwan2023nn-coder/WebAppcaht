// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Team} from '@workspace/types/teams';

import {getTeam as getTeamAction} from 'workspace-redux/actions/teams';
import {getTeam as getTeamSelector} from 'workspace-redux/selectors/entities/teams';

import {makeUseEntity} from 'components/common/hooks/useEntity';

export const useTeam = makeUseEntity<Team>({
    name: 'useTeam',
    fetch: getTeamAction,
    selector: getTeamSelector,
});
