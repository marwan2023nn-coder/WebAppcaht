// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import ExcelJS from 'exceljs';
import throttle from 'lodash/throttle';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FocusEvent } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';

import type { ServerError } from '@workspace/types/errors';
import type { UserProfile } from '@workspace/types/users';

import { addUserToTeam } from 'workspace-redux/actions/teams';
import { createUser } from 'workspace-redux/actions/users';
import { Client4 } from 'workspace-redux/client';
import { getConfig, getLicense, getPasswordConfig } from 'workspace-redux/selectors/entities/general';
import { getCurrentUserId } from 'workspace-redux/selectors/entities/users';
import { isEmail } from 'workspace-redux/utils/helpers';

import { removeGlobalItem } from 'actions/storage';
import { trackEvent } from 'actions/telemetry_actions.jsx';
import { getGlobalItem } from 'selectors/storage';

import './signups.scss';
import AlertBanner from 'components/alert_banner';
import type { ModeType, AlertBannerProps } from 'components/alert_banner';
import LaptopAlertSVG from 'components/common/svg_images_components/laptop_alert_svg';
import ExternalLoginButton from 'components/external_login_button/external_login_button';
import type { ExternalLoginButtonType } from 'components/external_login_button/external_login_button';
import ColumnLayout from 'components/header_footer_route/content_layouts/column';
import type { CustomizeHeaderType } from 'components/header_footer_route/header_footer_route';
import LoadingScreen from 'components/loading_screen';
import SaveButton from 'components/save_button';
import EntraIdIcon from 'components/widgets/icons/entra_id_icon';
import LockIcon from 'components/widgets/icons/lock_icon';
import LoginGitlabIcon from 'components/widgets/icons/login_gitlab_icon';
import LoginGoogleIcon from 'components/widgets/icons/login_google_icon';
import LoginOpenIDIcon from 'components/widgets/icons/login_openid_icon';
import Input, { SIZE } from 'components/widgets/inputs/input/input';
import type { CustomMessageInputType } from 'components/widgets/inputs/input/input';
import PasswordInput from 'components/widgets/inputs/password_input/password_input';

import { Constants, ItemStatus, ValidationErrors } from 'utils/constants';
import { isValidPassword } from 'utils/password';
import { isDesktopApp } from 'utils/user_agent';
import { isValidUsername } from 'utils/utils';

import type { GlobalState } from 'types/store';

const MOBILE_SCREEN_WIDTH = 1200;

type SignupProps = {
    onCustomizeHeader?: CustomizeHeaderType;
    mode?: 'manual' | 'excel';
}

