// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import type {ServerError} from '@workspace/types/errors';
import type {FileInfo} from '@workspace/types/files';

import {sortFileInfos} from 'workspace-redux/utils/file_utils';

import {getCurrentLocale} from 'selectors/i18n';

import FilePreview from 'components/file_preview';
import type {FilePreviewInfo} from 'components/file_preview/file_preview';
import FileUpload from 'components/file_upload';
import type {FileUpload as FileUploadClass, TextEditorLocationType} from 'components/file_upload/file_upload';
import type TextboxClass from 'components/textbox/textbox';

import type {PostDraft} from 'types/store/draft';

const getFileCount = (draft: PostDraft) => {
    return draft.fileInfos.length + draft.uploadsInProgress.length;
};

const useUploadFiles = (
    draft: PostDraft,
    postId: string,
    channelId: string,
    isThreadView: boolean,
    storedDrafts: React.MutableRefObject<Record<string, PostDraft | undefined>>,
    isDisabled: boolean,
    textboxRef: React.RefObject<TextboxClass>,
    handleDraftChange: (draft: PostDraft, options?: {instant?: boolean; show?: boolean}) => void,
    focusTextbox: (forceFocust?: boolean) => void,
    setServerError: (err: (ServerError & { submittedMessage?: string }) | null) => void,
    isPostBeingEdited?: boolean,
): [React.ReactNode, React.ReactNode] => {
    const locale = useSelector(getCurrentLocale);

    const [uploadsProgressPercent, setUploadsProgressPercent] = useState<{ [clientID: string]: FilePreviewInfo }>({});

    const fileUploadRef = useRef<FileUploadClass>(null);

    const handleFileUploadChange = useCallback(() => {
        focusTextbox();
    }, [focusTextbox]);

    const getFileUploadTarget = useCallback(() => {
        return textboxRef.current?.getInputBox();
    }, [textboxRef]);

    const handleUploadProgress = useCallback((filePreviewInfo: FilePreviewInfo) => {
        setUploadsProgressPercent((prev) => ({
            ...prev,
            [filePreviewInfo.clientId]: filePreviewInfo,
        }));
    }, []);

    const handleFileUploadComplete = useCallback((fileInfos: FileInfo[], clientIds: string[], channelId: string, rootId?: string) => {
        const key = rootId || channelId;
        const draftToUpdate = storedDrafts.current[key];
        if (!draftToUpdate) {
            return;
        }

        const clientIdsSet = new Set(clientIds);
        // If this upload is a replacement, we reuse the same clientId as the original preview id.
        // Filter out any existing fileInfos that share the same id so we don't end up with duplicates.
        const existingFileInfos = (draftToUpdate.fileInfos || []).filter((info) => {
            const infoClientId = (info as any).clientId;
            return !clientIdsSet.has(infoClientId || info.id);
        });
        const newFileInfos = sortFileInfos([...existingFileInfos, ...fileInfos], locale);

        const uploadsInProgress = (draftToUpdate.uploadsInProgress || []).filter((v) => !clientIdsSet.has(v));

        const modifiedDraft = {
            ...draftToUpdate,
            fileInfos: newFileInfos,
            uploadsInProgress,
        };

        handleDraftChange(modifiedDraft, {instant: true});
    }, [locale, handleDraftChange, storedDrafts]);

    const handleUploadStart = useCallback((clientIds: string[]) => {
        const uploadsInProgress = [...draft.uploadsInProgress, ...clientIds];

        const updatedDraft = {
            ...draft,
            uploadsInProgress,
        };

        handleDraftChange(updatedDraft, {instant: true});

        focusTextbox();
    }, [draft, handleDraftChange, focusTextbox]);

    const handleUploadError = useCallback((uploadError: string | ServerError | null, clientId?: string, channelId = '', rootId = '') => {
        if (clientId) {
            const id = rootId || channelId;
            const storedDraft = storedDrafts.current[id];
            if (storedDraft) {
                const modifiedDraft = {...storedDraft};
                const index = modifiedDraft.uploadsInProgress.indexOf(clientId) ?? -1;
                if (index !== -1) {
                    modifiedDraft.uploadsInProgress = [...modifiedDraft.uploadsInProgress];
                    modifiedDraft.uploadsInProgress.splice(index, 1);
                    handleDraftChange(modifiedDraft, {instant: true});
                }
            }
        }

        if (typeof uploadError === 'string') {
            if (uploadError) {
                setServerError(new Error(uploadError));
            }
        } else {
            setServerError(uploadError);
        }
    }, [handleDraftChange, setServerError, storedDrafts]);

    const removePreview = useCallback((clientId: string) => {
        handleUploadError(null, clientId, draft.channelId, draft.rootId);

        const modifiedDraft = {...draft};
        let index = draft.fileInfos.findIndex((info) => (info as any).clientId === clientId || info.id === clientId);
        if (index === -1) {
            index = draft.uploadsInProgress.indexOf(clientId);

            if (index >= 0) {
                modifiedDraft.uploadsInProgress = [...draft.uploadsInProgress];
                modifiedDraft.uploadsInProgress.splice(index, 1);

                fileUploadRef.current?.cancelUpload(clientId);
            } else {
                // No modification
                return;
            }
        } else {
            modifiedDraft.fileInfos = [...draft.fileInfos];
            modifiedDraft.fileInfos.splice(index, 1);
        }

        handleDraftChange(modifiedDraft, {instant: true});
        handleFileUploadChange();
    }, [draft, fileUploadRef, handleDraftChange, handleUploadError, handleFileUploadChange]);

    const replacePreview = useCallback((originalId: string, newFile: File) => {
        // If the original is still uploading (clientId-based preview), cancel/remove that upload first.
        // If it's already uploaded (fileId-based preview), keep it until the replacement upload completes,
        // then handleFileUploadComplete will replace it by filtering out the originalId.
        if (draft.uploadsInProgress.includes(originalId)) {
            removePreview(originalId);
        }

        // Upload the replacement file through the same upload pipeline using the same clientId
        fileUploadRef.current?.checkPluginHooksAndUploadFilesWithClientIds([newFile], [originalId]);
    }, [draft.uploadsInProgress, removePreview]);

    let attachmentPreview = null;
    if (!isDisabled && (draft.fileInfos.length > 0 || draft.uploadsInProgress.length > 0)) {
        attachmentPreview = (
            <FilePreview
                fileInfos={draft.fileInfos}
                onRemove={removePreview}
                onReplaceFile={replacePreview}
                uploadsInProgress={draft.uploadsInProgress}
                uploadsProgressPercent={uploadsProgressPercent}
            />
        );
    }

    let postType: TextEditorLocationType = 'post';
    if (isPostBeingEdited) {
        postType = 'edit_post';
    } else if (postId) {
        postType = isThreadView ? 'thread' : 'comment';
    }

    const fileUploadJSX = isDisabled ? null : (
        <FileUpload
            ref={fileUploadRef}
            fileCount={getFileCount(draft)}
            getTarget={getFileUploadTarget}
            onFileUploadChange={handleFileUploadChange}
            onUploadStart={handleUploadStart}
            onFileUpload={handleFileUploadComplete}
            onUploadError={handleUploadError}
            onUploadProgress={handleUploadProgress}
            rootId={postId}
            channelId={channelId}
            postType={postType}
        />
    );

    return [attachmentPreview, fileUploadJSX];
};

export default useUploadFiles;
