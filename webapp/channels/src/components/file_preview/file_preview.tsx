// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {ReactNode} from 'react';

import type {FileInfo} from '@workspace/types/files';

import {getFileThumbnailUrl, getFileUrl} from 'workspace-redux/utils/file_utils';

import MediaEditor from 'components/custom_status/media_editor';
import FilenameOverlay from 'components/file_attachment/filename_overlay';
import FilePreviewModal from 'components/file_preview_modal';
import RootPortal from 'components/root_portal';

import Constants, {FileTypes, ModalIdentifiers} from 'utils/constants';
import * as Utils from 'utils/utils';

import type {ModalData} from 'types/actions';

import FileProgressPreview from './file_progress_preview';

type UploadInfo = {
    name: string;
    percent?: number;
    type?: string;
}
export type FilePreviewInfo = FileInfo & UploadInfo;

type Props = {
    enableSVGs: boolean;
    onRemove?: (id: string) => void;
    onFileUpload?: (files: File[]) => void;
    onReplaceFile?: (originalId: string, newFile: File) => void;
    fileInfos: FilePreviewInfo[];
    uploadsInProgress?: string[];
    uploadsProgressPercent?: {[clientID: string]: FilePreviewInfo};
    actions?: {
        openModal: <P>(modalData: ModalData<P>) => void;
    };
}

type State = {
    isMediaEditMode: boolean;
    selectedFile: File | null;
    selectedOriginalId: string | null;
}

export default class FilePreview extends React.PureComponent<Props, State> {
    static defaultProps = {
        fileInfos: [],
        uploadsInProgress: [],
        uploadsProgressPercent: {},
    };

