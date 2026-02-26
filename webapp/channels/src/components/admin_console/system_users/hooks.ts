// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {setAdminConsoleUsersManagementTableProperties} from 'actions/views/admin';

import {getAdminConsoleUserManagementTableProperties} from 'selectors/views/admin';

import type {GlobalState} from 'types/store';

export function useOnlineUsersFilter() {
    const dispatch = useDispatch();
    const {showOnlineOnly} = useSelector((state: GlobalState) => getAdminConsoleUserManagementTableProperties(state));

    const toggleOnlineOnly = useCallback(() => {
        dispatch(setAdminConsoleUsersManagementTableProperties({
            showOnlineOnly: !showOnlineOnly,
            pageIndex: 0,
            cursorDirection: undefined,
            cursorUserId: undefined,
            cursorColumnValue: undefined,
        }));
    }, [dispatch, showOnlineOnly]);

    return {
        showOnlineOnly,
        toggleOnlineOnly,
    };
}
