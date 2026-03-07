// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {type ReactNode, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import classNames from 'classnames';
import type {SubmitOptions} from 'components/claim/components/email_to_ldap';
import ShieldWithCheckmarkSVG from 'components/common/svg_images_components/shield_with_checkmark';
import SaveButton from 'components/save_button';
import { Client4 } from 'workspace-redux/client';
import {getConfig} from 'workspace-redux/selectors/entities/general';
import './login_mfa.scss';
import './login.scss';
import img from './imagelogin/Pattern.png'
type LoginMfaProps = {
    loginId: string | null;
    password: string;
    title?: ReactNode;
    subtitle?: ReactNode;
    onSubmit: ({loginId, password, token}: SubmitOptions) => void;
}

const LoginMfa = ({loginId, password, title, subtitle, onSubmit}: LoginMfaProps) => {
    const {formatMessage} = useIntl();
    const {SiteName, CustomBrandText} = useSelector(getConfig);
    const siteName = SiteName ?? '';
    const [brandImageError, setBrandImageError] = useState(false);
  const handleBrandImageError = () => {
        setBrandImageError(true);
    };
    const OTP_LENGTH = 6;
    const [tokenDigits, setTokenDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [saving, setSaving] = useState(false);

    const token = tokenDigits.join('');
    const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const focusOtpIndex = (index: number) => {
        otpInputRefs.current[index]?.focus();
        otpInputRefs.current[index]?.select?.();
    };

    const setDigitsFromString = (startIndex: number, value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH - startIndex).split('');
        if (digits.length === 0) {
            return;
        }

        setTokenDigits((prev) => {
            const next = [...prev];
            for (let i = 0; i < digits.length; i++) {
                next[startIndex + i] = digits[i];
            }
            return next;
        });

        const nextIndex = Math.min(startIndex + digits.length, OTP_LENGTH - 1);
        focusOtpIndex(nextIndex);
    };

    const handleOtpChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (!raw) {
            setTokenDigits((prev) => {
                const next = [...prev];
                next[index] = '';
                return next;
            });
            return;
        }

        if (raw.length > 1) {
            setDigitsFromString(index, raw);
            return;
        }

        const digit = raw.replace(/\D/g, '');
        if (!digit) {
            return;
        }

        setTokenDigits((prev) => {
            const next = [...prev];
            next[index] = digit;
            return next;
        });

        if (index < OTP_LENGTH - 1) {
            focusOtpIndex(index + 1);
        }
    };

    const handleOtpKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (tokenDigits[index]) {
                setTokenDigits((prev) => {
                    const next = [...prev];
                    next[index] = '';
                    return next;
                });
                return;
            }

            if (index > 0) {
                e.preventDefault();
                setTokenDigits((prev) => {
                    const next = [...prev];
                    next[index - 1] = '';
                    return next;
                });
                focusOtpIndex(index - 1);
            }
            return;
        }

        if (e.key === 'ArrowLeft') {
            if (index > 0) {
                e.preventDefault();
                focusOtpIndex(index - 1);
            }
            return;
        }

        if (e.key === 'ArrowRight') {
            if (index < OTP_LENGTH - 1) {
                e.preventDefault();
                focusOtpIndex(index + 1);
            }
            return;
        }

        if (e.key === 'Enter' && token.length === OTP_LENGTH) {
            handleSaveButtonOnClick(e);
        }
    };

    const handleOtpPaste = (index: number) => (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text');
        if (!pasted) {
            return;
        }

        e.preventDefault();
        setDigitsFromString(index, pasted);
    };

    const handleSaveButtonOnClick = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();

        if (!saving && token.length === OTP_LENGTH) {
            setSaving(true);

            onSubmit({loginId: loginId || '', password, token});
        }
    };

    return (
        <div className='login-body'>
            <div className='login-body-content'>
                <div className={classNames(
                    'login-body-message login-body-content custom-branding with-brand-image',
                    {
                        'custom-branding': true,
                        'with-brand-image': !brandImageError,
                    },
                )}>
                    <div className='login-body-custom-branding-image'>
                        <div className='login-body-custom-branding-text'>
                            {!brandImageError && (
                                <img
                                    className={classNames('login-body-custom-branding-image-logo')}
                                    alt='brand image'
                                    src={Client4.getBrandImageUrl('0')}
                                    onError={handleBrandImageError}
                                />
                            )}
                            <p>{siteName || 'مـنصة عمـل ســـوفـا'}</p>
                            <p className='custom-text'>{CustomBrandText || 'Sofa Workspace'}</p>
                        </div>

                        <img
                            className={classNames('login-body-custom-branding-image')}
                            alt='brand image'
                            src={img}
                            onError={handleBrandImageError}
                        />
                    </div>
                </div>
                <div className='login-body-action'>
                    <div className={classNames('login-body-card', {
                        'custom-branding': true,
                    })}>
                        <div
                            className='login-body-card-content'
                            tabIndex={0}
                        >
                            <div className='login-mfa-icon'>
                                <ShieldWithCheckmarkSVG/>
                            </div>
                            <p className='login-body-card-title'>
                                {title || formatMessage({id: 'login_mfa.title', defaultMessage: 'Enter MFA Token'})}
                            </p>
                            {/* <p className='login-body-card-subtitle'>
                                {subtitle || formatMessage({id: 'login_mfa.subtitle', defaultMessage: 'To complete the sign in process, please enter a token from your smartphone\'s authenticator'})}
                            </p> */}
                            <form
                                style={{ width: '100%' }}
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    if (token.length === OTP_LENGTH) {
                                        handleSaveButtonOnClick(event as unknown as React.MouseEvent);
                                    }
                                }}
                            >
                                <div
                                    className='login-body-card-form'
                                    style={{ width: '100%' }}
                                >
                                    {/* <h5>{formatMessage({id: 'login_mfa.token', defaultMessage: 'Enter MFA Token'})}</h5> */}
                                    <div
                                        className='login-mfa-otp'
                                        aria-label={formatMessage({id: 'login_mfa.token', defaultMessage: 'Enter MFA Token'})}
                                        dir='ltr'
                                    >
                                        {tokenDigits.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => {
                                                    otpInputRefs.current[index] = el;
                                                }}
                                                className='login-mfa-otp-input'
                                                type='text'
                                                inputMode='numeric'
                                                pattern='[0-9]*'
                                                autoComplete={index === 0 ? 'one-time-code' : undefined}
                                                maxLength={1}
                                                value={digit}
                                                onChange={handleOtpChange(index)}
                                                onKeyDown={handleOtpKeyDown(index)}
                                                onPaste={handleOtpPaste(index)}
                                                autoFocus={index === 0}
                                                disabled={saving}
                                                aria-label={formatMessage({id: 'login_mfa.token', defaultMessage: 'Enter MFA Token'}) + ' ' + (index + 1)}
                                            />
                                        ))}
                                    </div>
                                    <SaveButton
                                        extraClasses='login-body-card-form-button-submit'
                                        saving={saving}
                                        disabled={token.length !== OTP_LENGTH}
                                        onClick={handleSaveButtonOnClick}
                                        defaultMessage={formatMessage({id: 'login_mfa.submit', defaultMessage: 'Submit'})}
                                        savingMessage={formatMessage({id: 'login_mfa.saving', defaultMessage: 'Logging in…'})}
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginMfa;
