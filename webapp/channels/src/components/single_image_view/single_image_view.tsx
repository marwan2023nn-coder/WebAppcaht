// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useContext, useState, useEffect, useCallback, useMemo} from 'react';
import type {KeyboardEvent, MouseEvent} from 'react';

import type {FileInfo} from '@workspace/types/files';

import {getFilePreviewUrl, getFileUrl} from 'workspace-redux/utils/file_utils';

import PostContext from 'components/post_view/post_context';
import FilePreviewModal from 'components/file_preview_modal';
import SizeAwareImage from 'components/size_aware_image';

import {FileTypes, ModalIdentifiers} from 'utils/constants';
import {
    getFileType,
} from 'utils/utils';

import type {PropsFromRedux} from './index';

const PREVIEW_IMAGE_MIN_DIMENSION = 50;
const DISPROPORTIONATE_HEIGHT_RATIO = 20;

export interface Props extends PropsFromRedux {
    postId: string;
    fileInfo: FileInfo;
    isRhsOpen: boolean;
    enablePublicLink: boolean;
    compactDisplay?: boolean;
    isEmbedVisible?: boolean;
    isInPermalink?: boolean;
    disableActions?: boolean;
}

export default function SingleImageView(props: Props) {
    const {fileInfo, compactDisplay, isInPermalink, isEmbedVisible, postId, actions, enablePublicLink, disableActions} = props;
    const {overrideGenerateFileUrl, overrideGenerateFilePreviewUrl} = useContext(PostContext);

    const [loaded, setLoaded] = useState(false);
    const [dimensions, setDimensions] = useState({
        width: fileInfo?.width || 0,
        height: fileInfo?.height || 0,
    });

    useEffect(() => {
        setDimensions({
            width: fileInfo?.width || 0,
            height: fileInfo?.height || 0,
        });
    }, [fileInfo?.width, fileInfo?.height]);

    const imageLoaded = useCallback(() => {
        setLoaded(true);
    }, []);

    const handleImageClick = useCallback((e: (KeyboardEvent<HTMLImageElement> | MouseEvent<HTMLDivElement | HTMLImageElement>)) => {
        e.preventDefault();

        actions.openModal({
            modalId: ModalIdentifiers.FILE_PREVIEW_MODAL,
            dialogType: FilePreviewModal,
            dialogProps: {
                fileInfos: [fileInfo],
                postId,
                startIndex: 0,
                enableChannelNavigation: true,
            },
        });
    }, [actions, fileInfo, postId]);

    const toggleEmbedVisibility = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        actions.toggleEmbedVisibility(postId);
    }, [actions, postId]);

    const getFilePublicLink = useCallback(() => {
        return actions.getFilePublicLink(fileInfo.id);
    }, [actions, fileInfo.id]);

    if (fileInfo === undefined) {
        return <></>;
    }

    const {has_preview_image: hasPreviewImage, id} = fileInfo;
    const fileURL = overrideGenerateFileUrl ? overrideGenerateFileUrl(id) : getFileUrl(id);
    const previewURL = hasPreviewImage ? (overrideGenerateFilePreviewUrl ? overrideGenerateFilePreviewUrl(id) : getFilePreviewUrl(id)) : fileURL;

    const previewHeight = fileInfo.height;
    const previewWidth = fileInfo.width;

    const hasDisproportionateHeight = previewHeight / previewWidth > DISPROPORTIONATE_HEIGHT_RATIO;
    let minPreviewClass = '';
    if (
        (previewWidth < PREVIEW_IMAGE_MIN_DIMENSION ||
        previewHeight < PREVIEW_IMAGE_MIN_DIMENSION) && !hasDisproportionateHeight
    ) {
        minPreviewClass = 'min-preview ';

        if (previewHeight > previewWidth) {
            minPreviewClass += 'min-preview--portrait ';
        }
    }

    if (compactDisplay) {
        minPreviewClass += ' compact-display';
    }

    const toggle = (
        <button
            key='toggle'
            className='style--none single-image-view__toggle'
            data-expanded={isEmbedVisible}
            aria-label='Toggle Embed Visibility'
            onClick={toggleEmbedVisibility}
        >
            <span
                className={classNames('icon', {
                    'icon-menu-down': isEmbedVisible,
                    'icon-menu-right': !isEmbedVisible,
                })}
            />
        </button>
    );

    const fileHeader = (
        <div
            className={classNames('image-header', {
                'image-header--expanded': isEmbedVisible,
            })}
        >
            {toggle}
            {!isEmbedVisible && (
                <div
                    data-testid='image-name'
                    className={classNames('image-name', {
                        'compact-display': compactDisplay,
                    })}
                >
                    <div
                        id='image-name-text'
                        onClick={handleImageClick}
                    >
                        {fileInfo.name}
                    </div>
                </div>
            )}
        </div>
    );

    const fileType = getFileType(fileInfo.extension);
    const styleIfSvgWithDimensions = useMemo(() => (fileType === FileTypes.SVG && dimensions.height ? {width: '100%'} : {}), [fileType, dimensions.height]);
    const imageContainerStyle = useMemo(() => (fileType === FileTypes.SVG && !dimensions.height ? {height: 350, maxWidth: '100%'} : {}), [fileType, dimensions.height]);
    const svgClass = fileType === FileTypes.SVG ? 'svg' : '';
    const fadeInClass = loaded ? 'image-fade-in' : '';
    const permalinkClass = isInPermalink ? 'image-permalink' : '';

    return (
        <div className={classNames('file-view--single', permalinkClass)}>
            <div className='file__image'>
                {fileHeader}
                {isEmbedVisible && (
                    <div
                        className={classNames('image-container', permalinkClass)}
                        style={imageContainerStyle}
                    >
                        <div
                            className={classNames('image-loaded', fadeInClass, svgClass)}
                            style={styleIfSvgWithDimensions}
                        >
                            <div className={classNames(permalinkClass)}>
                                <SizeAwareImage
                                    onClick={handleImageClick}
                                    className={classNames(minPreviewClass, permalinkClass)}
                                    src={previewURL}
                                    dimensions={dimensions}
                                    fileInfo={fileInfo}
                                    fileURL={fileURL}
                                    onImageLoaded={imageLoaded}
                                    showLoader={isEmbedVisible}
                                    handleSmallImageContainer={true}
                                    enablePublicLink={enablePublicLink}
                                    getFilePublicLink={getFilePublicLink}
                                    hideUtilities={disableActions}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
