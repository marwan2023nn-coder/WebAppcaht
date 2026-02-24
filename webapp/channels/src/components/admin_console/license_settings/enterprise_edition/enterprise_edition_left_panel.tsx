// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useEffect, useState} from 'react';
import type {RefObject} from 'react';
import {FormattedDate, FormattedMessage, FormattedNumber, FormattedTime, defineMessage, defineMessages, useIntl} from 'react-intl';
import type {MessageDescriptor} from 'react-intl';

import type {ClientLicense} from '@workspace/types/config';

import {Client4} from 'workspace-redux/client';

import useGetFeatureFlagValue from 'components/common/hooks/useGetFeatureFlagValue';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';
import ExternalLink from 'components/external_link';
import Tag from 'components/widgets/tag/tag';
import WithTooltip from 'components/with_tooltip';

import {FileTypes, LicenseLinks, LicenseSkus} from 'utils/constants';
import {calculateOverageUserActivated} from 'utils/overage_team';
import {getSkuDisplayName} from 'utils/subscription';
import {getRemainingDaysFromFutureTimestamp, toTitleCase} from 'utils/utils';

import './enterprise_edition.scss';

const DAYS_UNTIL_EXPIRY_WARNING_DISPLAY_THRESHOLD = 30;
const DAYS_UNTIL_EXPIRY_DANGER_DISPLAY_THRESHOLD = 5;

type LegendKey = 'startDate' | 'expires' | 'licensedSeats' | 'activeUsers' | 'edition' | 'licenseIssued' | 'name' | 'companyOrg';

const legendMessages: Record<LegendKey, MessageDescriptor> = defineMessages({
    startDate: {
        id: 'admin.license.legend.startDate',
        defaultMessage: 'START DATE:',
    },
    expires: {
        id: 'admin.license.legend.expires',
        defaultMessage: 'EXPIRES:',
    },
    licensedSeats: {
        id: 'admin.license.legend.licensedSeats',
        defaultMessage: 'LICENSED SEATS:',
    },
    activeUsers: {
        id: 'admin.license.legend.activeUsers',
        defaultMessage: 'ACTIVE USERS:',
    },
    edition: {
        id: 'admin.license.legend.edition',
        defaultMessage: 'EDITION:',
    },
    licenseIssued: {
        id: 'admin.license.legend.licenseIssued',
        defaultMessage: 'LICENSE ISSUED:',
    },
    name: {
        id: 'admin.license.legend.name',
        defaultMessage: 'NAME:',
    },
    companyOrg: {
        id: 'admin.license.legend.companyOrg',
        defaultMessage: 'COMPANY / ORG:',
    },
});

export interface EnterpriseEditionProps {
    openEELicenseModal: () => void;
    upgradedFromTE: boolean;
    license: ClientLicense;
    isTrialLicense: boolean;
    handleRemove: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    isDisabled: boolean;
    removing: boolean;
    fileInputRef: RefObject<HTMLInputElement>;
    handleChange: () => void;
    statsActiveUsers: number;
    isLicenseSetByEnvVar: boolean;
}

export const messages = defineMessages({
    keyRemove: {id: 'admin.license.keyRemove', defaultMessage: 'Remove license and downgrade to workspace Free'},
    keyRemoveEntry: {id: 'admin.license.keyRemoveEntry', defaultMessage: 'Remove license and downgrade to workspace Entry'},
});

