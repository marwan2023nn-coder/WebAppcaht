// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import mockStore from 'tests/test_store';

import {loadConfigAndMe} from './index';

jest.mock('workspace-redux/actions/general', () => {
    const original = jest.requireActual('workspace-redux/actions/general');
    return {
        ...original,
        getClientConfig: () => ({type: 'MOCK_GET_CLIENT_CONFIG'}),
        getLicenseConfig: () => ({type: 'MOCK_GET_LICENSE_CONFIG'}),
    };
});

jest.mock('workspace-redux/actions/users', () => {
    const original = jest.requireActual('workspace-redux/actions/users');
    return {
        ...original,
        getMe: () => ({type: 'MOCK_LOAD_ME'}),
    };
});

jest.mock('workspace-redux/actions/preferences', () => {
    const original = jest.requireActual('workspace-redux/actions/preferences');
    return {
        ...original,
        getMyPreferences: () => ({type: 'MOCK_LOAD_PREFERENCES'}),
    };
});

jest.mock('workspace-redux/actions/teams', () => {
    const original = jest.requireActual('workspace-redux/actions/teams');
    return {
        ...original,
        getMyTeamMembers: () => ({type: 'MOCK_GET_MY_TEAM_MEMBERS'}),
        getMyTeams: () => ({type: 'MOCK_GET_MY_TEAMS'}),
        getMyTeamUnreads: () => ({type: 'MOCK_GET_MY_TEAM_UNREADS'}),
    };
});

jest.mock('workspace-redux/selectors/entities/preferences', () => {
    const original = jest.requireActual('workspace-redux/selectors/entities/preferences');
    return {
        ...original,
        isCollapsedThreadsEnabled: () => false,
    };
});

jest.mock('workspace-redux/actions/limits', () => ({
    ...jest.requireActual('workspace-redux/actions/limits'),
    getServerLimits: () => ({type: 'MOCK_GET_SERVER_LIMITS'}),
}));

describe('loadConfigAndMe', () => {
    test('loadConfigAndMe, without user logged in', async () => {
        const testStore = mockStore({});

        await testStore.dispatch(loadConfigAndMe());
        expect(testStore.getActions()).toEqual([{type: 'MOCK_GET_CLIENT_CONFIG'}, {type: 'MOCK_GET_LICENSE_CONFIG'}]);
    });

    test('loadConfigAndMe, with user logged in', async () => {
        const testStore = mockStore({
            entities: {
                general: {
                    serverVersion: '1.0.0',
                },
                users: {
                    currentUserId: 'userid',
                },
            },
        });

        document.cookie = 'MMUSERID=userid';
        localStorage.setItem('was_logged_in', 'true');

        await testStore.dispatch(loadConfigAndMe());
        expect(testStore.getActions()).toEqual([
            {type: 'MOCK_GET_CLIENT_CONFIG'},
            {type: 'MOCK_GET_LICENSE_CONFIG'},
            {type: 'RECEIVED_SERVER_VERSION', data: '1.0.0'},
            {type: 'MOCK_LOAD_ME'},
            {type: 'MOCK_LOAD_PREFERENCES'},
            {type: 'MOCK_GET_MY_TEAMS'},
            {type: 'MOCK_GET_MY_TEAM_MEMBERS'},
            {type: 'MOCK_GET_MY_TEAM_UNREADS'},
            {type: 'MOCK_GET_SERVER_LIMITS'},
        ]);
    });
});
