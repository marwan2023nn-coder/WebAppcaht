// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

interface PostContextValue {
    handlePopupOpened: ((opened: boolean) => void) | null;
    overrideGenerateFileUrl?: (fileId: string) => string;
    overrideGenerateFileThumbnailUrl?: (fileId: string) => string;
    overrideGenerateFilePreviewUrl?: (fileId: string) => string;
    overrideGenerateFileDownloadUrl?: (fileId: string) => string;
}
const PostContext = React.createContext<PostContextValue>({

    // Post component event handler that should be
    // called when any child component opens/closes a
    // popup type component.
    handlePopupOpened: null,
});

export default PostContext;