const EnterpriseEditionLeftPanel = ({
    openEELicenseModal,
    upgradedFromTE,
    license,
    isTrialLicense,
    handleRemove,
    isDisabled,
    removing,
    fileInputRef,
    handleChange,
    statsActiveUsers,
    isLicenseSetByEnvVar,
}: EnterpriseEditionProps) => {
    const {formatMessage} = useIntl();
    const [unsanitizedLicense, setUnsanitizedLicense] = useState(license);
    const {openPricingModal, isAirGapped} = useOpenPricingModal();
    const [openContactSales] = useOpenSalesLink();
    const enableWorkspaceEntry = useGetFeatureFlagValue('EnableWorkspaceEntry');

    useEffect(() => {
        async function fetchUnSanitizedLicense() {
            try {
                const unsanitizedL = await Client4.getClientLicenseOld();
                setUnsanitizedLicense(unsanitizedL);
            } catch {
                // do nothing
            }
        }
        fetchUnSanitizedLicense();
    }, [license]);

    const skuName = getSkuDisplayName(unsanitizedLicense.SkuShortName, unsanitizedLicense.IsGovSku === 'true');
    const expirationDays = getRemainingDaysFromFutureTimestamp(parseInt(unsanitizedLicense.ExpiresAt, 10));
    const isEntrySku = unsanitizedLicense.SkuShortName === LicenseSkus.Entry;

    // const viewPlansButton = isAirGapped ? null : (
    //     <button
    //         id='enterprise_edition_view_plans'
    //         onClick={openPricingModal}
    //         className='btn btn-tertiary btn-sm PlanDetails__viewPlansButton'
    //     >
    //         {formatMessage({
    //             id: 'workspace_limits.menu_limit.view_plans',
    //             defaultMessage: 'View plans',
    //         })}
    //     </button>
    // );

    // For Entry SKU, render a simplified panel
    if (isEntrySku) {
        return (
            <div
                className='EnterpriseEditionLeftPanel'
                data-testid='EnterpriseEditionLeftPanel'
            >
                <div className='EnterpriseEditionLeftPanel__Header'>
                    <div>
                        <div className='EnterpriseEditionLeftPanel__Title'>
                            {`workspace ${getSkuDisplayName(unsanitizedLicense.SkuShortName, unsanitizedLicense.IsGovSku === 'true')}`}
                        </div>
                    </div>
                    {/* {viewPlansButton} */}
                    {/* {viewPlansButton} */}
                </div>
                <div className='EnterpriseEditionLeftPanel__Subtitle'>
                    <FormattedMessage
                        id='admin.license.entryEdition.subtitle'
                        defaultMessage='Entry offers Enterprise Advanced capabilities {limitsLink} designed to support evaluation.'
                        values={{
                            limitsLink: (
                                <ExternalLink
                                    href={LicenseLinks.ENTRY_LIMITS_INFO}
                                    location='enterprise_edition_left_panel_entry'
                                >
                                    <FormattedMessage
                                        id='admin.license.entryEdition.limits'
                                        defaultMessage='with limits'
                                    />
                                </ExternalLink>
                            ),
                        }}
                    />
                </div>
                <div className='have-license-section'>
                    <h4 className='have-license-title'>
                        <FormattedMessage
                            id='admin.license.haveALicense'
                            defaultMessage='Have a license?'
                        />
                    </h4>
                    <p className='have-license-description'>
                        <FormattedMessage
                            id='admin.license.uploadLicenseToUnlock'
                            defaultMessage='Upload your license here to unlock licensed features'
                        />
                    </p>
                    <div className='upload-license-button-container'>
                        <WithTooltip
                            title={defineMessage({
                                id: 'admin.license.setByEnvVar',
                                defaultMessage: 'License location is set by environment variable',
                            })}
                            disabled={!isLicenseSetByEnvVar}
                        >
                            <button
                                className='btn btn-primary upload-license-btn'
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLicenseSetByEnvVar}
                            >
                                <i className='icon icon-upload-outline'/>
                                <FormattedMessage
                                    id='admin.license.uploadLicense'
                                    defaultMessage='Upload license'
                                />
                            </button>
                        </WithTooltip>
                        <input
                            ref={fileInputRef}
                            type='file'
                            accept={FileTypes.LICENSE_EXTENSION}
                            onChange={handleChange}
                            style={{display: 'none'}}
                        />
                    </div>
                </div>
                {/* <div className='license-notices'>
                    <p>
                        {'This software is offered under a commercial license. See ENTERPRISE-EDITION-LICENSE.txt in your root install directory for details. See NOTICE.txt for information about open source software used in this system.'}
                    </p>
                </div> */}
            </div>
        );
    }

    return (
        <div
            className='EnterpriseEditionLeftPanel'
            data-testid='EnterpriseEditionLeftPanel'
        >
            <div className='EnterpriseEditionLeftPanel__Header'>
                <div>
                    <div className='EnterpriseEditionLeftPanel__Title'>
                        {`workspace ${skuName}`}
                        {isTrialLicense && (
                            <Tag
                                text={formatMessage({
                                    id: 'admin.license.Trial',
                                    defaultMessage: 'Trial',
                                })}
                                variant={'success'}
                                uppercase={true}
                                size={'sm'}
                            />
                        )}
                    </div>
                </div>
                {/* {viewPlansButton} */}
                {/* {viewPlansButton} */}
            </div>
            <div className='licenseInformation'>
                <div className='licenseInformation__Header'>
                    <span className='licenseInformation__Title'>
                        <FormattedMessage
                            id='admin.license.licenseDetails'
                            defaultMessage='License details'
                        />
                    </span>
                </div>
                {
                    renderLicenseContent(
                        unsanitizedLicense,
                        isTrialLicense,
                        handleRemove,
                        isDisabled,
                        removing,
                        skuName,
                        fileInputRef,
                        handleChange,
                        statsActiveUsers,
                        expirationDays,
                        isLicenseSetByEnvVar,
                        enableWorkspaceEntry,
                    )
                }
            </div>
            {/* <div className='license-notices'>
                {upgradedFromTE ? <>
                    <p>
                        {'When using workspace Enterprise Edition, the software is offered under a commercial license. See '}
                        <a
                            role='button'
                            onClick={openEELicenseModal}
                            className='openEELicenseModal'
                        >
                            {'here'}
                        </a>
                        {' for "Enterprise Edition License" for details. '}
                        {'See NOTICE.txt for information about open source software used in the system.'}
                    </p>
                </> : <p>
                    {'This software is offered under a commercial license.\n\nSee ENTERPRISE-EDITION-LICENSE.txt in your root install directory for details. See NOTICE.txt for information about open source software used in this system.'}
                </p>
                }
            </div> */}
        </div>
    );
};

