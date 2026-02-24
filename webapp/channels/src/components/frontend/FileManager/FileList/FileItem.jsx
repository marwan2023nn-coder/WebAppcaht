// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {FaRegFile, FaRegFolderOpen} from 'react-icons/fa6';

import Checkbox from '../../components/Checkbox/Checkbox';
import {useClipBoard} from '../../contexts/ClipboardContext';
import {useFileNavigation} from '../../contexts/FileNavigationContext';
import {useLayout} from '../../contexts/LayoutContext';
import {useSelection} from '../../contexts/SelectionContext';
import {useFileIcons} from '../../hooks/useFileIcons';
import {formatDate} from '../../utils/formatDate';
import {getDataSize} from '../../utils/getDataSize';
import CreateFolderAction from '../Actions/CreateFolder/CreateFolder.action';
import RenameAction from '../Actions/Rename/Rename.action';

const FileItem = ({
    index,
    file,
    onCreateFolder,
    onRename,
    enableFilePreview,
    onFileOpen,
    filesViewRef,
    selectedFileIndexes,
    triggerAction,
    handleContextMenu,
    setLastSelectedFile,
}) => {
    const [fileSelected, setFileSelected] = useState(false);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [checkboxClassName, setCheckboxClassName] = useState('hidden');

    const {activeLayout} = useLayout();
    const iconSize = activeLayout === 'grid' ? 48 : 20;
    const fileIcons = useFileIcons(iconSize);
    const {setCurrentPath, currentPathFiles} = useFileNavigation();
    const {setSelectedFiles} = useSelection();
    const {clipBoard} = useClipBoard();

    const isFileMoving =
    clipBoard?.isMoving &&
    clipBoard.files.find((f) => f.name === file.name && f.path === file.path);

    const handleFileAccess = () => {
        onFileOpen(file);
        // eslint-disable-next-line react/prop-types
        if (file.isDirectory) {
            // eslint-disable-next-line react/prop-types
            setCurrentPath(file.path);
            setSelectedFiles([]);
        } else {
            // eslint-disable-next-line no-unused-expressions, react/prop-types
            enableFilePreview && triggerAction.show('previewFile');
        }
    };

    const handleFileRangeSelection = (shiftKey, ctrlKey) => {
        // eslint-disable-next-line react/prop-types
        if (selectedFileIndexes.length > 0 && shiftKey) {
            let reverseSelection = false;
            let startRange = selectedFileIndexes[0];
            let endRange = index;

            // Reverse Selection
            if (startRange >= endRange) {
                const temp = startRange;
                startRange = endRange;
                endRange = temp;
                reverseSelection = true;
            }

            const filesRange = currentPathFiles.slice(startRange, endRange + 1);
            setSelectedFiles(reverseSelection ? filesRange.reverse() : filesRange);
        // eslint-disable-next-line react/prop-types
        } else if (selectedFileIndexes.length > 0 && ctrlKey) {
            // Remove file from selected files if it already exists on CTRL + Click, other push it in selectedFiles
            setSelectedFiles((prev) => {
                const filteredFiles = prev.filter((f) => f.path !== file.path);
                if (prev.length === filteredFiles.length) {
                    return [...prev, file];
                }
                return filteredFiles;
            });
        } else {
            setSelectedFiles([file]);
        }
    };

    const handleFileSelection = (e) => {
        e.stopPropagation();
        // eslint-disable-next-line react/prop-types
        if (file.isEditing) {
            return;
        }

        handleFileRangeSelection(e.shiftKey, e.ctrlKey);

        const currentTime = new Date().getTime();
        if (currentTime - lastClickTime < 300) {
            handleFileAccess();
            return;
        }
        setLastClickTime(currentTime);
    };

    const handleOnKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.stopPropagation();
            setSelectedFiles([file]);
            handleFileAccess();
        }
    };

    const handleItemContextMenu = (e) => {
        e.stopPropagation();
        e.preventDefault();

        // eslint-disable-next-line react/prop-types
        if (file.isEditing) {
            return;
        }

        if (!fileSelected) {
            setSelectedFiles([file]);
        }

        setLastSelectedFile(file);
        handleContextMenu(e, true);
    };

    // Selection Checkbox Functions
    const handleMouseOver = () => {
        setCheckboxClassName('visible');
    };

    const handleMouseLeave = () => {
        // eslint-disable-next-line no-unused-expressions
        !fileSelected && setCheckboxClassName('hidden');
    };

    const handleCheckboxChange = (e) => {
        if (e.target.checked) {
            setSelectedFiles((prev) => [...prev, file]);
        } else {
            setSelectedFiles((prev) =>
                prev.filter((f) => f.name !== file.name && f.path !== file.path),
            );
        }

        setFileSelected(e.target.checked);
    };

    //

    useEffect(() => {
        // eslint-disable-next-line react/prop-types
        setFileSelected(selectedFileIndexes.includes(index));
        setCheckboxClassName(
            // eslint-disable-next-line react/prop-types
            selectedFileIndexes.includes(index) ? 'visible' : 'hidden',
        );
    }, [selectedFileIndexes]);

    return (
        // eslint-disable-next-line react/react-in-jsx-scope
        <div
            className={`file-item-container ${
                // eslint-disable-next-line react/prop-types
                fileSelected || Boolean(file.isEditing) ? 'file-selected' : ''
            } ${isFileMoving ? 'file-moving' : ''}`}
            // eslint-disable-next-line react/prop-types
            title={file.name}
            onClick={handleFileSelection}
            onKeyDown={handleOnKeyDown}
            onContextMenu={handleItemContextMenu}
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
            tabIndex={0}
        >
            <div className='file-item'>
                {!file.isEditing && (
                    <Checkbox
                        name={file.name}
                        id={file.name}
                        checked={fileSelected}
                        className={`selection-checkbox ${checkboxClassName}`}
                        onChange={handleCheckboxChange}
                        onClick={(e) => e.stopPropagation()}
                    />
                )}
                {file.isDirectory ? (
                    // eslint-disable-next-line react/react-in-jsx-scope
                    <svg
                        width='40'
                        height='40'
                        viewBox='0 0 64 64'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            d='M53.0818 24C54.1005 24 55.0797 24.151 56 24.4308V24C56 19.5817 52.4183 16 48 16H37.6569C37.1264 16 36.6177 15.7893 36.2426 15.4142L30.5858 9.75736C29.4606 8.63214 27.9344 8 26.3431 8H16C11.5817 8 8 11.5817 8 16V24.4307C8.92021 24.151 9.89929 24 10.9179 24H53.0818Z'
                            fill='#7D8A97'
                        />
                        <path
                            d='M10.9181 28C7.26682 28 4.46205 31.2339 4.97842 34.8485L7.26414 50.8485C7.68641 53.8044 10.2179 56 13.2038 56H50.7963C53.7822 56 56.3137 53.8044 56.736 50.8485L59.0217 34.8485C59.5381 31.2339 56.7333 28 53.082 28H10.9181Z'
                            fill='#7D8A97'
                        />
                    </svg>
                ) : (
                    <>
                        {fileIcons[file.name?.split('.').pop()?.toLowerCase()] ?? (
                            <FaRegFile size={iconSize}/>
                        )}
                    </>
                )}

                {file.isEditing ? (
                    <div className={`rename-file-container ${activeLayout}`}>
                        {triggerAction.actionType === 'createFolder' ? (
                            <CreateFolderAction
                                filesViewRef={filesViewRef}
                                file={file}
                                onCreateFolder={onCreateFolder}
                                triggerAction={triggerAction}
                            />
                        ) : (
                            <RenameAction
                                filesViewRef={filesViewRef}
                                file={file}
                                onRename={onRename}
                                triggerAction={triggerAction}
                            />
                        )}
                    </div>
                ) : (
                    <span className='text-truncate file-name'>{file.name}</span>
                )}
            </div>

            {activeLayout === 'list' && (
                <>
                    <div className='modified-date'>{formatDate(file.updatedAt)}</div>
                    <div className='size'>
                        {file?.size > 0 ? getDataSize(file?.size) : ''}
                    </div>
                </>
            )}
        </div>
    );
};

export default FileItem;

// CTRL Shortcut
// On clicking a file, we'll check if CTRL key was pressed at the time of clicking.
// Once confirmed, we'll check if the clicked file is already present in the selection context -> We'll remove it from there.
// If it's not present in the selection context, we'll push it into the selection context.
//

// Shift Shortcut Algo
// On clicking a file, if shift key is pressed -> we'll select in range of (lastSelectedFile -- currentClickedFile)
//

// Note: If shift key or ctrl key is pressed, clicking outside should not deselect files
