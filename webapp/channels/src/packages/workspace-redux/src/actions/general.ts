// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {LogLevel} from '@workspace/types/client4';
import type {ClientConfig} from '@workspace/types/config';
import type {SystemSetting} from '@workspace/types/general';

import {AppsTypes, GeneralTypes} from 'workspace-redux/action_types';
import {Client4} from 'workspace-redux/client';
import type {ActionFuncAsync} from 'workspace-redux/types/actions';

import {logError} from './errors';
import {bindClientFunc, forceLogoutIfNecessary} from './helpers';
import {loadRolesIfNeeded} from './roles';

export function getClientConfig(): ActionFuncAsync<ClientConfig> {
    return async (dispatch, getState) => {
        let data;
        try {
            data = await Client4.getClientConfig();
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            return {error};
        }

        Client4.setEnableLogging(data.EnableDeveloper === 'true');
        Client4.setDiagnosticId(data.DiagnosticId);

        const type = data.AppsPluginEnabled === 'true' ? AppsTypes.APPS_PLUGIN_ENABLED : AppsTypes.APPS_PLUGIN_DISABLED;
        const actions = [{type: GeneralTypes.CLIENT_CONFIG_RECEIVED, data}, {type}];
        dispatch(batchActions(actions));

        return {data};
    };
}

export function getLicenseConfig() {
    return bindClientFunc({
        clientFunc: Client4.getClientLicenseOld,
        onSuccess: [GeneralTypes.CLIENT_LICENSE_RECEIVED],
    });
}

export function getCustomProfileAttributeFields() {
    return bindClientFunc({
        clientFunc: Client4.getCustomProfileAttributeFields,
        onSuccess: [GeneralTypes.CUSTOM_PROFILE_ATTRIBUTE_FIELDS_RECEIVED],
    });
}

export function logClientError(message: string, level = LogLevel.Error) {
    return bindClientFunc({
        clientFunc: Client4.logClientError,
        onRequest: GeneralTypes.LOG_CLIENT_ERROR_REQUEST,
        onSuccess: GeneralTypes.LOG_CLIENT_ERROR_SUCCESS,
        onFailure: GeneralTypes.LOG_CLIENT_ERROR_FAILURE,
        params: [
            message,
            level,
        ],
    });
}

export function setServerVersion(serverVersion: string): ActionFuncAsync {
    return async (dispatch) => {
        dispatch({type: GeneralTypes.RECEIVED_SERVER_VERSION, data: serverVersion});
        dispatch(loadRolesIfNeeded([]));

        return {data: true};
    };
}

export function setUrl(url: string) {
    Client4.setUrl(url);
    return true;
}

export function setFirstAdminVisitMarketplaceStatus(): ActionFuncAsync {
    return async (dispatch) => {
        try {
            await Client4.setFirstAdminVisitMarketplaceStatus();
        } catch (e) {
            dispatch(logError(e));
            return {error: e.message};
        }
        dispatch({type: GeneralTypes.FIRST_ADMIN_VISIT_MARKETPLACE_STATUS_RECEIVED, data: true});
        return {data: true};
    };
}

// accompanying "set" happens as part of Client4.completeSetup
export function getFirstAdminSetupComplete(): ActionFuncAsync<SystemSetting> {
    return async (dispatch, getState) => {
        let data;
        try {
            data = await Client4.getFirstAdminSetupComplete();
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            return {error};
        }

        data = JSON.parse(data.value);
        dispatch({type: GeneralTypes.FIRST_ADMIN_COMPLETE_SETUP_RECEIVED, data});
        return {data};
    };
}

export function checkCWSAvailability(): ActionFuncAsync {
    return async (dispatch, getState) => {
        const state = getState();
        const config = state.entities.general.config;
        const isEnterpriseReady = config.BuildEnterpriseReady === 'true';

        if (!isEnterpriseReady) {
            dispatch({type: GeneralTypes.CWS_AVAILABILITY_CHECK_SUCCESS, data: 'not_applicable'});
            return {data: 'not_applicable'};
        }

        dispatch({type: GeneralTypes.CWS_AVAILABILITY_CHECK_REQUEST});

        const cwsUrl = (config.CWSURL || '').trim();
        const isCwsMock = config.CWSMock === 'true';

        if (isCwsMock || cwsUrl) {
            dispatch({type: GeneralTypes.CWS_AVAILABILITY_CHECK_SUCCESS, data: 'available'});
            return {data: 'available'};
        }

        dispatch({type: GeneralTypes.CWS_AVAILABILITY_CHECK_FAILURE});
        return {data: 'unavailable'};
    };
}

export default {
    getClientConfig,
    getLicenseConfig,
    getCustomProfileAttributeFields,
    logClientError,
    setServerVersion,
    setUrl,
};
