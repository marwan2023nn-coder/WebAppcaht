// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {AdminConfig} from '@workspace/types/config';

import PushSettings from 'components/admin_console/push_settings';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

describe('components/PushSettings', () => {
    test('should match snapshot, licensed', () => {
        const config = {
            EmailSettings: {
                PushNotificationServer: 'https://global.push.workspace.com',
                PushNotificationServerType: 'mhpns',
                SendPushNotifications: true,
            },
            TeamSettings: {
                MaxNotificationsPerChannel: 1000,
            },
        } as AdminConfig;

        const props = {
            config,
            license: {
                IsLicensed: 'true',
                MHPNS: 'true',
            },
        };

        const wrapper = shallowWithIntl(
            <PushSettings {...props}/>,
        );

        wrapper.find('#pushNotificationServerType').simulate('change', 'pushNotificationServerType', 'mhpns');
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, unlicensed', () => {
        const config = {
            EmailSettings: {
                PushNotificationServer: 'https://global.push.workspace.com',
                PushNotificationServerType: 'mhpns',
                SendPushNotifications: true,
            },
            TeamSettings: {
                MaxNotificationsPerChannel: 1000,
            },
        } as AdminConfig;

        const props = {
            config,
            license: {},
        };

        const wrapper = shallowWithIntl(
            <PushSettings {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
