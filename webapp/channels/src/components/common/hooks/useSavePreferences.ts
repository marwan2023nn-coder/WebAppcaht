// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import type {PreferenceType} from '@workspace/types/preferences';

import {savePreferences} from 'workspace-redux/actions/preferences';
import {getCurrentUserId} from 'workspace-redux/selectors/entities/users';

type MinimalPreferenceType = Omit<PreferenceType, 'user_id'>
export default function useSavePreferences(): (preferences: MinimalPreferenceType | MinimalPreferenceType[]) => void {
    const userId = useSelector(getCurrentUserId);
    const dispatch = useDispatch();

    return useCallback((preferences: MinimalPreferenceType | MinimalPreferenceType[]) => {
        const preferencesList = ((preferences as MinimalPreferenceType[]).length ? preferences : [preferences]) as MinimalPreferenceType[];
        const preferencesListWithUserId: PreferenceType[] = preferencesList.map((x) => ({...x, user_id: userId}));
        dispatch(savePreferences(userId, preferencesListWithUserId));
    }, [dispatch, userId]);
}

type MinimalBoolPreferenceType = Omit<MinimalPreferenceType, 'value'> & {value?: boolean}

export function useSaveBool(): (preference: MinimalBoolPreferenceType) => void {
    const savePreference = useSavePreferences();

    return useCallback((preference: MinimalBoolPreferenceType) => {
        savePreference({
            category: preference.category,
            name: preference.name,
            value: preference.value === true ? 'true' : 'false',
        });
    }, [savePreference]);
}
