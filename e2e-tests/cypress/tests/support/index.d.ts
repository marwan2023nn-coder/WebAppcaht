// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/// <reference types="cypress" />

declare namespace Cypress {
    type AdminConfig = import('@sofa/types/config').AdminConfig;
    type AnalyticsRow = import('@sofa/types/admin').AnalyticsRow;
    type Bot = import('@sofa/types/bots').Bot;
    type BotPatch = import('@sofa/types/bots').BotPatch;
    type Channel = import('@sofa/types/channels').Channel;
    type ClusterInfo = import('@sofa/types/admin').ClusterInfo;
    type Client = import('./client-impl').E2EClient;
    type ClientLicense = import('@sofa/types/config').ClientLicense;
    type ChannelMembership = import('@sofa/types/channels').ChannelMembership;
    type ChannelType = import('@sofa/types/channels').ChannelType;
    type IncomingWebhook = import('@sofa/types/integrations').IncomingWebhook;
    type OutgoingWebhook = import('@sofa/types/integrations').OutgoingWebhook;
    type Permissions = string[];
    type PluginManifest = import('@sofa/types/plugins').PluginManifest;
    type PluginsResponse = import('@sofa/types/plugins').PluginsResponse;
    type PreferenceType = import('@sofa/types/preferences').PreferenceType;
    type Product = import('@sofa/types/cloud').Product;
    type Role = import('@sofa/types/roles').Role;
    type Scheme = import('@sofa/types/schemes').Scheme;
    type Session = import('@sofa/types/sessions').Session;
    type Subscription = import('@sofa/types/cloud').Subscription;
    type Team = import('@sofa/types/teams').Team;
    type TeamMembership = import('@sofa/types/teams').TeamMembership;
    type TermsOfService = import('@sofa/types/terms_of_service').TermsOfService;
    type UserProfile = import('@sofa/types/users').UserProfile;
    type UserStatus = import('@sofa/types/users').UserStatus;
    type UserCustomStatus = import('@sofa/types/users').UserCustomStatus;
    type UserAccessToken = import('@sofa/types/users').UserAccessToken;
    type DeepPartial = import('@sofa/types/utilities').DeepPartial;
    type Group = import('@sofa/types/groups').Group;
    interface Chainable {
        tab: (options?: {shift?: boolean}) => Chainable<JQuery>;
    }
}
