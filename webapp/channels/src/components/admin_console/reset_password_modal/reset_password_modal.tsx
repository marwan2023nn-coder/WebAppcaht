// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useRef, useState} from 'react';
import {useIntl} from 'react-intl';

import {GenericModal} from '@workspace/components';
import type {UserProfile} from '@workspace/types/users';

import type {ActionResult} from 'workspace-redux/types/actions';

import PasswordInput from 'components/widgets/inputs/password_input/password_input';

import {isValidPassword} from 'utils/password';
import {getFullName} from 'utils/utils';

import '../admin_modal_with_input.scss';

interface PasswordConfig {
    minimumLength: number;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSymbol: boolean;
    requireUppercase: boolean;
}

export type Props = {
    user?: UserProfile;
    currentUserId: string;
    onSuccess?: () => void;
    onExited: () => void;
    passwordConfig: PasswordConfig;
    actions: {
        updateUserPassword: (userId: string, currentPassword: string, password: string) => Promise<ActionResult>;
    };
}

export default function ResetPasswordModal({
    user,
    currentUserId,
    onSuccess,
    onExited,
    passwordConfig,
    actions,
}: Props) {
    const {formatMessage} = useIntl();

    const [show, setShow] = useState(true);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errorNewPass, setErrorNewPass] = useState<React.ReactNode>(null);
    const [errorCurrentPass, setErrorCurrentPass] = useState<React.ReactNode>(null);

    const currentPasswordRef = useRef<HTMLInputElement>(null);
    const newPasswordRef = useRef<HTMLInputElement>(null);

    const isResettingOwnPassword = user?.id === currentUserId;

    const handleCancel = useCallback(() => {
        setShow(false);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!user) {
            return;
        }

        // Clear previous errors
        setErrorNewPass(null);
        setErrorCurrentPass(null);

        // Validate current password if resetting own password
        if (isResettingOwnPassword && currentPassword === '') {
            setErrorCurrentPass(formatMessage({
                id: 'admin.reset_password.missing_current',
                defaultMessage: 'Please enter your current password.',
            }));
            return;
        }

        // Validate new password
        const {valid, error} = isValidPassword(newPassword, passwordConfig);
        if (!valid && error) {
            setErrorNewPass(error);
            return;
        }

        const result = await actions.updateUserPassword(
            user.id,
            isResettingOwnPassword ? currentPassword : '',
            newPassword,
        );

        if ('error' in result) {
            setErrorCurrentPass(result.error.message);
            return;
        }

        onSuccess?.();
        setShow(false);
    }, [user, isResettingOwnPassword, currentPassword, newPassword, passwordConfig, actions, onSuccess, formatMessage]);

    if (!user) {
        return null;
    }

    const displayName = getFullName(user) || user.username;
    const isAuthUser = Boolean(user.auth_service);

    const title = isAuthUser ?
        formatMessage({
            id: 'admin.reset_password.titleSwitchFor',
            defaultMessage: 'Switch account to Email/Password for {name}',
        }, {name: displayName}) :
        formatMessage({
            id: 'admin.reset_password.titleResetFor',
            defaultMessage: 'Reset password for {name}',
        }, {name: displayName});

    return (
        <GenericModal
            id='resetPasswordModal'
            className='ResetPasswordModal'
            modalHeaderText={title}
            show={show}
            onExited={onExited}
            onHide={handleCancel}
            handleCancel={handleCancel}
            handleConfirm={handleConfirm}
            handleEnterKeyPress={handleConfirm}
            confirmButtonText={formatMessage({
                id: 'admin.reset_password.reset',
                defaultMessage: 'Reset',
            })}
            compassDesign={true}
            autoCloseOnConfirmButton={false}
            errorText={errorCurrentPass ? <span className='error'>{errorCurrentPass}</span> : undefined}
        >
            <div className='ResetPasswordModal__body'>
                {isResettingOwnPassword && (
                    <PasswordInput
                        ref={currentPasswordRef as React.Ref<HTMLInputElement>}
                        name='currentPassword'
                        autoComplete='current-password'
                        useLegend={false}
                        label={formatMessage({
                            id: 'admin.reset_password.currentPassword',
                            defaultMessage: 'Current password',
                        })}
                        placeholder={formatMessage({
                            id: 'admin.reset_password.enterCurrentPassword',
                            defaultMessage: 'Enter current password',
                        })}
                        value={currentPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                        autoFocus={true}
                    />
                )}
                <PasswordInput
                    ref={newPasswordRef as React.Ref<HTMLInputElement>}
                    name='newPassword'
                    autoComplete='new-password'
                    useLegend={false}
                    label={formatMessage({
                        id: 'admin.reset_password.newPassword',
                        defaultMessage: 'New password',
                    })}
                    placeholder={formatMessage({
                        id: 'admin.reset_password.enterNewPassword',
                        defaultMessage: 'Enter new password',
                    })}
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    autoFocus={!isResettingOwnPassword}
                    customMessage={errorNewPass ? {type: 'error', value: errorNewPass} : undefined}
                />
            </div>
        </GenericModal>
    );
}
