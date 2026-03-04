// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useState} from 'react';
import type {ChangeEventHandler} from 'react';
import {useIntl} from 'react-intl';

import {ItemStatus} from 'utils/constants';

import Input from '../input/input';
import type {CustomMessageInputType, InputProps, SIZE} from '../input/input';

import './password_input.scss';

export type PasswordInputProps = Omit<InputProps, 'type' | 'addon' | 'value' | 'onChange'> & {
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    info?: string;
    error?: string;
    createMode?: boolean;
    inputSize?: SIZE;
};

const PasswordInput = React.forwardRef((
    {
        className,
        wrapperClassName,
        name,
        value,
        onChange,
        onBlur,
        onFocus,
        hasError,
        info,
        error,
        createMode,
        disabled,
        inputSize,
        placeholder,
        customMessage,
        ...otherProps
    }: PasswordInputProps,
    ref?: React.Ref<HTMLInputElement>,
) => {
    const {formatMessage} = useIntl();

    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => setShowPassword(!showPassword);

    const customMessageError: CustomMessageInputType | null = error ? {type: ItemStatus.ERROR, value: error} : null;
    const customMessageInfo: CustomMessageInputType | null = info ? {type: ItemStatus.INFO, value: info} : null;
    const derivedCustomMessage = error ? customMessageError : customMessageInfo;

    const derivedPlaceholder = createMode ? formatMessage({id: 'widget.passwordInput.createPassword', defaultMessage: 'Choose a Password'}) : formatMessage({id: 'widget.passwordInput.password', defaultMessage: 'Password'});
    const effectivePlaceholder = placeholder || derivedPlaceholder;
    const effectiveCustomMessage = customMessage !== undefined ? customMessage : (error || info ? derivedCustomMessage : undefined);

    return (
        <Input
            className={classNames('password-input', className)}
            wrapperClassName={classNames('password-input-with-toggle', wrapperClassName)}
            name={name || 'password-input'}
            type={showPassword && !disabled ? 'text' : 'password'}
            inputSize={inputSize}
            addon={
                <button
                    id='password_toggle'
                    type='button'
                    aria-label={formatMessage({
                        id: showPassword ? 'widget.passwordInput.hidePassword' : 'widget.passwordInput.showPassword',
                        defaultMessage: showPassword ? 'Hide password' : 'Show password',
                    })}
                    className='password-input-toggle'
                    onClick={toggleShowPassword}
                    disabled={disabled}
                >
                    <i
                        className={showPassword && !disabled ? 'icon-eye-off-outline' : 'icon-eye-outline'}
                        aria-hidden='true'
                    />
                </button>
            }
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={effectivePlaceholder}
            hasError={hasError}
            customMessage={effectiveCustomMessage}
            disabled={disabled}
            ref={ref}
            {...otherProps}
        />
    );
});

export default PasswordInput;
