// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector} from 'react-redux';

import {getInt} from 'workspace-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'workspace-redux/selectors/entities/users';

import type {GlobalState} from 'types/store';

import {TutorialTourName} from '../constant';

export const useShowOnboardingTutorialStep = (stepToShow: number): boolean => {
    const currentUserId = useSelector(getCurrentUserId);
    const boundGetInt = (state: GlobalState) => getInt(state, TutorialTourName.ONBOARDING_TUTORIAL_STEP, currentUserId, 0);
    const step = useSelector<GlobalState, number>(boundGetInt);
    return step === stepToShow;
};
