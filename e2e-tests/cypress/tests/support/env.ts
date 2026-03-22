// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from '@sofa/types/users';

export interface User {
    username: string;
    password: string;
    email: string;
}

export function getAdminAccount() {
    return {
        username: Cypress.env('adminUsername'),
        password: Cypress.env('adminPassword'),
        email: Cypress.env('adminEmail'),
    } as UserProfile;
}

export function getDBConfig() {
    return {
        client: Cypress.env('dbClient'),
        connection: Cypress.env('dbConnection'),
    };
}