    imageEditorRef = React.createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            isMediaEditMode: false,
            selectedFile: null,
            selectedOriginalId: null,
        };
    }

    handleRemove = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        this.props.onRemove?.(id);
    };

    handleShowModalPreview = (fileInfo: FileInfo) => {
        const startIndex = this.props.fileInfos.findIndex((f) => f.id === fileInfo.id);
        const safeStartIndex = startIndex >= 0 ? startIndex : 0;

        this.props.actions?.openModal?.({
            modalId: ModalIdentifiers.FILE_PREVIEW_MODAL,
            dialogType: FilePreviewModal,
            dialogProps: {
                fileInfos: this.props.fileInfos,
                postId: fileInfo.post_id,
                startIndex: safeStartIndex,
            },
        });
    };

    convertSvgToPng = (svgBlob: Blob, fileName: string): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                canvas.width = img.width || 800;
                canvas.height = img.height || 600;

                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const pngFile = new File([blob], fileName.replace('.svg', '.png'), {
                                type: 'image/png',
                                lastModified: Date.now(),
                            });
                            resolve(pngFile);
                        } else {
                            reject(new Error('failed to convert svg to png'));
                        }
                    }, 'image/png');
                }
            };

            img.src = URL.createObjectURL(svgBlob);
        });
    };

    handleShowImagePreview = async (fileInfo: FilePreviewInfo) => {
        try {
            const fileUrl = getFileUrl(fileInfo.id);
            const response = await fetch(fileUrl);
            const blob = await response.blob();

            let finalFile: File;

            if (fileInfo.extension === 'svg') {
                finalFile = await this.convertSvgToPng(blob, fileInfo.name);
            } else {
                let mimeType = blob.type || fileInfo.mime_type || 'application/octet-stream';
                const ext = (fileInfo.extension || '').toLowerCase();
                if (ext === 'png') {
                    mimeType = 'image/png';
                } else if (ext === 'jpg' || ext === 'jpeg') {
                    mimeType = 'image/jpeg';
                } else if (ext === 'gif') {
                    mimeType = 'image/gif';
                }
                finalFile = new File([blob], fileInfo.name, {
                    type: mimeType,
                    lastModified: fileInfo.create_at,
                });
            }

            this.setState({
                selectedFile: finalFile,
                selectedOriginalId: fileInfo.clientId || fileInfo.id,
                isMediaEditMode: true,
            });
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('FilePreview.handleShowImagePreview', err);
        }
    };

    uploadEditedFile = async (editedFile: File, originalFileId: string) => {
        const editedFileName = editedFile.name.replace(/(\.[^.]+)$/, '_edited$1');
        const renamedFile = new File([editedFile], editedFileName, {
            type: editedFile.type,
            lastModified: Date.now(),
        });

        if (this.props.onReplaceFile) {
            this.props.onReplaceFile(originalFileId, renamedFile);
            return;
        }

        this.props.onRemove?.(originalFileId);
        this.props.onFileUpload?.([renamedFile]);
    };

    handleMediaEditorSave = async (editedFile?: File) => {
        const originalFileId = this.state.selectedOriginalId;
        if (editedFile && originalFileId) {
            try {
                await this.uploadEditedFile(editedFile, originalFileId);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('FilePreview.handleMediaEditorSave', error);
            }
        }

        this.setState({
            isMediaEditMode: false,
            selectedFile: null,
            selectedOriginalId: null,
        });
    };

    handleMediaEditorClose = () => {
        this.setState({
            isMediaEditMode: false,
            selectedFile: null,
            selectedOriginalId: null,
        });
    };

    render() {
        const previews: ReactNode[] = [];
        const uploadsInProgressSet = new Set(this.props.uploadsInProgress || []);

        this.props.fileInfos.forEach((info) => {
            // When replacing an already-uploaded file, the replacement upload reuses the original file id
            // as the upload client id. While that upload is in progress, hide the old preview so the
            // UI doesn't show both the old and the replacement at the same time.
            if (uploadsInProgressSet.has(info.id)) {
                return;
            }

            const type = Utils.getFileType(info.extension);

            let className = 'file-preview post-image__column';
            let previewImage;
            if (type === FileTypes.SVG && this.props.enableSVGs) {
                previewImage = (
                    <img
                        alt={'file preview'}
                        className='post-image normal'
                        src={getFileUrl(info.id)}
                    />
                );
            } else if (type === FileTypes.IMAGE) {
                let imageClassName = 'post-image';

                if ((info.width && info.width < Constants.THUMBNAIL_WIDTH) && (info.height && info.height < Constants.THUMBNAIL_HEIGHT)) {
                    imageClassName += ' small';
                } else {
                    imageClassName += ' normal';
                }

                let thumbnailUrl = getFileThumbnailUrl(info.id);
                if (Utils.isGIFImage(info.extension) && !info.has_preview_image) {
                    thumbnailUrl = getFileUrl(info.id);
                }

                previewImage = (
                    <div
                        className={imageClassName}
                        style={{
                            backgroundImage: `url(${thumbnailUrl})`,
                            backgroundSize: 'cover',
                        }}
                    />
                );
            } else {
                className += ' custom-file';
                previewImage = <div className={'file-icon ' + Utils.getIconClassName(type)}/>;
            }

            previews.push(
                <div
                    key={`file_preview_${info.id}`}
                    className={className}
                    onClick={() => {
                        if (type === FileTypes.IMAGE || (type === FileTypes.SVG && this.props.enableSVGs)) {
                            this.handleShowImagePreview(info);
                        } else if (type === FileTypes.VIDEO || type === FileTypes.AUDIO) {
                            this.handleShowModalPreview(info);
                        }
                    }}
                >
                    <div className='post-image__thumbnail'>
                        {previewImage}
                    </div>
                    <div className='post-image__details'>
                        <div className='post-image__detail_wrapper'>
                            <div className='post-image__detail'>
                                <FilenameOverlay
                                    fileInfo={info}
                                    compactDisplay={false}
                                    canDownload={false}
                                />
                                {info.extension && <span className='post-image__type'>{info.extension.toUpperCase()}</span>}
                                <span className='post-image__size'>{Utils.fileSizeToString(info.size)}</span>
                            </div>
                        </div>
                        <div>
                            {Boolean(this.props.onRemove) && (
                                <a
                                    className='file-preview__remove'
                                    onClick={(e) => this.handleRemove(info.id, e)}
                                >
                                    <i className='icon icon-close'/>
                                </a>
                            )}
                        </div>
                    </div>
                </div>,
            );
        });

        if (this.props.uploadsInProgress && this.props.uploadsProgressPercent) {
            const uploadsProgressPercent = this.props.uploadsProgressPercent;
            this.props.uploadsInProgress.forEach((clientId) => {
                const fileInfo = uploadsProgressPercent[clientId];
                if (fileInfo) {
                    previews.push(
                        <FileProgressPreview
                            key={`file_upload_${clientId}`}
                            clientId={clientId}
                            fileInfo={fileInfo}
                            handleRemove={this.handleRemove}
                        />,
                    );
                }
            });
        }

        return (
            <>
                <div className='file-preview__container'>
                    {previews}
                </div>

                {this.state.isMediaEditMode && this.state.selectedFile && (
                    <RootPortal>
                        <MediaEditor
                            ref={this.imageEditorRef}
                            file={this.state.selectedFile}
                            onSave={this.handleMediaEditorSave}
                            onCancel={this.handleMediaEditorClose}
                        />
                    </RootPortal>
                )}
            </>
        );
    }
}
