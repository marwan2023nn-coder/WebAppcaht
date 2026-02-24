// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import ImageGenerator from './components/ImageGenerator';
import SecondPage from './components/ImageUpScaler';
import TabButton from './components/TabButton';
import TabList from './components/TabList';
import TabPanel from './components/TabPanel';
import './types/layout.module.scss';
import VoiceGenerator from './components/voiceGenerator';

import App from 'components/frontend/App';

interface ModelProps {
    fileId?: string;
    fileType?: string;
}
function Model({fileId, fileType}: ModelProps) {
    return (
        <div className='custom-min-h-screen  custom-bg-gradient'>
            <div className='custom-container '>
                <App
                    fileId={fileId}
                    fileType={fileType}
                />

            </div>
        </div>
    );
}

export default Model;
