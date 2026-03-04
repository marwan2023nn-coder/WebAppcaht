// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {FocusEvent} from 'react';
import {useIntl} from 'react-intl';

import SaveButton from 'components/save_button';
import Input, {SIZE} from 'components/widgets/inputs/input/input';
import PasswordInput from 'components/widgets/inputs/password_input/password_input';

import {ItemStatus} from 'utils/constants';

type Props = {
    name: string;
    password: string;
    isWaiting: boolean;
    nameError: string;
    passwordError: string;
    passwordInfo: string;
    canSubmit: boolean;
    nameInputRef: React.RefObject<HTMLInputElement>;
    passwordInputRef: React.RefObject<HTMLInputElement>;
    handleNameOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePasswordInputOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleOnBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => void;
    handleSubmit: (e?: React.FormEvent | React.KeyboardEvent) => void;
};

const ManualAccountForm = ({
    name,
    password,
    isWaiting,
    nameError,
    passwordError,
    passwordInfo,
    canSubmit,
    nameInputRef,
    passwordInputRef,
    handleNameOnChange,
    handlePasswordInputOnChange,
    handleOnBlur,
    handleSubmit,
}: Props) => {
    const {formatMessage} = useIntl();

    return (
        <>
            <Input
                ref={nameInputRef}
                id='create-account-username-input'
                name='name'
                label={formatMessage({
                    id: 'signup_user_completed.chooseUser',
                    defaultMessage: 'Choose a Username',
                })}
                className='signup-body-card-form-name-input'
                type='text'
                inputSize={SIZE.LARGE}
                value={name}
                onChange={handleNameOnChange}
                placeholder={formatMessage({
                    id: 'signup_user_completed.chooseUser',
                    defaultMessage: 'Choose a Username',
                })}
                disabled={isWaiting}
                customMessage={nameError ? {type: ItemStatus.ERROR, value: nameError} : null}
                onBlur={(e) => handleOnBlur(e, 'username')}
            />
            <PasswordInput
                ref={passwordInputRef}
                id='create-account-password-input'
                name='password'
                label={formatMessage({
                    id: 'widget.passwordInput.createPassword',
                    defaultMessage: 'Choose a Password',
                })}
                className='signup-body-card-form-password-input'
                value={password}
                inputSize={SIZE.LARGE}
                onChange={handlePasswordInputOnChange}
                disabled={isWaiting}
                createMode={true}
                info={passwordInfo}
                error={passwordError}
                onBlur={(e) => handleOnBlur(e, 'password')}
            />
            <SaveButton
                extraClasses='signup-body-card-form-button-submit large'
                saving={isWaiting}
                disabled={!canSubmit}
                onClick={handleSubmit}
                defaultMessage={formatMessage({
                    id: 'signup_user_completed.create',
                    defaultMessage: 'Create account',
                })}
                savingMessage={formatMessage({
                    id: 'signup_user_completed.saving',
                    defaultMessage: 'Creating account…',
                })}
            />
        </>
    );
};

export default ManualAccountForm;
