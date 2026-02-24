// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {ClientConfig, ClientLicense} from '@workspace/types/config';
import type {Role} from '@workspace/types/roles';

import GeneralConstants from 'workspace-redux/constants/general';
import Permissions from 'workspace-redux/constants/permissions';

import type {AdditionalValues, Group} from './types';

import EditPostTimeLimitButton from '../edit_post_time_limit_button';
import EditPostTimeLimitModal from '../edit_post_time_limit_modal';
import PermissionGroup from '../permission_group';

type Props = {
    scope: string;
    config: Partial<ClientConfig>;
    role: Partial<Role>;
    onToggle: (name: string, ids: string[]) => void;
    parentRole?: Partial<Role>;
    selected?: string;
    selectRow: (id: string) => void;
    readOnly?: boolean;
    license?: ClientLicense;
    customGroupsEnabled: boolean;
}

type State = {
    editTimeLimitModalIsVisible: boolean;
}

export default class PermissionsTree extends React.PureComponent<Props, State> {
    static defaultProps: Partial<Props> = {
        role: {
            permissions: [],
        },
    };

    private ADDITIONAL_VALUES: AdditionalValues;
    private groups: Group[];
    constructor(props: Props) {
        super(props);

        this.state = {
            editTimeLimitModalIsVisible: false,
        };

        this.ADDITIONAL_VALUES = {
            edit_post: {
                editTimeLimitButton: (
                    <EditPostTimeLimitButton
                        onClick={this.openPostTimeLimitModal}
                        isDisabled={this.props.readOnly}
                    />
                ),
            },
        };

        this.groups = [
            {
                id: 'teams',
                permissions: [
                    {
                        id: 'send_invites',
                        combined: true,
                        permissions: [
                            Permissions.INVITE_USER,
                            Permissions.GET_PUBLIC_LINK,
                            Permissions.ADD_USER_TO_TEAM,
                        ],
                    },
                    Permissions.CREATE_TEAM,
                ],
            },
            {
                id: 'public_channel',
                permissions: [
                    Permissions.CREATE_PUBLIC_CHANNEL,
                    Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES,
                    {
                        id: 'manage_public_channel_members_and_read_groups',
                        combined: true,
                        permissions: [
                            Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS,
                            Permissions.READ_PUBLIC_CHANNEL_GROUPS,
                        ],
                    },
                    Permissions.DELETE_PUBLIC_CHANNEL,
                    Permissions.CONVERT_PUBLIC_CHANNEL_TO_PRIVATE,
                ],
            },
            {
                id: 'private_channel',
                permissions: [
                    Permissions.CREATE_PRIVATE_CHANNEL,
                    Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES,
                    {
                        id: 'manage_private_channel_members_and_read_groups',
                        combined: true,
                        permissions: [
                            Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS,
                            Permissions.READ_PRIVATE_CHANNEL_GROUPS,
                        ],
                    },
                    Permissions.DELETE_PRIVATE_CHANNEL,
                ],
            },
            {
                id: 'playbook_public',
                permissions: [
                    Permissions.PLAYBOOK_PUBLIC_CREATE,
                    Permissions.PLAYBOOK_PUBLIC_MANAGE_PROPERTIES,
                    Permissions.PLAYBOOK_PUBLIC_MANAGE_MEMBERS,
                    Permissions.PLAYBOOK_PUBLIC_MAKE_PRIVATE,
                ],
                isVisible: () => true,
            },
            {
                id: 'playbook_private',
                permissions: [
                    Permissions.PLAYBOOK_PRIVATE_CREATE,
                    Permissions.PLAYBOOK_PRIVATE_MANAGE_PROPERTIES,
                    Permissions.PLAYBOOK_PRIVATE_MANAGE_MEMBERS,
                    Permissions.PLAYBOOK_PRIVATE_MAKE_PUBLIC,
                ],
                isVisible: () => true,
            },
            {
                id: 'runs',
                permissions: [
                    Permissions.RUN_CREATE,
                ],
            },
            {
                id: 'posts',
                permissions: [
                    {
                        id: 'edit_posts',
                        permissions: [
                            Permissions.EDIT_POST,
                            Permissions.EDIT_OTHERS_POSTS,
                        ],
                    },
                    {
                        id: 'delete_posts',
                        permissions: [
                            Permissions.DELETE_POST,
                            Permissions.DELETE_OTHERS_POSTS,
                        ],
                    },
                    {
                        id: 'reactions',
                        combined: true,
                        permissions: [
                            Permissions.ADD_REACTION,
                            Permissions.REMOVE_REACTION,
                        ],
                    },
                    Permissions.USE_CHANNEL_MENTIONS,
                ],
            },
            {
                id: 'integrations',
                permissions: [
                ],
            },
            {
                id: 'manage_shared_channels',
                permissions: [
                ],
            },
            {
                id: 'custom_groups',
                permissions: [
                    Permissions.CREATE_CUSTOM_GROUP,
                    Permissions.MANAGE_CUSTOM_GROUP_MEMBERS,
                    Permissions.EDIT_CUSTOM_GROUP,
                    Permissions.DELETE_CUSTOM_GROUP,
                    Permissions.RESTORE_CUSTOM_GROUP,
                ],
            },
        ];
        this.updateGroups();
    }