const renderLicenseValues = (activeUsers: number, seatsPurchased: number, expirationDays: number) => ({legend, value}: {legend: LegendKey; value: string | JSX.Element | null}, index: number): React.ReactNode => {
    if (legend === 'activeUsers') {
        const {isBetween5PercerntAnd10PercentPurchasedSeats, isOver10PercerntPurchasedSeats} = calculateOverageUserActivated({activeUsers, seatsPurchased});
        return (
            <div
                className='item-element'
                key={value + index.toString()}
            >
                <span
                    className={classNames({
                        legend: true,
                        'legend--warning-over-seats-purchased': isBetween5PercerntAnd10PercentPurchasedSeats,
                        'legend--over-seats-purchased': isOver10PercerntPurchasedSeats,
                    })}
                ><FormattedMessage {...legendMessages[legend]}/></span>
                <span
                    className={classNames({
                        value: true,
                        'value--warning-over-seats-purchased': isBetween5PercerntAnd10PercentPurchasedSeats,
                        'value--over-seats-purchased': isOver10PercerntPurchasedSeats,
                    })}
                >{value}</span>
            </div>
        );
    } else if (legend === 'expires') {
        return (
            <div
                className='item-element'
                key={value + index.toString()}
            >
                <span className='legend'><FormattedMessage {...legendMessages[legend]}/></span>
                <span className='value'>{value}</span>
                {(expirationDays <= DAYS_UNTIL_EXPIRY_WARNING_DISPLAY_THRESHOLD) &&
                <span
                    className={classNames('expiration-days', {
                        'expiration-days-warning': expirationDays <= DAYS_UNTIL_EXPIRY_WARNING_DISPLAY_THRESHOLD,
                        'expiration-days-danger': expirationDays <= DAYS_UNTIL_EXPIRY_DANGER_DISPLAY_THRESHOLD,
                    })}
                >
                    <FormattedMessage
                        id='admin.license.expiresInDays'
                        defaultMessage='Expires in {days} {days, plural, one {day} other {days}}'
                        values={{days: expirationDays}}
                    />
                </span>
                }
            </div>
        );
    }

    return (
        <div
            className='item-element'
            key={value + index.toString()}
        >
            <span className='legend'><FormattedMessage {...legendMessages[legend]}/></span>
            <span className='value'>{value}</span>
        </div>
    );
};

