// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import ExcelJS from 'exceljs';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import type {FocusEvent} from 'react';
import {useIntl} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';
import {useLocation, useHistory} from 'react-router-dom';

import type {ServerError} from '@workspace/types/errors';
import type {UserProfile} from '@workspace/types/users';

import {addUserToTeam} from 'workspace-redux/actions/teams';
import {createUser} from 'workspace-redux/actions/users';
import {Client4} from 'workspace-redux/client';
import {getConfig, getLicense, getPasswordConfig} from 'workspace-redux/selectors/entities/general';

import {removeGlobalItem} from 'actions/storage';
import {trackEvent} from 'actions/telemetry_actions';
import {getGlobalItem} from 'selectors/storage';

import './signups.scss';

import type {ModeType, AlertBannerProps} from 'components/alert_banner';
import AlertBanner from 'components/alert_banner';
import LaptopAlertSVG from 'components/common/svg_images_components/laptop_alert_svg';
import ExternalLoginButton from 'components/external_login_button/external_login_button';
import type {ExternalLoginButtonType} from 'components/external_login_button/external_login_button';
import ColumnLayout from 'components/header_footer_route/content_layouts/column';
import type {CustomizeHeaderType} from 'components/header_footer_route/header_footer_route';
import EntraIdIcon from 'components/widgets/icons/entra_id_icon';
import LockIcon from 'components/widgets/icons/lock_icon';
import LoginGitlabIcon from 'components/widgets/icons/login_gitlab_icon';
import LoginGoogleIcon from 'components/widgets/icons/login_google_icon';
import LoginOpenIDIcon from 'components/widgets/icons/login_openid_icon';

import {Constants, ValidationErrors} from 'utils/constants';
import {isValidPassword} from 'utils/password';
import {isDesktopApp} from 'utils/user_agent';
import {isValidUsername} from 'utils/utils';

import type {GlobalState} from 'types/store';

import ExcelAccountForm from './ExcelAccountForm';
import ManualAccountForm from './ManualAccountForm';

type SignupProps = {
    onCustomizeHeader?: CustomizeHeaderType;
    mode?: 'manual' | 'excel';
}

