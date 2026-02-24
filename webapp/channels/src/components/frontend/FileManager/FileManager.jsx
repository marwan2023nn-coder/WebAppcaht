// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';

import Actions from './Actions/Actions';
import BreadCrumb from './BreadCrumb/BreadCrumb';
import FileList from './FileList/FileList';
import NavigationPane from './NavigationPane/NavigationPane';
import Toolbar from './Toolbar/Toolbar';

import Loader from '../components/Loader/Loader';
import {ClipBoardProvider} from '../contexts/ClipboardContext';
import {FileNavigationProvider} from '../contexts/FileNavigationContext';
import {FilesProvider} from '../contexts/FilesContext';
import {LayoutProvider} from '../contexts/LayoutContext';
import {SelectionProvider} from '../contexts/SelectionContext';
import {useColumnResize} from '../hooks/useColumnResize';
import {useTriggerAction} from '../hooks/useTriggerAction';
import {dateStringValidator, urlValidator} from '../validators/propValidators';
import './FileManager.scss';

const FileManager = ({
    files,
    fileUploadConfig,
    isLoading,
    onCreateFolder,
    onFileUploading,
    onFileUploaded,
    onPaste,
    onRename,
    onDownload,
    onDelete = () => null,
    onLayoutChange,
    onRefresh,
    onFileOpen,
    onError,
    layout = 'grid',
    enableFilePreview = false,
    maxFileSize,
    filePreviewPath,
    acceptedFileTypes,
    height = '600px',
    width = '100%',
}) => {
    const triggerAction = useTriggerAction();
    const {containerRef, colSizes, isDragging, handleMouseMove, handleMouseUp, handleMouseDown} =
    useColumnResize(20, 80);

    return (
        // eslint-disable-next-line react/react-in-jsx-scope
        <main
            className='file-explorer'
            onContextMenu={(e) => e.preventDefault()}
        >
            <Loader isLoading={isLoading}/>
            <FilesProvider
                filesData={files}
                onError={onError}
            >
                <FileNavigationProvider>
                    <SelectionProvider onDownload={onDownload}>
                        <ClipBoardProvider onPaste={onPaste}>
                            <LayoutProvider layout={layout}>
                                <Toolbar
                                    allowCreateFolder={true}
                                    allowUploadFile={true}
                                    onLayoutChange={onLayoutChange}
                                    onRefresh={onRefresh}
                                    triggerAction={triggerAction}
                                />
                                <section
                                    ref={containerRef}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    className='files-container'
                                >
                                    <div
                                        className='navigation-pane'

                                        // style={{width: colSizes.col1 + '%'}}
                                    >
                                        <NavigationPane/>
                                        <div
                                            className={`sidebar-resize ${isDragging ? 'sidebar-dragging' : ''}`}
                                            onMouseDown={handleMouseDown}
                                        />
                                    </div>

                                    <div
                                        className='folders-preview'
                                        style={{width: colSizes.col2 + '%'}}
                                    >
                                        <BreadCrumb/>
                                        <FileList
                                            onCreateFolder={onCreateFolder}
                                            onRename={onRename}
                                            onFileOpen={onFileOpen}
                                            enableFilePreview={enableFilePreview}
                                            triggerAction={triggerAction}
                                        />
                                    </div>
                                </section>

                                <Actions
                                    fileUploadConfig={fileUploadConfig}
                                    onFileUploading={onFileUploading}
                                    onFileUploaded={onFileUploaded}
                                    onDelete={onDelete}
                                    onRefresh={onRefresh}
                                    maxFileSize={maxFileSize}
                                    filePreviewPath={filePreviewPath}
                                    acceptedFileTypes={acceptedFileTypes}
                                    triggerAction={triggerAction}
                                />
                            </LayoutProvider>
                        </ClipBoardProvider>
                    </SelectionProvider>
                </FileNavigationProvider>
            </FilesProvider>
        </main>
    );
};

FileManager.displayName = 'FileManager';

FileManager.propTypes = {
    files: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            isDirectory: PropTypes.bool.isRequired,
            path: PropTypes.string.isRequired,
            updatedAt: dateStringValidator,
            size: PropTypes.number,
        }),
    ).isRequired,
    fileUploadConfig: PropTypes.shape({
        url: urlValidator,
        headers: PropTypes.objectOf(PropTypes.string),
    }),
    isLoading: PropTypes.bool,
    onCreateFolder: PropTypes.func,
    onFileUploading: PropTypes.func,
    onFileUploaded: PropTypes.func,
    onRename: PropTypes.func,
    onDelete: PropTypes.func,
    onPaste: PropTypes.func,
    onDownload: PropTypes.func,
    onLayoutChange: PropTypes.func,
    onRefresh: PropTypes.func,
    onFileOpen: PropTypes.func,
    onError: PropTypes.func,
    layout: PropTypes.oneOf(['grid', 'list']),
    maxFileSize: PropTypes.number,
    enableFilePreview: PropTypes.bool,
    filePreviewPath: urlValidator,
    acceptedFileTypes: PropTypes.string,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default FileManager;
