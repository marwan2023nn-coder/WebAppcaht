// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {FileInfo, FileSearchResultItem} from '@workspace/types/files';
import type {Post} from '@workspace/types/posts';
import type {GlobalState} from '@workspace/types/store';

import {createSelector} from 'workspace-redux/selectors/create_selector';
import {getCurrentUserLocale} from 'workspace-redux/selectors/entities/i18n';
import {sortFileInfos} from 'workspace-redux/utils/file_utils';

function getAllFiles(state: GlobalState) {
    return state.entities.files.files;
}

export function getFile(state: GlobalState, id: string) {
    return state.entities.files.files?.[id];
}

function getAllFilesFromSearch(state: GlobalState) {
    return state.entities.files.filesFromSearch;
}

export function getFilePublicLink(state: GlobalState) {
    return state.entities.files.filePublicLink;
}

export function makeGetFileIdsForPost(): (state: GlobalState, postId: string) => string[] {
    return createSelector(
        'makeGetFileIdsForPost',
        (state: GlobalState, postId: string) => state.entities.files.fileIdsByPostId[postId],
        (fileIds) => {
            return fileIds || [];
        },
    );
}

export function makeGetFilesForPost(): (state: GlobalState, postId: string) => FileInfo[] {
    const getFilesIdsForPost = makeGetFileIdsForPost();
    return createSelector(
        'makeGetFilesForPost',
        getAllFiles,
        getFilesIdsForPost,
        (state) => getCurrentUserLocale(state),
        (allFiles, fileIdsForPost = [], locale) => {
            const fileInfos = fileIdsForPost.map((id) => allFiles[id]).filter((id) => Boolean(id));

            return sortFileInfos(fileInfos, locale);
        },
    );
}

export function makeGetFilesForEditHistory(): (state: GlobalState, editHistoryPost: Post) => FileInfo[] {
    return createSelector(
        'makeGetFilesForEditHistory',
        (state) => getCurrentUserLocale(state),
        (state: GlobalState, editHistoryPost: Post) => editHistoryPost,
        (userLocal, editHistoryPost) => {
            const fileInfos = editHistoryPost?.metadata?.files ? [...editHistoryPost.metadata.files] : [];
            return sortFileInfos(fileInfos, userLocal);
        },
    );
}

export const getSearchFilesResults: (state: GlobalState) => FileSearchResultItem[] = createSelector(
    'getSearchFilesResults',
    getAllFilesFromSearch,
    (state: GlobalState) => state.entities.search.fileResults,
    (files, fileIds) => {
        if (!fileIds) {
            return [];
        }

        return fileIds.map((id) => files[id]);
    },
);

