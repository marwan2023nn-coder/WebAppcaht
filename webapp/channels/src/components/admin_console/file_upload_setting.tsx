// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils';

import Setting from './setting';

type Props = {
    id: string;
    label: React.ReactNode;
    helpText?: React.ReactNode;
    uploadingText?: React.ReactNode;
    onSubmit: (id: string, file: File, errorCallback: (error?: string) => void) => void;
    disabled: boolean;
    fileType: string;
    error?: string;
}

const FileUploadSetting = ({
    id,
    label,
    helpText,
    uploadingText,
    onSubmit,
    disabled,
    fileType,
    error,
}: Props) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileSelected, setFileSelected] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleChooseClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleChange = useCallback(() => {
        const files = fileInputRef.current?.files;
        if (files && files.length > 0) {
            setFileSelected(true);
            setFileName(files[0].name);
        }
    }, []);

    const handleSubmit = useCallback((e: React.MouseEvent) => {
        e.preventDefault();

        setUploading(true);
        const file = fileInputRef.current?.files?.[0];
        if (file) {
            onSubmit(id, file, (submitError) => {
                setUploading(false);
                if (submitError && fileInputRef.current) {
                    Utils.clearFileInput(fileInputRef.current);
                }
            });
        }
    }, [id, onSubmit]);

    let serverError;
    if (error) {
        serverError = (
            <div className='form-group has-error'>
                <label className='control-label'>
                    {error}
                </label>
            </div>
        );
    }

    const displayFileName = fileName || (
        <FormattedMessage
            id='admin.file_upload.noFile'
            defaultMessage='No file uploaded'
        />
    );

    return (
        <Setting
            label={label}
            helpText={helpText}
            inputId={id}
        >
            <div>
                <div className='file__upload'>
                    <button
                        type='button'
                        className='btn btn-tertiary'
                        disabled={disabled}
                        onClick={handleChooseClick}
                    >
                        <FormattedMessage
                            id='admin.file_upload.chooseFile'
                            defaultMessage='Choose File'
                        />
                    </button>
                    <input
                        ref={fileInputRef}
                        type='file'
                        disabled={disabled}
                        accept={fileType}
                        onChange={handleChange}
                    />
                </div>
                <button
                    type='button'
                    className='btn btn-primary'
                    disabled={!fileSelected || uploading}
                    onClick={handleSubmit}
                >
                    {uploading ? (
                        <>
                            <span className='glyphicon glyphicon-refresh glyphicon-refresh-animate'/>
                            {uploadingText}
                        </>
                    ) : (
                        <FormattedMessage
                            id='admin.file_upload.uploadFile'
                            defaultMessage='Upload'
                        />
                    )}
                </button>
                <div className='help-text m-0'>
                    {displayFileName}
                </div>
                {serverError}
            </div>
        </Setting>
    );
};

export default React.memo(FileUploadSetting);
