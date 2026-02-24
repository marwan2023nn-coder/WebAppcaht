// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useCallback} from 'react';
import {FormattedMessage, defineMessages} from 'react-intl';
import {useDispatch} from 'react-redux';

import {deactivateInactiveUsers} from 'workspace-redux/actions/users';

import ConfirmModal from 'components/confirm_modal';
import AdminPanel from 'components/widgets/admin_console/admin_panel';

const messages = defineMessages({
    title: {
        id: 'admin.system_users.deactivate_inactive_title',
        defaultMessage: 'Deactivate Inactive Users',
    },
    subtitle: {
        id: 'admin.system_users.deactivate_inactive_subtitle',
        defaultMessage: 'Bulk deactivate users who have been inactive for more than {days} days.',
    },
});

export const DeactivateInactiveUsersTool = () => {
    const dispatch = useDispatch();
    const [days, setDays] = useState(90);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deactivatedCount, setDeactivatedCount] = useState<number | null>(null);

    const handleConfirm = useCallback(async () => {
        setLoading(true);
        const {data} = await dispatch(deactivateInactiveUsers(days) as any);
        setLoading(false);
        setShowModal(false);
        if (data) {
            setDeactivatedCount(data.count);
            setTimeout(() => setDeactivatedCount(null), 10000);
        }
    }, [dispatch, days]);

    const button = (
        <button
            className='btn btn-danger'
            onClick={() => setShowModal(true)}
            disabled={loading}
        >
            <FormattedMessage
                id='admin.system_users.deactivateInactiveUsers'
                defaultMessage='Deactivate Now'
            />
        </button>
    );

    return (
        <div style={{marginBottom: '20px'}}>
            <AdminPanel
                title={messages.title}
                subtitle={messages.subtitle}
                subtitleValues={{days}}
                button={button}
            >
                <div
                    className='admin-console__inner'
                    style={{padding: '20px', borderTop: '1px solid var(--center-channel-color-16)'}}
                >
                    <div
                        style={{display: 'flex', alignItems: 'center', gap: '12px'}}
                    >
                        <span style={{fontSize: '14px'}}>
                            <FormattedMessage
                                id='admin.system_users.deactivate_inactive_days_label'
                                defaultMessage='Inactivity Threshold (Days):'
                            />
                        </span>
                        <input
                            type='number'
                            className='form-control'
                            style={{width: '100px'}}
                            value={days}
                            onChange={(e) => setDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            min={1}
                        />
                        {deactivatedCount !== null && (
                            <div
                                className='alert alert-success'
                                style={{
                                    margin: 0,
                                    padding: '8px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderRadius: '4px',
                                }}
                            >
                                <i
                                    className='icon icon-check-circle-outline'
                                    style={{marginRight: '8px', fontSize: '16px'}}
                                />
                                <FormattedMessage
                                    id='admin.system_users.deactivate_inactive_success'
                                    defaultMessage='Successfully deactivated {count} users.'
                                    values={{count: deactivatedCount}}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </AdminPanel>

            <ConfirmModal
                show={showModal}
                title={
                    <FormattedMessage
                        id='admin.system_users.deactivate_inactive_modal_title'
                        defaultMessage='Confirm Deactivation'
                    />
                }
                message={
                    <FormattedMessage
                        id='admin.system_users.deactivate_inactive_modal_message'
                        defaultMessage='This action will immediately deactivate all users who have been inactive for more than {days} days. System administrators and bots are explicitly excluded. All sessions for these users will be revoked. Are you sure you want to proceed?'
                        values={{days}}
                    />
                }
                confirmButtonClass='btn btn-danger'
                confirmButtonText={
                    <FormattedMessage
                        id='admin.system_users.deactivate_inactive_button'
                        defaultMessage='Deactivate Users'
                    />
                }
                onConfirm={handleConfirm}
                onCancel={() => setShowModal(false)}
            />
        </div>
    );
};

export default DeactivateInactiveUsersTool;
