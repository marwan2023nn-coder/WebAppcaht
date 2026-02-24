// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {RemoteCluster} from '@workspace/types/remote_clusters';

import {isConfirmed} from './utils';

describe('isConfirmed', () => {
    it('should return true', () => {
        const confirmed = isConfirmed({site_url: 'https://siteurl'} as RemoteCluster);
        expect(confirmed).toBe(true);
    });

    it('should return false', () => {
        const confirmed = isConfirmed({site_url: 'pending_https://siteurl'} as RemoteCluster);
        expect(confirmed).toBe(false);
    });
});
