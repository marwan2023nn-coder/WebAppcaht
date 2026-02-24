// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from '@workspace/types/store';

import {createSelector} from 'workspace-redux/selectors/create_selector';
import {getBrowserInfo, getPlatformInfo} from 'workspace-redux/utils/browser_info';

import {getConfig, getLicense} from './general';
import {getCurrentTeamId} from './teams';
import {getCurrentUserId} from './users';

export function getReportAProblemLink(state: GlobalState): string {
    const config = getConfig(state);
    const type = config.ReportAProblemType;
    switch (type) {
    case 'email':
        return getSystemInfoMailtoLink(state, config.ReportAProblemMail);
    case 'link':
        if (config.ReportAProblemLink) {
            return config.ReportAProblemLink;
        }

        // falls through
    case 'default': {
        const isLicensed = getLicense(state).IsLicensed === 'true';
        if (isLicensed) {
            return 'https://workspace.com/pl/report_a_problem_licensed';
        }
        return 'https://workspace.com/pl/report_a_problem_unlicensed';
    }
    }
    return '';
}

export const getSystemInfoMailtoLink = createSelector(
    'getSystemInfoMailtoLink',
    getCurrentUserId,
    getCurrentTeamId,
    (state: GlobalState) => getConfig(state).Version,
    (state: GlobalState) => getConfig(state).BuildNumber,
    (state: GlobalState) => getConfig(state).SiteName,
    (state: GlobalState, supportEmail: string | undefined) => supportEmail,
    (currentUserId: string, currentTeamId: string, version: string | undefined, buildNumber: string | undefined, siteName: string | undefined, supportEmail: string | undefined) => {
        const {browser, browserVersion} = getBrowserInfo();
        const platformName = getPlatformInfo();

        const subject = `Problem with ${siteName || 'Workspace'} app`;
        const body = `
System Information:
- User ID: ${currentUserId}
- Team ID: ${currentTeamId}
- Server Version: ${version} (${buildNumber})
- Browser: ${browser} ${browserVersion}
- Platform: ${platformName}
`.trim();

        return `mailto:${supportEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    },
);