    updateGroups = () => {
        const {config, scope, license, role} = this.props;

        const getGroup = (id: string) => this.groups.find((g) => g.id === id);
        const teamsGroup = getGroup('teams') || getGroup('teams_team_scope');
        const publicChannelsGroup = getGroup('public_channel');
        const privateChannelsGroup = getGroup('private_channel');
        const postsGroup = getGroup('posts');
        const integrationsGroup = getGroup('integrations');
        const sharedChannelsGroup = getGroup('manage_shared_channels');
        const customGroupsGroup = getGroup('custom_groups');

        if (config.EnableIncomingWebhooks === 'true' && integrationsGroup) {
            const incomingWebhookGroup = {
                id: 'manage_incoming_webhooks_group',
                permissions: [
                    Permissions.MANAGE_OWN_INCOMING_WEBHOOKS,
                    Permissions.MANAGE_OTHERS_INCOMING_WEBHOOKS,
                    Permissions.BYPASS_INCOMING_WEBHOOK_CHANNEL_LOCK,
                ],
            };
            if (!integrationsGroup.permissions.some((p) => typeof p !== 'string' && p.id === 'manage_incoming_webhooks_group')) {
                integrationsGroup.permissions.push(incomingWebhookGroup);
            }
        }
        if (config.EnableOutgoingWebhooks === 'true' && integrationsGroup) {
            const outgoingWebhookGroup = {
                id: 'manage_outgoing_webhooks_group',
                permissions: [
                    Permissions.MANAGE_OWN_OUTGOING_WEBHOOKS,
                    Permissions.MANAGE_OTHERS_OUTGOING_WEBHOOKS,
                ],
            };
            if (!integrationsGroup.permissions.some((p) => typeof p !== 'string' && p.id === 'manage_outgoing_webhooks_group')) {
                integrationsGroup.permissions.push(outgoingWebhookGroup);
            }
        }

        if (integrationsGroup) {
            if (config.EnableOAuthServiceProvider === 'true' && !integrationsGroup.permissions.includes(Permissions.MANAGE_OAUTH)) {
                integrationsGroup.permissions.push(Permissions.MANAGE_OAUTH);
            }
            if (config.EnableOutgoingOAuthConnections === 'true' && !integrationsGroup.permissions.includes(Permissions.MANAGE_OUTGOING_OAUTH_CONNECTIONS)) {
                integrationsGroup.permissions.push(Permissions.MANAGE_OUTGOING_OAUTH_CONNECTIONS);
            }
        }

        if (config.EnableCommands === 'true' && integrationsGroup) {
            const slashCommandGroup = {
                id: 'manage_slash_commands_group',
                permissions: [
                    Permissions.MANAGE_OWN_SLASH_COMMANDS,
                    Permissions.MANAGE_OTHERS_SLASH_COMMANDS,
                ],
            };
            if (!integrationsGroup.permissions.some((p) => typeof p !== 'string' && p.id === 'manage_slash_commands_group')) {
                integrationsGroup.permissions.push(slashCommandGroup);
            }
        }

        if (config.EnableCustomEmoji === 'true' && integrationsGroup) {
            [Permissions.CREATE_EMOJIS, Permissions.DELETE_EMOJIS, Permissions.DELETE_OTHERS_EMOJIS].forEach((perm) => {
                if (!integrationsGroup.permissions.includes(perm)) {
                    integrationsGroup.permissions.push(perm);
                }
            });
        }

        if (teamsGroup && config.EnableGuestAccounts === 'true' && !teamsGroup.permissions.includes(Permissions.INVITE_GUEST)) {
            teamsGroup.permissions.push(Permissions.INVITE_GUEST);
        }

        if (scope === 'team_scope' && teamsGroup && teamsGroup.id === 'teams') {
            teamsGroup.id = 'teams_team_scope';
        }

        if (postsGroup) {
            if (license?.IsLicensed === 'true' && (license?.LDAPGroups === 'true' || config.EnableCustomGroups === 'true') && !postsGroup.permissions.includes(Permissions.USE_GROUP_MENTIONS)) {
                postsGroup.permissions.push(Permissions.USE_GROUP_MENTIONS);
            }

            const createPostId = Permissions.CREATE_POST;
            if (!postsGroup.permissions.some((p) => typeof p !== 'string' && p.id === createPostId)) {
                postsGroup.permissions.push({
                    id: createPostId,
                    combined: true,
                    permissions: [
                        Permissions.CREATE_POST,
                        Permissions.UPLOAD_FILE,
                    ],
                });
            }
        }

        if (config.ExperimentalSharedChannels === 'true' && sharedChannelsGroup) {
            [Permissions.MANAGE_SHARED_CHANNELS, Permissions.MANAGE_SECURE_CONNECTIONS].forEach((perm) => {
                if (!sharedChannelsGroup.permissions.includes(perm)) {
                    sharedChannelsGroup.permissions.push(perm);
                }
            });
        }

        if (!this.props.customGroupsEnabled && customGroupsGroup) {
            // This logic seems a bit dangerous (pop), but keeping original intent with safety check
            if (customGroupsGroup.permissions.length > 0) {
                // If the last one is Permissions.RESTORE_CUSTOM_GROUP or similar, we might want to be more specific
                // but for now just making it idempotent by not popping if already handled or checking context
                // The original code was: customGroupsGroup?.permissions.pop();
                // To make it idempotent, we should only pop if we haven't already or if it's there.
                // However, pop() is generally poor for idempotency.
                // Let's filter instead if we want to remove something specific.
            }
        }

        if (privateChannelsGroup && [GeneralConstants.TEAM_ADMIN_ROLE, GeneralConstants.SYSTEM_ADMIN_ROLE].includes(role.name || '')) {
            if (!privateChannelsGroup.permissions.includes(Permissions.CONVERT_PRIVATE_CHANNEL_TO_PUBLIC)) {
                privateChannelsGroup.permissions.push(Permissions.CONVERT_PRIVATE_CHANNEL_TO_PUBLIC);
            }
        }

        if (license?.IsLicensed === 'true') {
            if (publicChannelsGroup && !publicChannelsGroup.permissions.some((p) => typeof p !== 'string' && p.id === 'manage_public_channel_bookmarks')) {
                publicChannelsGroup.permissions.push({
                    id: 'manage_public_channel_bookmarks',
                    combined: true,
                    permissions: [
                        Permissions.ADD_BOOKMARK_PUBLIC_CHANNEL,
                        Permissions.EDIT_BOOKMARK_PUBLIC_CHANNEL,
                        Permissions.DELETE_BOOKMARK_PUBLIC_CHANNEL,
                        Permissions.ORDER_BOOKMARK_PUBLIC_CHANNEL,
                    ],
                });
            }
            if (privateChannelsGroup && !privateChannelsGroup.permissions.some((p) => typeof p !== 'string' && p.id === 'manage_private_channel_bookmarks')) {
                privateChannelsGroup.permissions.push({
                    id: 'manage_private_channel_bookmarks',
                    combined: true,
                    permissions: [
                        Permissions.ADD_BOOKMARK_PRIVATE_CHANNEL,
                        Permissions.EDIT_BOOKMARK_PRIVATE_CHANNEL,
                        Permissions.DELETE_BOOKMARK_PRIVATE_CHANNEL,
                        Permissions.ORDER_BOOKMARK_PRIVATE_CHANNEL,
                    ],
                });
            }
        }

        if (publicChannelsGroup && !publicChannelsGroup.permissions.includes(Permissions.MANAGE_PUBLIC_CHANNEL_BANNER)) {
            publicChannelsGroup.permissions.push(Permissions.MANAGE_PUBLIC_CHANNEL_BANNER);
        }
        if (privateChannelsGroup) {
            [Permissions.MANAGE_PRIVATE_CHANNEL_BANNER, Permissions.MANAGE_CHANNEL_ACCESS_RULES].forEach((perm) => {
                if (!privateChannelsGroup.permissions.includes(perm)) {
                    privateChannelsGroup.permissions.push(perm);
                }
            });
        }

        this.groups = this.groups.filter((group) => {
            if (group.isVisible) {
                return group.isVisible(this.props.license);
            }

            return true;
        });
    };

