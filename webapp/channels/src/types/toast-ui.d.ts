// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

declare module '@toast-ui/react-image-editor' {
    import {Component} from 'react';

    interface ImageEditorProps {
        includeUI?: {
            loadImage?: {
                path: string;
                name: string;
            };
            locale?: Record<string, string>;
            theme?: Record<string, string>;
            menu?: string[];
            initMenu?: string;
            uiSize?: {
                width: string;
                height: string;
            };
            menuBarPosition?: string;
        };
        cssMaxHeight?: number;
        cssMaxWidth?: number;
        selectionStyle?: {
            cornerSize?: number;
            rotatingPointOffset?: number;
        };
        usageStatistics?: boolean;
        onObjectActivated?: (props: any) => void;
        onObjectAdded?: (props: any) => void;
        onObjectMoved?: (props: any) => void;
        onObjectScaled?: (props: any) => void;
        onRedoStackChanged?: (length: number) => void;
        onUndoStackChanged?: (length: number) => void;
        onSelectionCleared?: () => void;
        onSelectionCreated?: () => void;
    }

    class ImageEditor extends Component<ImageEditorProps> {
        getInstance(): any;
        getRootElement(): HTMLElement;
    }

    export default ImageEditor;
}

declare module 'tui-image-editor/dist/tui-image-editor.css';