const Signup = ({onCustomizeHeader, mode = 'manual'}: SignupProps) => {
    const intl = useIntl();
    const {formatMessage} = intl;
    const dispatch = useDispatch();
    const history = useHistory();
    const {search} = useLocation();

    const params = new URLSearchParams(search);
    const token = params.get('t') ?? '';
    const inviteId = params.get('id') ?? '';
    const data = params.get('d');
    const parsedData: Record<string, string> = data ? JSON.parse(data) : {};
    const {reminder_interval: reminderInterval} = parsedData;

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isWaiting, setIsWaiting] = useState(false);
    const [nameError, setNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [alertBanner, setAlertBanner] = useState<AlertBannerProps | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [fileError, setFileError] = useState<React.ReactNode>(null);
    const nameInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const config = useSelector(getConfig);
    const {
        EnableUserCreation,
        NoAccounts,
        EnableSignUpWithGitLab,
        EnableSignUpWithGoogle,
        EnableSignUpWithOffice365,
        EnableSignUpWithOpenId,
        EnableLdap,
        EnableSaml,
        SamlLoginButtonText,
        LdapLoginFieldName,
        SiteName,
        CustomDescriptionText,
        GitLabButtonText,
        GitLabButtonColor,
        OpenIdButtonText,
        OpenIdButtonColor,
    } = config;

    const {IsLicensed} = useSelector(getLicense);
    const loggedIn = Boolean(useSelector((state: GlobalState) => state.entities.users.currentUserId));
    const usedBefore = useSelector((state: GlobalState) => (!inviteId && !loggedIn && token ? getGlobalItem(state, token, null) : undefined));

    const canSubmit = Boolean(name && password) && !isWaiting && !nameError && !passwordError && !alertBanner;
    const passwordConfig = useSelector(getPasswordConfig);
    const {error: passwordInfo} = isValidPassword('', passwordConfig, intl);

    type UserData = {
        username: string;
        email: string;
        password: string;
        first_name: string;
        team_ids: string;
    };

    const dismissAlert = useCallback(() => {
        setAlertBanner(null);
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const desktopExternalAuth = (href: string) => {
        return (event: React.MouseEvent) => {
            if (isDesktopApp()) {
                event.preventDefault();
                history.push(`/signup_user_complete/desktop${search}`);
            }
        };
    };

    const getExternalSignupOptions = () => {
        const externalLoginOptions: ExternalLoginButtonType[] = [];
        const configOptions = [
            {id: 'gitlab', condition: EnableUserCreation === 'true' && EnableSignUpWithGitLab === 'true', url: `${Client4.getOAuthRoute()}/gitlab/signup${search}`, icon: <LoginGitlabIcon/>, label: GitLabButtonText || formatMessage({id: 'login.gitlab', defaultMessage: 'GitLab'}), style: GitLabButtonColor ? {color: GitLabButtonColor, borderColor: GitLabButtonColor} : undefined},
            {id: 'google', condition: EnableUserCreation === 'true' && IsLicensed === 'true' && EnableSignUpWithGoogle === 'true', url: `${Client4.getOAuthRoute()}/google/signup${search}`, icon: <LoginGoogleIcon/>, label: formatMessage({id: 'login.google', defaultMessage: 'Google'})},
            {id: 'office365', condition: EnableUserCreation === 'true' && IsLicensed === 'true' && EnableSignUpWithOffice365 === 'true', url: `${Client4.getOAuthRoute()}/office365/signup${search}`, icon: <EntraIdIcon/>, label: formatMessage({id: 'login.office365', defaultMessage: 'Entra ID'})},
            {id: 'openid', condition: EnableUserCreation === 'true' && IsLicensed === 'true' && EnableSignUpWithOpenId === 'true', url: `${Client4.getOAuthRoute()}/openid/signup${search}`, icon: <LoginOpenIDIcon/>, label: OpenIdButtonText || formatMessage({id: 'login.openid', defaultMessage: 'Open ID'}), style: OpenIdButtonColor ? {color: OpenIdButtonColor, borderColor: OpenIdButtonColor} : undefined},
        ];

        configOptions.forEach((opt) => {
            if (opt.condition) {
                externalLoginOptions.push({
                    id: opt.id,
                    url: opt.url,
                    icon: opt.icon,
                    label: opt.label,
                    style: opt.style,
                    onClick: desktopExternalAuth(opt.url),
                });
            }
        });

        if (IsLicensed === 'true' && EnableLdap === 'true') {
            const newSearchParam = new URLSearchParams(search);
            newSearchParam.set('extra', Constants.CREATE_LDAP);
            externalLoginOptions.push({
                id: 'ldap',
                url: `${Client4.getUrl()}/login?${newSearchParam.toString()}`,
                icon: <LockIcon/>,
                label: LdapLoginFieldName || formatMessage({id: 'signup.ldap', defaultMessage: 'AD/LDAP Credentials'}),
                onClick: () => { },
            });
        }

        if (IsLicensed === 'true' && EnableSaml === 'true') {
            const url = `${Client4.getOAuthRoute()}/saml/signup${search}`;
            externalLoginOptions.push({
                id: 'saml',
                url,
                icon: <LockIcon/>,
                label: SamlLoginButtonText || formatMessage({id: 'login.saml', defaultMessage: 'SAML'}),
                onClick: desktopExternalAuth(url),
            });
        }

        return externalLoginOptions;
    };

    const handleHeaderBackButtonOnClick = useCallback(() => {
        if (NoAccounts !== 'true') {
            trackEvent('signup_email', 'click_back');
        }
        history.goBack();
    }, [NoAccounts, history]);

    const handleReturnButtonOnClick = () => history.replace('/');

    useEffect(() => {
        dispatch(removeGlobalItem('team'));
        trackEvent('signup', 'signup_user_01_welcome');
    }, [dispatch]);

    useEffect(() => {
        if (SiteName) {
            document.title = SiteName;
        }
    }, [SiteName]);

    useEffect(() => {
        if (onCustomizeHeader) {
            onCustomizeHeader({
                onBackButtonClick: handleHeaderBackButtonOnClick,
            });
        }
    }, [onCustomizeHeader, handleHeaderBackButtonOnClick]);

    const handleOnBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>, inputId: string) => {
        if (e.target.value) {
            trackEvent('signup', `typed_input_${inputId}`);
        }
    };

    const handleNameOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        dismissAlert();
        if (nameError) {
            setNameError('');
        }
    };

    const handlePasswordInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        dismissAlert();
        if (passwordError) {
            setPasswordError('');
        }
    };

    const handleSignupSuccess = async (user: UserProfile) => {
        trackEvent('signup', 'signup_user_02_complete');
        if (reminderInterval) {
            trackEvent('signup', `signup_from_reminder_${reminderInterval}`, {user: user.id});
        }
        setAlertBanner({
            mode: 'success' as ModeType,
            title: 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.',
            onDismiss: dismissAlert,
        });
        setName('');
        setPassword('');
    };

    const isUserValid = () => {
        let isValid = true;
        const telemetryEvents = {errors: [] as Array<{ field: string; rule: string }>, success: true};

        const providedUsername = name.trim().toLowerCase();
        if (providedUsername) {
            const usernameError = isValidUsername(providedUsername);
            if (usernameError && usernameError.id !== ValidationErrors.INVALID_FIRST_CHARACTER) {
                let errorMsg = '';
                if (usernameError.id === ValidationErrors.RESERVED_NAME) {
                    errorMsg = formatMessage({id: 'signup_user_completed.reserved', defaultMessage: 'This username is reserved, please choose a new one.'});
                } else {
                    errorMsg = formatMessage(
                        {id: 'signup_user_completed.usernameLength', defaultMessage: 'Usernames have to begin with a lowercase letter and be {min}-{max} characters long. You can use lowercase letters, numbers, periods, dashes, and underscores.'},
                        {min: Constants.MIN_USERNAME_LENGTH, max: Constants.MAX_USERNAME_LENGTH},
                    );
                }
                setNameError(errorMsg);
                telemetryEvents.errors.push({field: 'username', rule: 'invalid_username'});
                isValid = false;
            }
        } else {
            setNameError(formatMessage({id: 'signup_user_completed.required', defaultMessage: 'This field is required'}));
            telemetryEvents.errors.push({field: 'username', rule: 'not_provided'});
            isValid = false;
        }

        const {error: pError} = isValidPassword(password, passwordConfig, intl);
        if (pError) {
            setPasswordError(pError as string);
            isValid = false;
        }

        if (telemetryEvents.errors.length) {
            telemetryEvents.success = false;
        }
        trackEvent('signup', 'validate_user', telemetryEvents);
        return isValid;
    };

    const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
        if (e) {
            e.preventDefault();
        }
        trackEvent('signup', 'click_create_account');
        setIsWaiting(true);

        if (isUserValid()) {
            setNameError('');
            setPasswordError('');

            // Don't send email field if it's empty to avoid unique constraint issues
            const user = {username: name.trim().toLowerCase(), password} as UserProfile;
            const redirectTo = (new URLSearchParams(search)).get('redirect_to') as string;

            try {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const {data, error} = await dispatch(createUser(user, token, inviteId, redirectTo));
                if (error) {
                    setAlertBanner({
                        mode: 'danger' as ModeType,
                        title: (error as ServerError).message,
                        onDismiss: dismissAlert,
                    });
                } else {
                    await handleSignupSuccess(user);
                }
            } catch (err) {
                setAlertBanner({
                    mode: 'danger' as ModeType,
                    title: 'حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.',
                    onDismiss: dismissAlert,
                });
            } finally {
                setIsWaiting(false);
            }
        } else {
            setIsWaiting(false);
        }
    };

    const getCardTitle = () => {
        if (mode === 'excel') {
            return formatMessage({id: 'admin.system_users.create_account.cardtitle.excel', defaultMessage: 'إنشاء حساب من ملف إكسل'});
        }
        return CustomDescriptionText || formatMessage({id: 'signup_user_completed.cardtitle', defaultMessage: 'Create your account'});
    };

    const addUserToTeams = async (userId: string, teamIds: string) => {
        const teams = teamIds.split(',').map((team) => team.trim());
        const batchSize = 50;
        for (let i = 0; i < teams.length; i += batchSize) {
            const batch = teams.slice(i, i + batchSize);
            // eslint-disable-next-line no-await-in-loop
            await Promise.all(batch.map(async (teamId) => {
                try {
                    await dispatch(addUserToTeam(teamId, userId));
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error(`Error adding user ${userId} to team ${teamId}:`, error);
                }
            }));
        }
    };

    const createAccountsFromFile = async (users: UserData[]) => {
        setIsLoading(true);
        setSuccessMessage('');
        setFileError('');
        try {
            const batchSize = 50;
            let successCount = 0;
            let errorCount = 0;
            for (let i = 0; i < users.length; i += batchSize) {
                const batch = users.slice(i, i + batchSize);
                // eslint-disable-next-line no-await-in-loop, no-loop-func
                await Promise.all(batch.map(async (user) => {
                    try {
                        const userPayload: any = {
                            username: user.username,
                            password: user.password,
                            first_name: user.first_name,
                            notify_props: {
                                desktop: 'all',
                                desktop_sound: 'true',
                                calls_desktop_sound: 'true',
                                email: 'true',
                                mark_unread: 'all',
                                push: 'all',
                                push_status: 'ooo',
                                comments: 'any',
                                first_name: 'true',
                                channel: 'true',
                                mention_keys: '',
                                highlight_keys: '',
                            },
                        };
                        if (user.email && user.email.trim()) {
                            userPayload.email = user.email.trim();
                        }
                        const {data, error} = await dispatch(createUser(userPayload, '', '', ''));
                        if (error) {
                            errorCount++;
                        } else {
                            if (user.team_ids && data) {
                                await addUserToTeams(data.id, user.team_ids);
                            }
                            successCount++;
                        }
                    } catch (err) {
                        errorCount++;
                    }
                }));
            }
            if (successCount > 0) {
                setSuccessMessage(`تم إنشاء ${successCount} حساب بنجاح! ${errorCount > 0 ? `ولكن فشلت ${errorCount} حسابات.` : ''}`);
            } else {
                setFileError('لم يتم إنشاء أي حسابات. تحقق من البيانات.');
            }
        } catch (error) {
            setFileError('حدث خطأ أثناء معالجة الملف.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setFileError('');
        const file = event.target.files?.[0];
        if (!file) {
            setFileError('يرجى اختيار ملف إكسل صالح');
            return;
        }
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(await file.arrayBuffer());
            const worksheet = workbook.worksheets[0];
            const jsonData: UserData[] = [];
            const headerRow = worksheet.getRow(1);
            const columnMap: Record<string, number> = {};
            headerRow.eachCell((cell, colNumber) => {
                const headerName = cell.value?.toString().trim().toLowerCase();
                if (headerName) {
                    columnMap[headerName] = colNumber;
                }
            });
            const requiredColumns = ['username', 'password', 'first_name', 'team_ids'];
            const missingColumns = requiredColumns.filter((col) => !columnMap[col]);
            if (missingColumns.length > 0) {
                setFileError(`الأعمدة المطلوبة مفقودة: ${missingColumns.join('، ')}`);
                return;
            }
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    const user = {
                        username: row.getCell(columnMap.username).value?.toString().trim() || '',
                        email: columnMap.email ? row.getCell(columnMap.email).value?.toString().trim() || '' : '',
                        password: row.getCell(columnMap.password).value?.toString().trim() || '',
                        first_name: row.getCell(columnMap.first_name).value?.toString().trim() || '',
                        team_ids: row.getCell(columnMap.team_ids).value?.toString().trim() || '',
                    };
                    if (user.username || user.password) {
                        jsonData.push(user);
                    }
                }
            });
            if (jsonData.length > 0) {
                createAccountsFromFile(jsonData);
            } else {
                setFileError('الملف فارغ أو لا يحتوي على بيانات صالحة.');
            }
        } catch (error) {
            setFileError('فشل في معالجة ملف الإكسل.');
        }
    };

    if (!isWaiting && (alertBanner?.mode === 'danger' || usedBefore)) {
        return (
            <div className='signup-body'>
                <div className='contents'>
                    <div className='signup-body-content'>
                        <ColumnLayout
                            title={alertBanner?.title || formatMessage({id: 'signup_user_completed.invalid_invite.title', defaultMessage: 'This invite link is invalid'})}
                            message={formatMessage({id: 'signup_user_completed.invalid_invite.message', defaultMessage: 'Please speak with your Administrator to receive an invitation.'})}
                            SVGElement={<LaptopAlertSVG/>}
                            extraContent={(
                                <div className='signup-body-content-button-container'>
                                    <button
                                        className='signup-body-content-button-return'
                                        onClick={handleReturnButtonOnClick}
                                    >
                                        {formatMessage({id: 'signup_user_completed.return', defaultMessage: 'Return to log in'})}
                                    </button>
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>
        );
    }

    const hasError = Boolean(nameError || passwordError || alertBanner);

    return (
        <div className='signup-body'>
            <div className='contents'>
                <div className='signup-body-content'>
                    <div className='signup-body-action'>
                        <div className={classNames('signup-body-card', {'with-error': hasError})}>
                            <div className='signup-body-card-contents'>
                                <p className='signup-body-card-title'>{getCardTitle()}</p>
                                {alertBanner && (
                                    <AlertBanner
                                        className='login-body-card-banner'
                                        mode={alertBanner.mode}
                                        title={alertBanner.title}
                                        onDismiss={alertBanner.onDismiss}
                                    />
                                )}
                                <form
                                    className='signup-body-card-form'
                                    onSubmit={handleSubmit}
                                >
                                    {mode === 'manual' ? (
                                        <ManualAccountForm
                                            name={name}
                                            password={password}
                                            isWaiting={isWaiting}
                                            nameError={nameError}
                                            passwordError={passwordError}
                                            passwordInfo={passwordInfo as string}
                                            canSubmit={canSubmit}
                                            nameInputRef={nameInput}
                                            passwordInputRef={passwordInput}
                                            handleNameOnChange={handleNameOnChange}
                                            handlePasswordInputOnChange={handlePasswordInputOnChange}
                                            handleOnBlur={handleOnBlur}
                                            handleSubmit={handleSubmit}
                                        />
                                    ) : (
                                        <ExcelAccountForm
                                            isLoading={isLoading}
                                            successMessage={successMessage}
                                            fileError={fileError}
                                            handleFileUpload={handleFileUpload}
                                        />
                                    )}
                                </form>
                                {getExternalSignupOptions().length > 0 && (
                                    <>
                                        <div className='signup-body-card-form-divider'>
                                            <span className='signup-body-card-form-divider-label'>
                                                {formatMessage({id: 'signup_user_completed.or', defaultMessage: 'or create an account with'})}
                                            </span>
                                        </div>
                                        <div className='signup-body-card-form-login-options'>
                                            {getExternalSignupOptions().map((option) => (
                                                <ExternalLoginButton
                                                    key={option.id}
                                                    {...option}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
