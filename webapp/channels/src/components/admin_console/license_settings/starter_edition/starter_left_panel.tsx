// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {RefObject} from 'react';
import {FormattedMessage, defineMessages, useIntl} from 'react-intl';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';

import {FileTypes} from 'utils/constants';

import './starter_edition.scss';
export interface StarterEditionProps {
    openEELicenseModal: () => void;
    currentPlan: JSX.Element;
    upgradedFromTE: boolean;
    fileInputRef: RefObject<HTMLInputElement>;
    handleChange: () => void;
}

export const messages = defineMessages({
    key: {id: 'admin.license.key', defaultMessage: 'License Key: '},
});

const StarterLeftPanel: React.FC<StarterEditionProps> = ({
    openEELicenseModal,
    currentPlan,
    upgradedFromTE,
    fileInputRef,
    handleChange,
}: StarterEditionProps) => {
    const {openPricingModal, isAirGapped} = useOpenPricingModal();
    const intl = useIntl();

    const viewPlansButton = isAirGapped ? null : (
        <button
            id='starter_edition_view_plans'
            onClick={openPricingModal}
            className='btn btn-tertiary btn-sm PlanDetails__viewPlansButton'
        >
            {intl.formatMessage({
                id: 'workspace_limits.menu_limit.view_plans',
                defaultMessage: 'View plans',
            })}
        </button>
    );

    return (
        <div className='StarterLeftPanel'>
            {viewPlansButton}
            <div className='title'>
                <FormattedMessage
                    id='admin.license.freeEdition.title'
                    defaultMessage='Free'
                />
            </div>
            <div className='currentPlanLegend'>
                {currentPlan}
            </div>
            <div className='subtitle'>
                <FormattedMessage
                    id='admin.license.freeEdition.subtitle'
                    defaultMessage='Purchase Professional or Enterprise to unlock enterprise features.'
                />
            </div>
            <hr/>
            <div className='content'>
                {upgradedFromTE ? <>
                    <p>
                        {'When using Workspace Enterprise Edition, the software is offered under a commercial license. See '}
                        <a
                            role='button'
                            onClick={openEELicenseModal}
                            className='openEELicenseModal'
                        >
                            {'here'}
                        </a>
                        {' لمزيد من التفاصيل حول "رخصة إصدار المؤسسة (Enterprise Edition License)". '}
                        {'راجع ملف NOTICE.txt للحصول على معلومات حول البرمجيات مفتوحة المصدر المستخدمة في النظام.'}
                    </p>
                </> : <p>
                    {'يتم تقديم هذا البرنامج بموجب رخصة تجارية.\n\nراجع ملف ENTERPRISE-EDITION-LICENSE.txt في مجلد التثبيت الرئيسي لديك لمزيد من التفاصيل. وراجع ملف NOTICE.txt للحصول على معلومات حول البرمجيات مفتوحة المصدر المستخدمة في هذا النظام.'}
                </p>

                }
            </div>
            <div className='licenseInformation'>
                <div className='licenseKeyTitle'>
                    <FormattedMessage {...messages.key}/>
                </div>
                <div className='uploadButtons'>
                    <button
                        className='btn btn-primary'
                        onClick={() => fileInputRef.current?.click()}
                        id='open-modal'
                    >
                        <FormattedMessage
                            id='admin.license.uploadFile'
                            defaultMessage='Upload File'
                        />
                    </button>
                    <input
                        ref={fileInputRef}
                        type='file'
                        accept={FileTypes.LICENSE_EXTENSION}
                        onChange={handleChange}
                        style={{display: 'none'}}
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(StarterLeftPanel);
