// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {connect} from 'react-redux';

import type {FileInfo} from '@workspace/types/files';
import type {Post} from '@workspace/types/posts';

import {getConfig} from 'workspace-redux/selectors/entities/general';
import {getPost, getPostIdsInChannel} from 'workspace-redux/selectors/entities/posts';

import {getIsMobileView} from 'selectors/views/browser';

import {makeAsyncComponent} from 'components/async_load';

import {FileTypes} from 'utils/constants';
import {canDownloadFiles} from 'utils/file_utils';
import {getFileType} from 'utils/utils';

import type {GlobalState} from 'types/store';

import type {Props} from './file_preview_modal';
import {isFileInfo} from './types';
import type {LinkInfo} from './types';

const FilePreviewModal = makeAsyncComponent('FilePreviewModal', React.lazy<React.ComponentType<Props>>(() => import('./file_preview_modal')));

type OwnProps = {
    post?: Post;
    postId?: string;
    fileInfos?: Array<FileInfo | LinkInfo>;
    startIndex?: number;
    enableChannelNavigation?: boolean;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);

    const basePost = ownProps.post || getPost(state, ownProps.postId || '');
    const enableSVGs = config.EnableSVGs === 'true';

    let expandedFileInfos = ownProps.fileInfos || [];
    let expandedStartIndex = ownProps.startIndex ?? 0;
    let postsById: Record<string, Post | undefined> | undefined;

    if (ownProps.enableChannelNavigation && basePost && Array.isArray(ownProps.fileInfos) && typeof ownProps.startIndex === 'number') {
        const starting = ownProps.fileInfos[ownProps.startIndex];

        if (starting && isFileInfo(starting) && basePost.channel_id) {
            const postIds = getPostIdsInChannel(state, basePost.channel_id);

            if (Array.isArray(postIds) && postIds.length > 0) {
                const filesById = state.entities.files.files;
                const fileIdsByPostId = state.entities.files.fileIdsByPostId;

                const channelFileInfos: FileInfo[] = [];
                for (const postId of postIds) {
                    const fileIds = fileIdsByPostId[postId] || [];
                    for (const fileId of fileIds) {
                        const fileInfo = filesById?.[fileId];
                        if (!fileInfo) {
                            continue;
                        }

                        const type = getFileType(fileInfo.extension);
                        if (type === FileTypes.IMAGE || (enableSVGs && type === FileTypes.SVG)) {
                            channelFileInfos.push(fileInfo);
                        }
                    }
                }

                if (channelFileInfos.length > 0) {
                    expandedFileInfos = channelFileInfos;
                    expandedStartIndex = channelFileInfos.findIndex((f) => f.id === starting.id);
                    if (expandedStartIndex < 0) {
                        expandedStartIndex = 0;
                    }

                    postsById = {};
                    for (const fileInfo of channelFileInfos) {
                        const postId = fileInfo.post_id;
                        if (!postId) {
                            continue;
                        }

                        if (!postsById[postId]) {
                            postsById[postId] = getPost(state, postId);
                        }
                    }
                }
            }
        }
    }

    return {
        canDownloadFiles: canDownloadFiles(config),
        enablePublicLink: config.EnablePublicLink === 'true',
        isMobileView: getIsMobileView(state),
        pluginFilePreviewComponents: state.plugins.components.FilePreview,
        post: basePost,
        postsById,
        fileInfos: expandedFileInfos,
        startIndex: expandedStartIndex,
    };
}

export default connect(mapStateToProps)(FilePreviewModal);
