// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {WorkspaceFeatures} from './constants';

// eslint-disable-next-line @typescript-eslint/ban-types
export function mapFeatureIdToTranslation(id: string, formatMessage: Function): string {
    switch (id) {
    case WorkspaceFeatures.GUEST_ACCOUNTS:
        return formatMessage({id: 'webapp.workspace.feature.guest_accounts', defaultMessage: 'Guest Accounts'});
    case WorkspaceFeatures.CUSTOM_USER_GROUPS:
        return formatMessage({id: 'webapp.workspace.feature.custom_user_groups', defaultMessage: 'Custom User groups'});
    case WorkspaceFeatures.CREATE_MULTIPLE_TEAMS:
        return formatMessage({id: 'webapp.workspace.feature.create_multiple_teams', defaultMessage: 'Create Multiple Teams'});
    case WorkspaceFeatures.START_CALL:
        return formatMessage({id: 'webapp.workspace.feature.start_call', defaultMessage: 'Start call'});
    case WorkspaceFeatures.PLAYBOOKS_RETRO:
        return formatMessage({id: 'webapp.workspace.feature.playbooks_retro', defaultMessage: 'Playbooks Retrospective'});
    case WorkspaceFeatures.UNLIMITED_MESSAGES:
        return formatMessage({id: 'webapp.workspace.feature.unlimited_messages', defaultMessage: 'Unlimited Messages'});
    case WorkspaceFeatures.UNLIMITED_FILE_STORAGE:
        return formatMessage({id: 'webapp.workspace.feature.unlimited_file_storage', defaultMessage: 'Unlimited File Storage'});
    case WorkspaceFeatures.ALL_PROFESSIONAL_FEATURES:
        return formatMessage({id: 'webapp.workspace.feature.all_professional', defaultMessage: 'All Professional features'});
    case WorkspaceFeatures.ALL_ENTERPRISE_FEATURES:
        return formatMessage({id: 'webapp.workspace.feature.all_enterprise', defaultMessage: 'All Enterprise features'});
    case WorkspaceFeatures.UPGRADE_DOWNGRADED_WORKSPACE:
        return formatMessage({id: 'webapp.workspace.feature.upgrade_downgraded_workspace', defaultMessage: 'Revert the workspace to a paid plan'});
    case WorkspaceFeatures.HIGHLIGHT_WITHOUT_NOTIFICATION:
        return formatMessage({id: 'webapp.workspace.feature.highlight_without_notification', defaultMessage: 'Keywords Highlight Without Notification'});
    default:
        return '';
    }
}
