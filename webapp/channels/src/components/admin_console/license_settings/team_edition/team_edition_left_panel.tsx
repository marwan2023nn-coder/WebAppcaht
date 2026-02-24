// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './team_edition.scss';
export interface TeamEditionProps {
    openEELicenseModal: () => void;
}

const TeamEdition: React.FC<TeamEditionProps> = ({ openEELicenseModal }: TeamEditionProps) => {
    const title = 'نسخة workspace';
    return (
        <div className='TeamEditionLeftPanel'>
            <div className='TeamEditionLeftPanel__Header'>
                <div className='TeamEditionLeftPanel__Title'>{title}</div>
            </div>
            <div className='TeamEditionLeftPanel__LicenseNotices'>
                <p>{'عند استخدام نسخة workspace يتم تقديم البرنامج بموجب ترخيص workspace. '}</p>
                <p>{'عند استخدام نسخة المؤسسات، يتم تقديم البرنامج بموجب ترخيص تجاري. '}</p>
                <p>{'راجع workspace للحصول على معلومات حول البرامج مفتوحة المصدر المستخدمة في النظام.'}</p>
            </div>
        </div>
    );
};

export default TeamEdition;
