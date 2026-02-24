// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ArrowLeft} from 'lucide-react';
import React from 'react';
import '../styles/main.scss';
interface SecurityFeatureProps {
    title: string;
    description: string;
    isActive: boolean;
    onClick: () => void;
}

export function SecurityFeature({
    title,
    isActive,
    onClick,
}: SecurityFeatureProps) {
    return (
        <button
            onClick={onClick}
            className={`security-feature ${isActive ? 'active' : ''}`}
        >
            <span className='content'>
                {isActive && <ArrowLeft className='arrow'/>}

                <span>{title}</span>
            </span>
        </button>
    );
}