const renderLicenseContent = (
    license: ClientLicense,
    isTrialLicense: boolean,
    handleRemove: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>,
    isDisabled: boolean,
    removing: boolean,
    skuName: string,
    fileInputRef: RefObject<HTMLInputElement>,
    handleChange: () => void,
    statsActiveUsers: number,
    expirationDays: number,
    isLicenseSetByEnvVar: boolean,
    enableWorkspaceEntry: string | undefined,
) => {
    // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.

    const sku = license.SkuShortName ? <>{`workspace ${toTitleCase(skuName)}${isTrialLicense ? ' License Trial' : ''}`}</> : null;

    const users = <FormattedNumber value={parseInt(license.Users, 10)}/>;
    const activeUsers = <FormattedNumber value={statsActiveUsers}/>;
    const startsAt = <FormattedDate value={new Date(parseInt(license.StartsAt, 10))}/>;
    const expiresAt = <FormattedDate value={new Date(parseInt(license.ExpiresAt, 10))}/>;

    const issued = (
        <>
            <FormattedDate value={new Date(parseInt(license.IssuedAt, 10))}/>
            {' '}
            <FormattedTime value={new Date(parseInt(license.IssuedAt, 10))}/>
        </>
    );

    const licenseValues: Array<{
        legend: LegendKey;
        value: string;
    } | {
        legend: LegendKey;
        value: JSX.Element | null;
    }> = [
        {legend: 'startDate', value: startsAt},
        {legend: 'expires', value: expiresAt},
        {legend: 'licensedSeats', value: users},
        {legend: 'activeUsers', value: activeUsers},
        {legend: 'edition', value: sku},
        {legend: 'licenseIssued', value: issued},
        {legend: 'name', value: license.Name},
        {legend: 'companyOrg', value: license.Company},
    ];

    return (
        <div className='licenseElements'>
            {licenseValues.map(renderLicenseValues(statsActiveUsers, parseInt(license.Users, 10), expirationDays))}
            <hr/>
            {renderAddNewLicenseButton(fileInputRef, handleChange, isLicenseSetByEnvVar)}
            {renderRemoveButton(handleRemove, isDisabled, removing, enableWorkspaceEntry)}
        </div>
    );
};

const renderAddNewLicenseButton = (
    fileInputRef: RefObject<HTMLInputElement>,
    handleChange: () => void,
    isLicenseSetByEnvVar: boolean,
) => {
    return (
        <>
            <WithTooltip
                title={defineMessage({
                    id: 'admin.license.setByEnvVar',
                    defaultMessage: 'License location is set by environment variable',
                })}
                disabled={!isLicenseSetByEnvVar}
            >
                <button
                    className={'btn btn-secondary'}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLicenseSetByEnvVar}
                >
                    <FormattedMessage
                        id='admin.license.keyAddNew'
                        defaultMessage='Add a new license'
                    />
                </button>
            </WithTooltip>
            <input
                ref={fileInputRef}
                type='file'
                accept={FileTypes.LICENSE_EXTENSION}
                onChange={handleChange}
                style={{display: 'none'}}
            />
        </>
    );
};

const renderRemoveButton = (
    handleRemove: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>,
    isDisabled: boolean,
    removing: boolean,
    enableWorkspaceEntry: string | undefined,
) => {
    const isEntryEnabled = enableWorkspaceEntry === 'true';

    let removeButtonText;
    if (removing) {
        removeButtonText = (
            <FormattedMessage
                id='admin.license.removing'
                defaultMessage='Removing License...'
            />
        );
    } else {
        removeButtonText = isEntryEnabled ? (
            <FormattedMessage {...messages.keyRemoveEntry}/>
        ) : (
            <FormattedMessage {...messages.keyRemove}/>
        );
    }

    return (
        <>
            <div className='remove-button'>
                <button
                    type='button'
                    className='btn btn-danger'
                    onClick={handleRemove}
                    disabled={isDisabled}
                    id='remove-button'
                    data-testid='remove-button'
                >
                    {removeButtonText}
                </button>
            </div>
        </>
    );
};

export default React.memo(EnterpriseEditionLeftPanel);
