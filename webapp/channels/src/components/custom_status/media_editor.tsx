// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {forwardRef} from 'react';
import type {Ref} from 'react';

import StatusImageEditor from './status_image_editor';

// import StatusVideoEditor from './status_video_editor';

import './media_editor.scss';

type Props = {
    ref: Ref<HTMLDivElement>;
    file: File;
    onSave: (file?: File) => void;
    onCancel: () => void;
}

const MediaEditor = forwardRef<HTMLDivElement, Props>(({file, onSave, onCancel}, ref) => {
    return (
        <div
            id='media-editor'
            className='pt-10 pb-10'
        >
            <StatusImageEditor
                ref={ref}
                file={file}
                onSave={onSave}
                onCancel={onCancel}
            />

        </div>
    );
});

export default MediaEditor;