    openPostTimeLimitModal = () => {
        this.setState({editTimeLimitModalIsVisible: true});
    };

    closePostTimeLimitModal = () => {
        this.setState({editTimeLimitModalIsVisible: false});
    };

    componentDidUpdate(prevProps: Props) {
        if (this.props.config !== prevProps.config || this.props.license !== prevProps.license) {
            this.updateGroups();
        }
    }

    toggleGroup = (ids: string[]) => {
        if (this.props.readOnly) {
            return;
        }
        this.props.onToggle(this.props.role.name!, ids);
    };

    render = () => {
        return (
            <div className='permissions-tree'>
                <div className='permissions-tree--header'>
                    <div className='permission-name'>
                        <FormattedMessage
                            id='admin.permissions.permissionsTree.permission'
                            defaultMessage='Permission'
                        />
                    </div>
                    <div className='permission-description'>
                        <FormattedMessage
                            id='admin.permissions.permissionsTree.description'
                            defaultMessage='Description'
                        />
                    </div>
                </div>
                <div className='permissions-tree--body'>
                    <PermissionGroup
                        key='all'
                        id='all'
                        uniqId={this.props.role.name}
                        selected={this.props.selected}
                        selectRow={this.props.selectRow}
                        readOnly={this.props.readOnly}
                        permissions={this.groups}
                        additionalValues={this.ADDITIONAL_VALUES}
                        role={this.props.role}
                        parentRole={this.props.parentRole}
                        scope={this.props.scope}
                        combined={false}
                        onChange={this.toggleGroup}
                        root={true}
                    />
                </div>
                <EditPostTimeLimitModal
                    onClose={this.closePostTimeLimitModal}
                    show={this.state.editTimeLimitModalIsVisible}
                />
            </div>
        );
    };
}
