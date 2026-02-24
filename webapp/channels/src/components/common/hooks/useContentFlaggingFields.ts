// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ContentFlaggingConfig} from '@workspace/types/content_flagging';
import type {NameMappedPropertyFields, PropertyValue} from '@workspace/types/properties';

import {
    getContentFlaggingConfig,
    getPostContentFlaggingValues,
    loadPostContentFlaggingFields,
} from 'workspace-redux/actions/content_flagging';
import {
    contentFlaggingConfig,
    contentFlaggingFields,
    postContentFlaggingValues,
} from 'workspace-redux/selectors/entities/content_flagging';

import {makeUseEntity} from 'components/common/hooks/useEntity';

export const useContentFlaggingFields = makeUseEntity<NameMappedPropertyFields | undefined>({
    name: 'useContentFlaggingFields',
    fetch: loadPostContentFlaggingFields,
    selector: contentFlaggingFields,
});

export const usePostContentFlaggingValues = makeUseEntity<Array<PropertyValue<unknown>>>({
    name: 'usePostContentFlaggingValues',
    fetch: getPostContentFlaggingValues,
    selector: postContentFlaggingValues,
});

export const useContentFlaggingConfig = makeUseEntity<ContentFlaggingConfig>({
    name: 'useContentFlaggingConfig',
    fetch: getContentFlaggingConfig,
    selector: contentFlaggingConfig,
});
