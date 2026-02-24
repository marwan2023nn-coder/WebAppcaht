// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ContentFlaggingConfig} from '@workspace/types/content_flagging';
import type {NameMappedPropertyFields, PropertyValue} from '@workspace/types/properties';

import {TeamTypes, ContentFlaggingTypes} from 'workspace-redux/action_types';
import {logError} from 'workspace-redux/actions/errors';
import {forceLogoutIfNecessary} from 'workspace-redux/actions/helpers';
import {Client4} from 'workspace-redux/client';
import type {ActionFuncAsync} from 'workspace-redux/types/actions';
import {DelayedDataLoader} from 'workspace-redux/utils/data_loader';

export function getTeamContentFlaggingStatus(teamId: string): ActionFuncAsync<{enabled: boolean}> {
    return async (dispatch, getState) => {
        let response;

        try {
            response = await Client4.getTeamContentFlaggingStatus(teamId);

            dispatch({
                type: TeamTypes.RECEIVED_CONTENT_FLAGGING_STATUS,
                data: {
                    teamId,
                    status: response.enabled,
                },
            });
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        return {data: response};
    };
}

export function getContentFlaggingConfig(teamId?: string): ActionFuncAsync<ContentFlaggingConfig> {
    return async (dispatch, getState) => {
        let response;

        try {
            response = await Client4.getContentFlaggingConfig(teamId);

            dispatch({
                type: ContentFlaggingTypes.RECEIVED_CONTENT_FLAGGING_CONFIG,
                data: response,
            });
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        return {data: response};
    };
}

export function getPostContentFlaggingFields(): ActionFuncAsync<NameMappedPropertyFields> {
    return async (dispatch, getState) => {
        let data;
        try {
            data = await Client4.getPostContentFlaggingFields();
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        dispatch({
            type: ContentFlaggingTypes.RECEIVED_POST_CONTENT_FLAGGING_FIELDS,
            data,
        });

        return {data};
    };
}

export function loadPostContentFlaggingFields(): ActionFuncAsync<NameMappedPropertyFields> {
    // Use data loader and fetch data to manage multiple, simultaneous dispatches
    return async (dispatch, getState, {loaders}: any) => {
        if (!loaders.postContentFlaggingFieldsLoader) {
            loaders.postContentFlaggingFieldsLoader = new DelayedDataLoader<NameMappedPropertyFields>({
                fetchBatch: () => dispatch(getPostContentFlaggingFields()),
                maxBatchSize: 1,
                wait: 200,
            });
        }

        const loader = loaders.postContentFlaggingFieldsLoader;
        loader.queue([true]);

        return {};
    };
}

export function getPostContentFlaggingValues(postId: string): ActionFuncAsync<Array<PropertyValue<unknown>>> {
    return async (dispatch, getState) => {
        let response;

        try {
            response = await Client4.getPostContentFlaggingValues(postId);

            dispatch({
                type: ContentFlaggingTypes.RECEIVED_POST_CONTENT_FLAGGING_VALUES,
                data: {
                    postId,
                    values: response,
                },
            });
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        return {data: response};
    };
}
