// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type React from 'react';

import type {AnalyticsState} from '@workspace/types/admin';
import type {Channel} from '@workspace/types/channels';

export type Notice = {
    name: string;
    adminOnly?: boolean;
    title: React.ReactNode;
    icon?: React.ReactNode;
    body: React.ReactNode;
    allowForget: boolean;
    show?(
        serverVersion: string,
        config: any,
        license: any,
        analytics?: AnalyticsState,
        currentChannel?: Channel,
    ): boolean;
}
