// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createContext, useContext, useEffect, useState} from 'react';

import {useFiles} from './FilesContext';

const FileNavigationContext = createContext();

// eslint-disable-next-line react/prop-types
export const FileNavigationProvider = ({children}) => {
    const [currentPath, setCurrentPath] = useState('');
    const [currentFolder, setCurrentFolder] = useState(null);
    const [currentPathFiles, setCurrentPathFiles] = useState([]);
    const {files} = useFiles();

    useEffect(() => {
        if (Array.isArray(files) && files.length > 0) {
            setCurrentPathFiles(() => {
                return files.filter((file) => file.path === `${currentPath}/${file.name}`);
            });

            setCurrentFolder(() => {
                return files.find((file) => file.path === currentPath) ?? null;
            });
        }
    }, [files, currentPath]);

    return (
        // eslint-disable-next-line react/react-in-jsx-scope
        <FileNavigationContext.Provider
            value={{
                currentPath,
                setCurrentPath,
                currentFolder,
                setCurrentFolder,
                currentPathFiles,
                setCurrentPathFiles,
            }}
        >
            {children}
        </FileNavigationContext.Provider>
    );
};

export const useFileNavigation = () => useContext(FileNavigationContext);