const Signup = ({ onCustomizeHeader, mode = 'manual' }: SignupProps) => {
    const intl = useIntl();
    const { formatMessage } = intl;
    const dispatch = useDispatch();
    const history = useHistory();
    const { search } = useLocation();

    const params = new URLSearchParams(search);
    const token = params.get('t') ?? '';
    const inviteId = params.get('id') ?? '';
    const data = params.get('d');
    const parsedData: Record<string, string> = data ? JSON.parse(data) : {};
    const { email: parsedEmail, name: parsedTeamName, reminder_interval: reminderInterval } = parsedData;

    const config = useSelector(getConfig);
    const {
        EnableOpenServer,
        EnableUserCreation,
        NoAccounts,
        EnableSignUpWithEmail,
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
        EnableCustomBrand,
    } = config;
    const { IsLicensed } = useSelector(getLicense);
    const loggedIn = Boolean(useSelector(getCurrentUserId));
    const usedBefore = useSelector((state: GlobalState) => (!inviteId && !loggedIn && token ? getGlobalItem(state, token, null) : undefined));
    const [fileError, setFileError] = useState('');
    const emailInput = useRef<HTMLInputElement>(null);
    const nameInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isLicensed = IsLicensed === 'true';
    const enableOpenServer = EnableOpenServer === 'true';
    const enableUserCreation = EnableUserCreation === 'true';
    const noAccounts = NoAccounts === 'true';
    const enableSignUpWithEmail = true;
    const enableSignUpWithGitLab = enableUserCreation && EnableSignUpWithGitLab === 'true';
    const enableSignUpWithGoogle = enableUserCreation && EnableSignUpWithGoogle === 'true';
    const enableSignUpWithOffice365 = enableUserCreation && EnableSignUpWithOffice365 === 'true';
    const enableSignUpWithOpenId = enableUserCreation && EnableSignUpWithOpenId === 'true';
    const enableLDAP = EnableLdap === 'true';
    const enableSAML = EnableSaml === 'true';
    const enableCustomBrand = EnableCustomBrand === 'true';

    const noOpenServer = false;

    const [email, setEmail] = useState(parsedEmail ?? '');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(Boolean(inviteId));
    const [isWaiting, setIsWaiting] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [nameError, setNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [brandImageError, setBrandImageError] = useState(false);
    const [serverError, setServerError] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [teamName, setTeamName] = useState(parsedTeamName ?? '');
    const [alertBanner, setAlertBanner] = useState<AlertBannerProps | null>(null);
    const [isMobileView, setIsMobileView] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [subscribeToSecurityNewsletter, setSubscribeToSecurityNewsletter] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isLoading, setIsLoading] = useState(false);
    const enableExternalSignup = false;
    const hasError = Boolean(emailError || nameError || passwordError || serverError || alertBanner);
    const canSubmit = Boolean(email && name && password) && !hasError && !loading;
    const passwordConfig = useSelector(getPasswordConfig);
    const { error: passwordInfo } = isValidPassword('', passwordConfig, intl);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isVisible, setIsVisible] = useState(true); // الحالة الافتراضية: الكومبوننت مرئي

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [desktopLoginLink, setDesktopLoginLink] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type UserData = {
        username: string;
        email: string;
        password: string;
        first_name: string;
        team_ids: string;
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [fileData, setFileData] = useState<UserData[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const subscribeToSecurityNewsletterFunc = () => {
        try {
            Client4.subscribeToNewsletter({ email, subscribed_content: 'security_newsletter' });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    };

    const getExternalSignupOptions = () => {
        const externalLoginOptions: ExternalLoginButtonType[] = [];

        if (!enableExternalSignup) {
            return externalLoginOptions;
        }

        if (enableSignUpWithGitLab) {
            const url = `${Client4.getOAuthRoute()}/gitlab/signup${search}`;
            externalLoginOptions.push({
                id: 'gitlab',
                url,
                icon: <LoginGitlabIcon />,
                label: GitLabButtonText || formatMessage({ id: 'login.gitlab', defaultMessage: 'GitLab' }),
                style: { color: GitLabButtonColor, borderColor: GitLabButtonColor },
                onClick: desktopExternalAuth(url),
            });
        }

        if (isLicensed && enableSignUpWithGoogle) {
            const url = `${Client4.getOAuthRoute()}/google/signup${search}`;
            externalLoginOptions.push({
                id: 'google',
                url,
                icon: <LoginGoogleIcon />,
                label: formatMessage({ id: 'login.google', defaultMessage: 'Google' }),
                onClick: desktopExternalAuth(url),
            });
        }

        if (isLicensed && enableSignUpWithOffice365) {
            const url = `${Client4.getOAuthRoute()}/office365/signup${search}`;
            externalLoginOptions.push({
                id: 'office365',
                url,
                icon: <EntraIdIcon />,
                label: formatMessage({ id: 'login.office365', defaultMessage: 'Entra ID' }),
                onClick: desktopExternalAuth(url),
            });
        }

        if (isLicensed && enableSignUpWithOpenId) {
            const url = `${Client4.getOAuthRoute()}/openid/signup${search}`;
            externalLoginOptions.push({
                id: 'openid',
                url,
                icon: <LoginOpenIDIcon />,
                label: OpenIdButtonText || formatMessage({ id: 'login.openid', defaultMessage: 'Open ID' }),
                style: { color: OpenIdButtonColor, borderColor: OpenIdButtonColor },
                onClick: desktopExternalAuth(url),
            });
        }

        if (isLicensed && enableLDAP) {
            const newSearchParam = new URLSearchParams(search);
            newSearchParam.set('extra', Constants.CREATE_LDAP);

            externalLoginOptions.push({
                id: 'ldap',
                url: `${Client4.getUrl()}/login?${newSearchParam.toString()}`,
                icon: <LockIcon />,
                label: LdapLoginFieldName || formatMessage({ id: 'signup.ldap', defaultMessage: 'AD/LDAP Credentials' }),
                onClick: () => { },
            });
        }

        if (isLicensed && enableSAML) {
            const newSearchParam = new URLSearchParams(search);
            newSearchParam.set('action', 'signup');

            const url = `${Client4.getUrl()}/login/sso/saml?${newSearchParam.toString()}`;
            externalLoginOptions.push({
                id: 'saml',
                url,
                icon: <LockIcon />,
                label: SamlLoginButtonText || formatMessage({ id: 'login.saml', defaultMessage: 'SAML' }),
                onClick: desktopExternalAuth(url),
            });
        }

        return externalLoginOptions;
    };

    const handleHeaderBackButtonOnClick = useCallback(() => {
        if (!noAccounts) {
            trackEvent('signup_email', 'click_back');
        }

        history.goBack();
    }, [noAccounts, history]);

    const onWindowResize = throttle(() => {
        setIsMobileView(window.innerWidth < MOBILE_SCREEN_WIDTH);
    }, 100);

    const desktopExternalAuth = (href: string) => {
        return (event: React.MouseEvent) => {
            if (isDesktopApp()) {
                event.preventDefault();

                setDesktopLoginLink(href);
                history.push(`/signup_user_complete/desktop${search}`);
            }
        };
    };

    useEffect(() => {
        dispatch(removeGlobalItem('team'));
        trackEvent('signup', 'signup_user_01_welcome');

        onWindowResize();

        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
        };
    }, []);

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
    }, [onCustomizeHeader, handleHeaderBackButtonOnClick, isMobileView, search]);

    if (loading) {
        return (<LoadingScreen />);
    }

    const onEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === Constants.KeyCodes.ENTER[0] && canSubmit) {
            handleSubmit(e);
        }
    };

    const getCardTitle = () => {
        if (mode === 'excel') {
            return formatMessage({ id: 'admin.system_users.create_account.cardtitle.excel', defaultMessage: 'إنشاء حساب من ملف إكسل' });
        }

        if (CustomDescriptionText) {
            return CustomDescriptionText;
        }

        if (!enableSignUpWithEmail && enableExternalSignup) {
            return formatMessage({ id: 'signup_user_completed.cardtitle.external', defaultMessage: 'Create your account with one of the following:' });
        }

        return formatMessage({ id: 'signup_user_completed.cardtitle', defaultMessage: 'Create your account' });
    };
    const handleEmailOnChange = ({ target: { value: email } }: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(email);
        dismissAlert();

        if (emailError) {
            setEmailError('');
        }
    };

    const handleNameOnChange = ({ target: { value: name } }: React.ChangeEvent<HTMLInputElement>) => {
        setName(name);
        dismissAlert();

        if (nameError) {
            setNameError('');
        }
    };

    const handlePasswordInputOnChange = ({ target: { value: password } }: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(password);
        dismissAlert();

        if (passwordError) {
            setPasswordError('');
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleSignupSuccess = async (user: UserProfile) => {
        trackEvent('signup', 'signup_user_02_complete');

        if (reminderInterval) {
            trackEvent('signup', `signup_from_reminder_${reminderInterval}`, { user: user.id });
        }

        setAlertBanner({
            mode: 'success' as ModeType,
            title: 'تم إنشاء الحساب بنجاح!',
            onDismiss: dismissAlert,
        });

        // Reset fields after successful creation
        setEmail('');
        setName('');
        setPassword('');
    };
    function sendSignUpTelemetryEvents(telemetryId: string, props?: any) {
        trackEvent('signup', telemetryId, props);
    }

    type TelemetryErrorList = { errors: Array<{ field: string; rule: string }>; success: boolean };

    const isUserValid = () => {
        let isValid = true;

        const providedEmail = email.trim();
        const telemetryEvents: TelemetryErrorList = { errors: [], success: true };

        if (!providedEmail) {
            setEmailError(formatMessage({ id: 'signup_user_completed.required', defaultMessage: 'This field is required' }));
            telemetryEvents.errors.push({ field: 'email', rule: 'not_provided' });
            isValid = false;
        } else if (!isEmail(providedEmail)) {
            setEmailError(formatMessage({ id: 'signup_user_completed.validEmail', defaultMessage: 'Please enter a valid email address' }));
            telemetryEvents.errors.push({ field: 'email', rule: 'invalid_email' });
            isValid = false;
        }

        const providedUsername = name.trim().toLowerCase();
        if (providedUsername) {
            const usernameError = isValidUsername(providedUsername);
            if (usernameError && usernameError.id !== ValidationErrors.INVALID_FIRST_CHARACTER) {
                let nameError = '';
                if (usernameError.id === ValidationErrors.RESERVED_NAME) {
                    nameError = formatMessage({ id: 'signup_user_completed.reserved', defaultMessage: 'This username is reserved, please choose a new one.' });
                } else {
                    nameError = formatMessage(
                        {
                            id: 'signup_user_completed.usernameLength',
                            defaultMessage: 'Usernames have to begin with a lowercase letter and be {min}-{max} characters long. You can use lowercase letters, numbers, periods, dashes, and underscores.',
                        },
                        {
                            min: Constants.MIN_USERNAME_LENGTH,
                            max: Constants.MAX_USERNAME_LENGTH,
                        },
                    );
                }

                setNameError(nameError);
                telemetryEvents.errors.push({ field: 'username', rule: 'invalid_username' });
                isValid = false;
            }
        } else {
            setNameError(formatMessage({ id: 'signup_user_completed.required', defaultMessage: 'This field is required' }));
            telemetryEvents.errors.push({ field: 'username', rule: 'not_provided' });
            isValid = false;
        }

        const providedPassword = password;
        const { error } = isValidPassword(providedPassword, passwordConfig, intl);

        if (error) {
            setPasswordError(error as string);
            isValid = false;
        }

        if (telemetryEvents.errors.length) {
            telemetryEvents.success = false;
        }

        sendSignUpTelemetryEvents('validate_user', telemetryEvents);

        return isValid;
    };


    const dismissAlert = () => {
        setAlertBanner(null);
    };

    const handleSubmit = async (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        sendSignUpTelemetryEvents('click_create_account');
        setIsWaiting(true); // تفعيل حالة التحميل عند بداية العملية

        if (isUserValid()) {
            setNameError('');
            setEmailError('');
            setPasswordError('');
            setServerError('');

            const user = {
                email: email.trim(),
                username: name.trim().toLowerCase(),
                password,
            } as UserProfile;

            const redirectTo = (new URLSearchParams(search)).get('redirect_to') as string;

            try {
                const { data, error } = await dispatch(createUser(user, token, inviteId, redirectTo));
                if (error) {
                    setAlertBanner({
                        mode: 'danger' as ModeType,
                        title: (error as ServerError).message,
                        onDismiss: dismissAlert,
                    });
                    return; // إذا فشلت العملية، الخروج من الدالة
                }

                await handleSignupSuccess(user); // تنفيذ أي عمليات إضافية عند النجاح
            } catch (err) {
                setAlertBanner({
                    mode: 'danger' as ModeType,
                    title: 'حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.',
                    onDismiss: dismissAlert,
                });
            } finally {
                setIsWaiting(false); // إيقاف حالة التحميل في جميع الحالات
            }
        } else {
            setIsWaiting(false); // إيقاف حالة التحميل إذا كانت البيانات غير صالحة
        }
    };

    const handleReturnButtonOnClick = () => history.replace('/');

    const handleOnBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>, inputId: string) => {
        const text = e.target.value;
        if (!text) {
            return;
        }
        sendSignUpTelemetryEvents(`typed_input_${inputId}`);
    };

    const getContent = () => {
        if (!enableSignUpWithEmail && !enableExternalSignup) {
            return (
                <ColumnLayout
                    title={formatMessage({ id: 'login.noMethods.title', defaultMessage: 'This server doesn’t have any sign-in methods enabled' })}
                    message={formatMessage({ id: 'login.noMethods.subtitle', defaultMessage: 'Please contact your System Administrator to resolve this.' })}
                />
            );
        }

        if (!isWaiting && (noOpenServer || serverError || usedBefore)) {
            const titleColumn = noOpenServer ? (
                formatMessage({ id: 'signup_user_completed.no_open_server.title', defaultMessage: 'This server doesn’t allow open signups' })
            ) : (
                serverError ||
                formatMessage({ id: 'signup_user_completed.invalid_invite.title', defaultMessage: 'This invite link is invalid' })
            );

            return (
                <ColumnLayout
                    title={titleColumn}
                    message={formatMessage({ id: 'signup_user_completed.invalid_invite.message', defaultMessage: 'Please speak with your Administrator to receive an invitation.' })}
                    SVGElement={<LaptopAlertSVG />}
                    extraContent={(
                        <div className='signup-body-content-button-container'>
                            <button
                                className='signup-body-content-button-return'
                                onClick={handleReturnButtonOnClick}
                            >
                                {formatMessage({ id: 'signup_user_completed.return', defaultMessage: 'Return to log in' })}
                            </button>
                        </div>
                    )}
                />
            );
        }

        let emailCustomLabelForInput: CustomMessageInputType = parsedEmail ? {
            type: ItemStatus.INFO,
            value: formatMessage(
                {
                    id: 'signup_user_completed.emailIs',
                    defaultMessage: "You'll use this address to sign in to {siteName}.",
                },
                { siteName: SiteName },
            ),
        } : null;

        // error will have preference over info message
        if (emailError) {
            emailCustomLabelForInput = { type: ItemStatus.ERROR, value: emailError };
        }
        const addUserToTeams = async (userId: string, teamIds: string) => {
            const teams = teamIds.split(',').map((team) => team.trim()); // فصل معرفات الفرق
            const batchSize = 50; // معالجة الفرق على دفعات صغيرة
            let successCount = 0;
            let errorCount = 0;

            for (let i = 0; i < teams.length; i += batchSize) {
                const batch = teams.slice(i, i + batchSize); // معالجة دفعة
                // eslint-disable-next-line no-await-in-loop
                await Promise.all(
                    // eslint-disable-next-line no-loop-func
                    batch.map(async (teamId) => {
                        try {
                            await dispatch(addUserToTeam(teamId, userId)); // إضافة المستخدم إلى الفريق مباشرة بالـ ID
                            // eslint-disable-next-line no-console
                            console.log(`تمت إضافة المستخدم ${userId} إلى الفريق ${teamId}`);
                            successCount++;
                        } catch (error) {
                            // eslint-disable-next-line no-console
                            console.error(`خطأ أثناء إضافة المستخدم ${userId} إلى الفريق ${teamId}:`, error);
                            errorCount++;
                        }
                    }),
                );
            }

            // eslint-disable-next-line no-console
            console.log(
                `تمت إضافة المستخدم ${userId} إلى ${successCount} فريق بنجاح، فشل في ${errorCount} فريق.`,
            );
        };
        const createAccountsFromFile = async (users: any[]) => {
            setIsLoading(true);
            setFileError('');

            try {
                const batchSize = 50; // معالجة المستخدمين على دفعات
                const batches = [];
                for (let i = 0; i < users.length; i += batchSize) {
                    batches.push(users.slice(i, i + batchSize));
                }

                let successCount = 0;
                let errorCount = 0;

                for (const batch of batches) {
                    // eslint-disable-next-line no-await-in-loop
                    await Promise.all(
                        // eslint-disable-next-line no-loop-func
                        batch.map(async (user) => {
                            try {
                                // إنشاء حساب المستخدم
                                const { data, error } = await dispatch(
                                    createUser({
                                        email: user.email,
                                        username: user.username,
                                        password: user.password,
                                        first_name: user.first_name,
                                        id: '',
                                        create_at: 0,
                                        update_at: 0,
                                        delete_at: 0,
                                        auth_service: '',
                                        nickname: '',
                                        last_name: '',
                                        position: '',
                                        roles: '',
                                        props: {},
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
                                            desktop_notification_sound: undefined,
                                            calls_notification_sound: undefined,
                                            desktop_threads: undefined,
                                            email_threads: undefined,
                                            push_threads: undefined,
                                            auto_responder_active: undefined,
                                            auto_responder_message: undefined,
                                            calls_mobile_sound: undefined,
                                            calls_mobile_notification_sound: undefined,
                                        },
                                        last_password_update: 0,
                                        last_picture_update: 0,
                                        locale: '',
                                        mfa_active: false,
                                        last_activity_at: 0,
                                        is_bot: false,
                                        bot_description: '',
                                        terms_of_service_id: '',
                                        terms_of_service_create_at: 0,
                                    }, '', '', ''),
                                );

                                if (error) {
                                    errorCount++;
                                    return false;
                                }

                                // إضافة المستخدم إلى الفرق
                                if (user.team_ids) {
                                    if (data) {
                                        await addUserToTeams(data.id, user.team_ids);
                                    }
                                }
                                successCount++;
                                return true;
                            } catch (err) {
                                // eslint-disable-next-line no-console
                                console.error(`خطأ أثناء معالجة المستخدم ${user.email}:`, err);
                                errorCount++;
                                return false;
                            }
                        }),
                    );
                }

                if (successCount > 0) {
                    setAlertBanner({
                        mode: 'success' as ModeType,
                        title: `تم إنشاء ${successCount} حساب بنجاح! ${errorCount > 0 ? `ولكن فشلت ${errorCount} حسابات.` : ''}`,
                        onDismiss: dismissAlert,
                    });
                } else {
                    setFileError('لم يتم إنشاء أي حسابات. تحقق من البيانات.');
                }
            } catch (error) {
                setFileError('حدث خطأ أثناء معالجة الملف.');
                // eslint-disable-next-line no-console
                console.error(error);
            }

            setIsLoading(false);
        };

        const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
            setFileError('');
            const files = event.target.files;
            if (!files) {
                setFileError('لم يتم تحديد ملفات.');
                return;
            }
            const file = files[0]; // الحصول على الملف الذي تم تحميله

            if (!file) {
                setFileError('يرجى اختيار ملف إكسل صالح');
                return;
            }

            try {
                const workbook = new ExcelJS.Workbook();
                const data = await file.arrayBuffer(); // قراءة الملف كـ ArrayBuffer
                await workbook.xlsx.load(data); // تحميل ملف Excel باستخدام ExcelJS

                // اختيار أول ورقة عمل
                const worksheet = workbook.worksheets[0];
                const jsonData: any[] | ((prevState: never[]) => never[]) = [];

                // قراءة كل صف في الورقة
                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) {
                        // تخطي الصف الأول إذا كان يحتوي على عناوين الأعمدة
                        return;
                    }

                    const user = {
                        username: row.getCell(1).value?.toString().trim(), // العمود الأول
                        email: row.getCell(2).value?.toString().trim(), // العمود الثاني
                        password: row.getCell(3).value?.toString().trim(), // العمود الثالث
                        first_name: row.getCell(4).value?.toString().trim(), // العمود الرابع
                        team_ids: row.getCell(5).value?.toString().trim(), // العمود الخامس - معرفات الفرق
                    };

                    // إضافة المستخدم إلى قائمة البيانات
                    jsonData.push(user);
                });

                // التحقق من صحة البيانات
                const isValidData = jsonData.every((user) =>
                    user.username &&
                    user.email &&
                    user.password &&
                    user.first_name &&
                    user.team_ids,
                );

                if (isValidData) {
                    // eslint-disable-next-line no-console
                    console.log('Data from Excel:', jsonData); // تحقق من البيانات
                    setFileData(jsonData); // تخزين البيانات
                    createAccountsFromFile(jsonData); // معالجة البيانات
                } else {
                    setFileError(
                        'تنسيق الملف غير صالح. تأكد من أنه يحتوي على الأعمدة: username، email، password، first_name، و team_ids.',
                    );
                }
            } catch (error) {
                setFileError('فشل في معالجة ملف الإكسل. يرجى التحقق من تنسيقه..');
                // eslint-disable-next-line no-console
                console.error('Error processing file:', error);
            }
        };
        return (
            <>

                <div className='signup-body-action'>
                    {!isMobileView}
                    <div className={classNames('signup-body-card', { 'custom-branding': enableCustomBrand, 'with-error': hasError })}>
                        <div
                            className='signup-body-card-contents'
                            onKeyDown={onEnterKeyDown}
                            tabIndex={0}
                        >
                            <p className='signup-body-card-title'>
                                {getCardTitle()}
                            </p>
                            {enableCustomBrand}
                            {alertBanner && (
                                <AlertBanner
                                    className='login-body-card-banner'
                                    mode={alertBanner.mode}
                                    title={alertBanner.title}
                                    onDismiss={alertBanner.onDismiss}
                                />
                            )}
                            {enableSignUpWithEmail && (
                                <div className='signup-body-card-form'>
                                    {mode === 'manual' && (
                                        <>
                                            <Input
                                                ref={emailInput}
                                                name='email'
                                                className='signup-body-card-form-email-input'
                                                type='text'
                                                inputSize={SIZE.LARGE}
                                                value={email}
                                                onChange={handleEmailOnChange}
                                                placeholder={formatMessage({
                                                    id: 'signup_user_completed.emailLabel',
                                                    defaultMessage: 'Email address',
                                                })}
                                                disabled={isWaiting || Boolean(parsedEmail)}
                                                autoFocus={true}
                                                customMessage={emailCustomLabelForInput}
                                                onBlur={(e) => handleOnBlur(e, 'email')}
                                            />
                                            <Input
                                                ref={nameInput}
                                                name='name'
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
                                                autoFocus={Boolean(parsedEmail)}
                                                customMessage={nameError ? { type: ItemStatus.ERROR, value: nameError } : null}
                                                onBlur={(e) => handleOnBlur(e, 'username')}
                                            />
                                            <PasswordInput
                                                ref={passwordInput}
                                                className='signup-body-card-form-password-input'
                                                value={password}
                                                inputSize={SIZE.LARGE}
                                                onChange={handlePasswordInputOnChange}
                                                disabled={isWaiting}
                                                createMode={true}
                                                info={passwordInfo as string}
                                                error={passwordError}
                                                onBlur={(e) => handleOnBlur(e, 'password')}
                                            />
                                        </>
                                    )}
                                    {mode === 'excel' && (
                                        <div
                                            style={{
                                                backgroundColor: '#f9f9f9',
                                                padding: '30px',
                                                // eslint-disable-next-line max-lines
                                                borderRadius: '10px',
                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                                maxWidth: '500px',
                                                width: '80%',
                                                margin: '20px auto',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: '20px',
                                                    fontFamily: 'Effra_Trial_Bd',
                                                    color: '#333',
                                                    marginBottom: '20px',
                                                }}
                                            >
                                                <p style={{ fontFamily: 'Effra_Trial_Rg' }}>{'أنشئ حساباتك بسهولة باستخدام ملف إكسل'}</p>
                                            </div>
                                            <span style={{ width: 'fit-content', marginTop: '0' }}>
                                                <label
                                                    htmlFor='excel-upload'
                                                    style={{
                                                        display: 'inline-block',
                                                        padding: '12px 25%',
                                                        fontSize: '16px',
                                                        color: 'white',
                                                        backgroundColor: 'var(--button-bg)',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        transition: 'background-color 0.3s ease, transform 0.2s ease',
                                                        width: '100%',
                                                        maxWidth: '350px',
                                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {'تحميل ملف إكسل  '}
                                                    <input
                                                        id='excel-upload'
                                                        type='file'
                                                        accept='.xls,.xlsx'
                                                        onChange={handleFileUpload}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>

                                                <div className='signup-body-card-form'>
                                                    {isLoading && (
                                                        <div
                                                            style={{
                                                                marginTop: '20px',
                                                                textAlign: 'center',
                                                                fontSize: '18px',
                                                                color: 'var(--button-bg)',
                                                            }}
                                                        >
                                                            <p style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{'جاري إنشاء الحسابات'}<div className='loading-animation' /></p>
                                                        </div>
                                                    )}
                                                </div>
                                                {fileError && (
                                                    <p
                                                        style={{
                                                            color: '#d9534f',
                                                            fontSize: '14px',
                                                            marginTop: '10px',
                                                            fontFamily: 'Effra_Trial_Bd.',
                                                        }}
                                                    >
                                                        {fileError}
                                                    </p>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {mode === 'manual' && (
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
                                    )}
                                </div>
                            )}
                            {enableSignUpWithEmail && enableExternalSignup && (
                                <div className='signup-body-card-form-divider'>
                                    <span className='signup-body-card-form-divider-label'>
                                        {formatMessage({ id: 'signup_user_completed.or', defaultMessage: 'or create an account with' })}
                                    </span>
                                </div>
                            )}
                            {enableExternalSignup && (
                                <div className={classNames('signup-body-card-form-login-options', { column: !enableSignUpWithEmail })}>
                                    {getExternalSignupOptions().map((option) => (
                                        <ExternalLoginButton
                                            key={option.id}
                                            direction={enableSignUpWithEmail ? undefined : 'column'}
                                            {...option}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className='signup-body'>

            <div className='contents'>
                <div className='signup-body-content'>
                    {getContent()}
                </div>
            </div>
        </div>
    );
};

export default Signup;
