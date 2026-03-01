// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import type {IntlShape, MessageDescriptor} from 'react-intl';
import {Link} from 'react-router-dom';

import type {CloudState} from '@workspace/types/cloud';
import type {AdminConfig, ClientLicense, EnvironmentConfig} from '@workspace/types/config';
import type {Role} from '@workspace/types/roles';
import type {DeepPartial} from '@workspace/types/utilities';

import type {ActionResult} from 'workspace-redux/types/actions';

import BooleanSetting from 'components/admin_console/boolean_setting';
import ColorSetting from 'components/admin_console/color_setting';
import DropdownSetting from 'components/admin_console/dropdown_setting';
import FileUploadSetting from 'components/admin_console/file_upload_setting';
import GeneratedSetting from 'components/admin_console/generated_setting';
import JobsTable from 'components/admin_console/jobs';
import MultiSelectSetting from 'components/admin_console/multiselect_settings';
import RadioSetting from 'components/admin_console/radio_setting';
import RemoveFileSetting from 'components/admin_console/remove_file_setting';
import RequestButton from 'components/admin_console/request_button/request_button';
import SchemaText from 'components/admin_console/schema_text';
import SettingsGroup from 'components/admin_console/settings_group';
import TextSetting from 'components/admin_console/text_setting';
import UserAutocompleteSetting from 'components/admin_console/user_autocomplete_setting';
import FormError from 'components/form_error';
import Markdown from 'components/markdown';
import SaveButton from 'components/save_button';
import AdminHeader from 'components/widgets/admin_console/admin_header';
import AdminSectionPanel from 'components/widgets/admin_console/admin_section_panel';
import WarningIcon from 'components/widgets/icons/fa_warning_icon';
import BetaTag from 'components/widgets/tag/beta_tag';
import WithTooltip from 'components/with_tooltip';

import * as I18n from 'i18n/i18n.jsx';
import Constants from 'utils/constants';
import {mappingValueFromRoles, rolesFromMapping} from 'utils/policy_roles_adapter';

import Setting from './setting';
import type {AdminDefinitionConfigSchemaSection, AdminDefinitionSetting, AdminDefinitionSettingBanner, AdminDefinitionSettingDropdownOption, AdminDefinitionSubSectionSchema, ConsoleAccess} from './types';

import './schema_admin_settings.scss';

const emptyList: string[] = [];

export type SystemConsoleCustomSettingChangeHandler = (id: string, value: any, confirm?: boolean, doSubmit?: boolean, warning?: boolean) => void;

export type SystemConsoleCustomSettingsComponentProps = {
    id: string;
    label: string;
    helpText: string;
    value: unknown;
    disabled: boolean;
    config: Partial<AdminConfig>;
    license: ClientLicense;
    setByEnv: boolean;
    onChange: SystemConsoleCustomSettingChangeHandler;
    registerSaveAction: (saveAction: () => Promise<{error?: {message?: string}}>) => void;
    setSaveNeeded: () => void;
    unRegisterSaveAction: (saveAction: () => Promise<{error?: {message?: string}}>) => void;
    cancelSubmit: () => void;
    showConfirm: boolean;
}

export type SchemaAdminSettingsProps = {
    config: Partial<AdminConfig>;
    environmentConfig: Partial<EnvironmentConfig>;
    setNavigationBlocked: (blocked: boolean) => void;
    schema: AdminDefinitionSubSectionSchema | null;
    roles: Record<string, Role>;
    license: ClientLicense;
    editRole: (role: Role) => void;
    patchConfig: (config: DeepPartial<AdminConfig>) => Promise<ActionResult>;
    isDisabled: boolean;
    consoleAccess: ConsoleAccess;
    cloud: CloudState;
    isCurrentUserSystemAdmin: boolean;
    enterpriseReady: boolean;
}

type State = {
    [x: string]: any;
    saveNeeded: false | 'both' | 'permissions' | 'config';
    saving: boolean;
    serverError: string | null;
    serverErrorId?: string;
    customComponentWrapperClass: string;
    confirmNeededId: string;
    showConfirmId: string;
    clientWarning: string;
    prevSchemaId?: string;
}

// Some path parts may contain periods (e.g. plugin ids), but path walking the configuration
// relies on splitting by periods. Use this pair of functions to allow such path parts.
//
// It is assumed that no path contains the symbol '+'.
export function escapePathPart(pathPart: string) {
    return pathPart.replace(/\./g, '+');
}

export function unescapePathPart(pathPart: string) {
    return pathPart.replace(/\+/g, '.');
}

export function descriptorOrStringToString(text: string | MessageDescriptor | undefined, intl: IntlShape, values?: {[key: string]: any}): string | undefined {
    if (!text) {
        return undefined;
    }

    return typeof text === 'string' ? text : intl.formatMessage(text, values);
}

export function getConfigValue(config: any, path: string) {
    const pathParts = path.split('.');

    return pathParts.reduce((obj, pathPart) => {
        if (!obj) {
            return null;
        }

        return obj[unescapePathPart(pathPart)];
    }, config);
}

export function getStateFromConfig(config: Partial<AdminConfig>, schema: AdminDefinitionSubSectionSchema, roles?: Record<string, Role>) {
    let state: Partial<State> = {};

    if (schema) {
        let settings: AdminDefinitionSetting[] = [];

        if ('settings' in schema && schema.settings) {
            settings = schema.settings;
        } else if ('sections' in schema && schema.sections) {
            schema.sections.map((section) => section.settings).forEach((sectionSettings) => settings.push(...sectionSettings));
        }

        // Recursively collect settings from expandable settings
        const collectSettingsRecursively = (settingsArray: AdminDefinitionSetting[]): AdminDefinitionSetting[] => {
            const allSettings: AdminDefinitionSetting[] = [];
            settingsArray.forEach((setting) => {
                allSettings.push(setting);
                if (setting.type === Constants.SettingsTypes.TYPE_EXPANDABLE_SETTING && setting.settings) {
                    allSettings.push(...collectSettingsRecursively(setting.settings));
                }
            });
            return allSettings;
        };

        const allSettings = collectSettingsRecursively(settings);

        allSettings.forEach((setting) => {
            if (!setting.key) {
                return;
            }

            if (setting.type === Constants.SettingsTypes.TYPE_PERMISSION) {
                try {
                    state[setting.key] = mappingValueFromRoles(setting.permissions_mapping_name, roles!) === 'true';
                } catch (e) {
                    state[setting.key] = false;
                }
                return;
            }

            let value = getConfigValue(config, setting.key);

            if ('onConfigLoad' in setting && setting.onConfigLoad) {
                value = setting.onConfigLoad(value, config);
            }

            state[setting.key] = value == null ? undefined : value;
        });

        if ('onConfigLoad' in schema && schema.onConfigLoad) {
            state = {...state, ...schema.onConfigLoad(config)};
        }
    }

    return state;
}

export function setConfigValue(config: any, path: string, value: any) {
    function setValue(obj: any, pathParts: string[]) {
        const part = unescapePathPart(pathParts[0]);

        if (pathParts.length === 1) {
            obj[part] = value;
        } else {
            if (obj[part] == null) {
                obj[part] = {};
            }

            setValue(obj[part], pathParts.slice(1));
        }
    }

    setValue(config, path.split('.'));
}

export function getSettingValue(
    setting: AdminDefinitionSetting,
    state: any,
    config: Partial<AdminConfig>,
    isDisabled: (setting: AdminDefinitionSetting) => boolean,
) {
    // Force boolean values to false when disabled.
    if (setting.type === Constants.SettingsTypes.TYPE_BOOL) {
        if (isDisabled(setting)) {
            return false;
        }
    }
    if (!setting.key) {
        return undefined;
    }

    if (setting.type === Constants.SettingsTypes.TYPE_TEXT && setting.dynamic_value) {
        return setting.dynamic_value(state[setting.key], config, state);
    }

    return state[setting.key];
}

export function getConfigFromState(
    config: Partial<AdminConfig>,
    state: any,
    schema: AdminDefinitionSubSectionSchema,
    isDisabled: (setting: AdminDefinitionSetting) => boolean,
) {
    if (schema) {
        let settings: AdminDefinitionSetting[] = [];

        if ('settings' in schema && schema.settings) {
            settings = schema.settings;
        } else if ('sections' in schema && schema.sections) {
            schema.sections.map((section) => section.settings).forEach((sectionSettings) => settings.push(...sectionSettings));
        }

        // Recursively collect settings from expandable settings
        const collectSettingsRecursively = (settingsArray: AdminDefinitionSetting[]): AdminDefinitionSetting[] => {
            const allSettings: AdminDefinitionSetting[] = [];
            settingsArray.forEach((setting) => {
                allSettings.push(setting);
                if (setting.type === Constants.SettingsTypes.TYPE_EXPANDABLE_SETTING && setting.settings) {
                    allSettings.push(...collectSettingsRecursively(setting.settings));
                }
            });
            return allSettings;
        };

        const allSettings = collectSettingsRecursively(settings);

        allSettings.forEach((setting) => {
            if (!setting.key) {
                return;
            }

            if (setting.type === Constants.SettingsTypes.TYPE_PERMISSION) {
                setConfigValue(config, setting.key, null);
                return;
            }

            let value = getSettingValue(setting, state, config, isDisabled);
            const previousValue = getConfigValue(config, setting.key);

            if ('onConfigSave' in setting && setting.onConfigSave) {
                value = setting.onConfigSave(value, previousValue);
            }

            setConfigValue(config, setting.key, value);
        });

        if ('onConfigSave' in schema && schema.onConfigSave) {
            return schema.onConfigSave(config);
        }
    }

    return config;
}

export const renderLabel = (
    setting: AdminDefinitionSetting,
    schema: AdminDefinitionSubSectionSchema | null,
    intl: IntlShape,
) => {
    if (!schema || !setting.label) {
        return '';
    }

    if (typeof setting.label === 'string') {
        return setting.label;
    }

    return intl.formatMessage(setting.label);
};

export const renderSettingHelpText = (
    setting: AdminDefinitionSetting,
    schema: AdminDefinitionSubSectionSchema | null,
    isDisabled: boolean,
) => {
    if (!schema || setting.type === 'banner' || !setting.help_text) {
        return <span>{''}</span>;
    }

    let helpText;
    let isMarkdown;
    let helpTextValues;
    if ('disabled_help_text' in setting && setting.disabled_help_text && isDisabled) {
        helpText = setting.disabled_help_text;
        isMarkdown = setting.disabled_help_text_markdown;
        helpTextValues = setting.disabled_help_text_values;
    } else {
        helpText = setting.help_text;
        isMarkdown = setting.help_text_markdown;
        helpTextValues = setting.help_text_values;
    }

    return (
        <SchemaText
            isMarkdown={isMarkdown}
            text={helpText}
            textValues={helpTextValues}
        />
    );
};

export const isSetByEnv = (path: string, environmentConfig: Partial<EnvironmentConfig>) => {
    return Boolean(getConfigValue(environmentConfig, path));
};

export const renderDropdownOptionHelpText = (option: AdminDefinitionSettingDropdownOption) => {
    if (!option.help_text) {
        return <span>{''}</span>;
    }

    return (
        <SchemaText
            isMarkdown={option.help_text_markdown}
            text={option.help_text}
            textValues={option.help_text_values}
        />
    );
};

export const SchemaAdminSettings: React.FC<SchemaAdminSettingsProps> = (props) => {
    const intl = useIntl();
    const saveActions = useRef<Array<() => Promise<{error?: {message?: string}}>>>([]);

    const [state, setState] = useState<State>(() => ({
        saveNeeded: false,
        saving: false,
        serverError: null,
        customComponentWrapperClass: '',
        confirmNeededId: '',
        showConfirmId: '',
        clientWarning: '',
        prevSchemaId: props.schema?.id,
        ...getStateFromConfig(props.config, props.schema!, props.roles),
    }));

    useEffect(() => {
        if (props.schema && props.schema.id !== state.prevSchemaId) {
            setState((prevState) => ({
                ...prevState,
                prevSchemaId: props.schema!.id,
                saveNeeded: false,
                saving: false,
                serverError: null,
                ...getStateFromConfig(props.config, props.schema!, props.roles),
            }));
        }
    }, [props.schema, props.config, props.roles, state.prevSchemaId]);

    const setSaveNeeded = useCallback(() => {
        setState((prevState) => ({...prevState, saveNeeded: 'config'}));
        props.setNavigationBlocked(true);
    }, [props.setNavigationBlocked]);

    const registerSaveAction = useCallback((saveAction: () => Promise<{error?: {message?: string}}>) => {
        saveActions.current.push(saveAction);
    }, []);

    const unRegisterSaveAction = useCallback((saveAction: () => Promise<{error?: {message?: string}}>) => {
        const indexOfSaveAction = saveActions.current.indexOf(saveAction);
        if (indexOfSaveAction !== -1) {
            saveActions.current.splice(indexOfSaveAction, 1);
        }
    }, []);

    const handleChange = useCallback((id: string, value: any, confirm = false, doSubmit = false, warning = false) => {
        setState((prevState) => {
            let saveNeeded: State['saveNeeded'] = prevState.saveNeeded === 'permissions' ? 'both' : 'config';

            // Exception: Since OpenId-Custom is treated as feature discovery for Cloud Starter licenses, save button is disabled.
            const isCloudStarter = props.license.Cloud === 'true' && props.license.SkuShortName === 'starter';
            if (id === 'openidType' && value === 'openid' && isCloudStarter) {
                saveNeeded = false;
            }

            const clientWarning = warning === false ? prevState.clientWarning : warning.toString();

            let confirmNeededId = confirm ? id : prevState.confirmNeededId;
            if (id === prevState.confirmNeededId && !confirm) {
                confirmNeededId = '';
            }

            const newState = {
                ...prevState,
                saveNeeded,
                confirmNeededId,
                clientWarning,
                [id]: value,
            };

            if (doSubmit) {
                // doSubmit handling within functional component needs care with state
                // We'll call it in a separate effect or use a reference
            }

            return newState;
        });

        if (doSubmit) {
            // Execution deferred to handle state update
        }

        props.setNavigationBlocked(true);
    }, [props.license.Cloud, props.license.SkuShortName, props.setNavigationBlocked]);

    const handlePermissionChange = useCallback((id: string, value: any) => {
        setState((prevState) => {
            let saveNeeded: State['saveNeeded'] = 'permissions';
            if (prevState.saveNeeded === 'config') {
                saveNeeded = 'both';
            }
            return {
                ...prevState,
                saveNeeded,
                [id]: value,
            };
        });

        props.setNavigationBlocked(true);
    }, [props.setNavigationBlocked]);

    const cancelSubmit = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            showConfirmId: '',
        }));
    }, []);

    const isDisabled = useCallback((setting: AdminDefinitionSetting) => {
        if (typeof setting.isDisabled === 'function') {
            return setting.isDisabled(props.config, state, props.license, props.enterpriseReady, props.consoleAccess, props.cloud, props.isCurrentUserSystemAdmin);
        }
        return Boolean(setting.isDisabled);
    }, [props.config, state, props.license, props.enterpriseReady, props.consoleAccess, props.cloud, props.isCurrentUserSystemAdmin]);

    const isHidden = useCallback((setting: AdminDefinitionSetting) => {
        if (typeof setting.isHidden === 'function') {
            return setting.isHidden(props.config, state, props.license);
        }
        return Boolean(setting.isHidden);
    }, [props.config, state, props.license]);

    const isSectionHidden = useCallback((section: AdminDefinitionConfigSchemaSection) => {
        if (typeof section.isHidden === 'function') {
            return section.isHidden(props.config, state, props.license);
        }
        return Boolean(section.isHidden);
    }, [props.config, state, props.license]);

    const doSubmit = useCallback(async () => {
        if (!props.schema) {
            return;
        }

        // clone config so that we aren't modifying data in the stores
        let config = JSON.parse(JSON.stringify(props.config));
        config = getConfigFromState(config, state, props.schema, isDisabled);

        const {error} = await props.patchConfig(config);
        if (error) {
            setState((prevState) => ({
                ...prevState,
                serverError: error.message,
                serverErrorId: error.id,
                saving: false,
            }));
        } else {
            const newStateFromConfig = getStateFromConfig(config, props.schema);
            const results = [];
            for (const saveAction of saveActions.current) {
                results.push(saveAction());
            }

            const values = await Promise.all(results);
            const hasSaveActionError = values.some(((value) => value.error && value.error.message));

            if (hasSaveActionError) {
                setState((prevState) => ({...prevState, ...newStateFromConfig, saving: false}));
            } else {
                setState((prevState) => ({
                    ...prevState,
                    ...newStateFromConfig,
                    saving: false,
                    saveNeeded: false,
                    confirmNeededId: '',
                    showConfirmId: '',
                    clientWarning: '',
                }));
                props.setNavigationBlocked(false);
            }
        }
    }, [props.schema, props.config, props.patchConfig, props.setNavigationBlocked, state, isDisabled]);

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (state.confirmNeededId) {
            setState((prevState) => ({
                ...prevState,
                showConfirmId: state.confirmNeededId,
            }));
            return;
        }

        setState((prevState) => ({
            ...prevState,
            saving: true,
            serverError: null,
        }));

        if (state.saveNeeded === 'both' || state.saveNeeded === 'permissions') {
            const settings = (props.schema && 'settings' in props.schema && props.schema.settings) || [];
            const rolesBinding = settings.reduce<Record<string, string>>((acc, val) => {
                if (val.type === Constants.SettingsTypes.TYPE_PERMISSION) {
                    acc[val.permissions_mapping_name] = state[val.key].toString();
                }
                return acc;
            }, {});
            const updatedRoles = rolesFromMapping(rolesBinding, props.roles);

            let success = true;

            await Promise.all(Object.values(updatedRoles).map(async (item) => {
                try {
                    await props.editRole(item);
                } catch (err) {
                    success = false;
                    setState((prevState) => ({
                        ...prevState,
                        saving: false,
                        serverError: err.message,
                    }));
                }
            }));

            if (!success) {
                return;
            }
        }

        if (state.saveNeeded === 'both' || state.saveNeeded === 'config') {
            doSubmit();
        } else {
            setState((prevState) => ({
                ...prevState,
                saving: false,
                saveNeeded: false,
                serverError: null,
            }));
            props.setNavigationBlocked(false);
        }
    };

    // Use a reference to handle doSubmit calls from handleChange
    const doSubmitRef = useRef(doSubmit);
    doSubmitRef.current = doSubmit;

    useEffect(() => {
        // Special case for doSubmit from handleChange if we want to handle it here
    }, []);

    const buildSettingFunctions: Record<string, (setting: any) => JSX.Element> = useMemo(() => {
        const renderBannerContent = (setting: AdminDefinitionSettingBanner) => {
            if (!props.schema || !('label' in setting)) {
                return <span>{''}</span>;
            }

            if (typeof setting.label === 'string') {
                if (setting.label_markdown) {
                    return (<Markdown message={setting.label}/>);
                }
                return <span>{setting.label}</span>;
            }

            return (
                <FormattedMessage
                    {...setting.label}
                    values={setting.label_values}
                />
            );
        };

        return {
            [Constants.SettingsTypes.TYPE_TEXT]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || !setting.key || (setting.type !== 'text' && setting.type !== 'longtext' && setting.type !== 'number')) {
                    return (<></>);
                }

                let inputType: 'text' | 'number' | 'textarea' = 'text';
                if (setting.type === Constants.SettingsTypes.TYPE_NUMBER) {
                    inputType = 'number';
                } else if (setting.type === Constants.SettingsTypes.TYPE_LONG_TEXT) {
                    inputType = 'textarea';
                }

                let value = '';
                if (setting.dynamic_value) {
                    value = setting.dynamic_value(value, props.config, state);
                } else if (setting.multiple) {
                    value = state[setting.key] ? state[setting.key].join(',') : '';
                } else {
                    value = state[setting.key] ?? (setting.default || '');
                }

                let footer = null;
                if (setting.validate) {
                    const err = setting.validate(value).error(intl);
                    footer = err ? (
                        <FormError
                            type='backstrage'
                            error={err}
                        />
                    ) : footer;
                }

                const label = renderLabel(setting, props.schema, intl);
                const helpText = renderSettingHelpText(setting, props.schema, isDisabled(setting));

                return (
                    <TextSetting
                        key={props.schema.id + '_text_' + setting.key}
                        id={setting.key}
                        multiple={setting.multiple}
                        type={inputType}
                        label={label}
                        helpText={helpText}
                        placeholder={descriptorOrStringToString(setting.placeholder, intl, setting.placeholder_values)}
                        value={value}
                        disabled={isDisabled(setting)}
                        setByEnv={isSetByEnv(setting.key, props.environmentConfig)}
                        onChange={handleChange}
                        maxLength={setting.max_length}
                        footer={footer}
                    />
                );
            },
            [Constants.SettingsTypes.TYPE_LONG_TEXT]: (setting: AdminDefinitionSetting) => buildSettingFunctions[Constants.SettingsTypes.TYPE_TEXT](setting),
            [Constants.SettingsTypes.TYPE_NUMBER]: (setting: AdminDefinitionSetting) => buildSettingFunctions[Constants.SettingsTypes.TYPE_TEXT](setting),
            [Constants.SettingsTypes.TYPE_COLOR]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || !setting.key || setting.type !== 'color') {
                    return (<></>);
                }

                const label = renderLabel(setting, props.schema, intl);
                const helpText = renderSettingHelpText(setting, props.schema, isDisabled(setting));

                return (
                    <ColorSetting
                        key={props.schema.id + '_text_' + setting.key}
                        id={setting.key}
                        label={label}
                        helpText={helpText}
                        value={state[setting.key] || ''}
                        disabled={isDisabled(setting)}
                        onChange={handleChange}
                    />
                );
            },
            [Constants.SettingsTypes.TYPE_BOOL]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || !setting.key || setting.type !== 'bool') {
                    return (<></>);
                }

                const label = renderLabel(setting, props.schema, intl);
                const helpText = renderSettingHelpText(setting, props.schema, isDisabled(setting));

                return (
                    <BooleanSetting
                        key={props.schema.id + '_bool_' + setting.key}
                        id={setting.key}
                        label={label}
                        helpText={helpText}
                        value={state[setting.key] ?? (setting.default || false)}
                        disabled={isDisabled(setting)}
                        setByEnv={isSetByEnv(setting.key, props.environmentConfig)}
                        onChange={handleChange}
                    />
                );
            },
            [Constants.SettingsTypes.TYPE_PERMISSION]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || !setting.key || setting.type !== 'permission') {
                    return (<></>);
                }

                const label = renderLabel(setting, props.schema, intl);
                const helpText = renderSettingHelpText(setting, props.schema, isDisabled(setting));

                return (
                    <BooleanSetting
                        key={props.schema.id + '_bool_' + setting.key}
                        id={setting.key}
                        label={label}
                        helpText={helpText}
                        value={state[setting.key] || false}
                        disabled={isDisabled(setting)}
                        setByEnv={isSetByEnv(setting.key, props.environmentConfig)}
                        onChange={handlePermissionChange}
                    />
                );
            },
            [Constants.SettingsTypes.TYPE_DROPDOWN]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || !setting.key || setting.type !== 'dropdown') {
                    return (<></>);
                }

                const options: AdminDefinitionSettingDropdownOption[] = [];
                setting.options.forEach((option) => {
                    if (!option.isHidden || (typeof option.isHidden === 'function' && !option.isHidden(props.config, state, props.license, props.enterpriseReady))) {
                        options.push(option);
                    }
                });

                const values = options.map((o) => ({value: o.value, text: descriptorOrStringToString(o.display_name, intl)!}));
                const selectedValue = state[setting.key] ?? values[0]?.value;

                let selectedOptionForHelpText = null;
                for (const option of options) {
                    if (option.help_text && option.value === selectedValue) {
                        selectedOptionForHelpText = option;
                        break;
                    }
                }

                // used to hide help in case of cloud-starter and open-id selection to show upgrade notice.
                let hideHelp = false;
                if (setting.isHelpHidden) {
                    if (typeof (setting.isHelpHidden) === 'function') {
                        hideHelp = setting.isHelpHidden(props.config, state, props.license, props.enterpriseReady);
                    } else {
                        hideHelp = setting.isHelpHidden;
                    }
                }

                const label = renderLabel(setting, props.schema, intl);

                let helpText: string | JSX.Element = '';
                if (!hideHelp) {
                    helpText = selectedOptionForHelpText ? renderDropdownOptionHelpText(selectedOptionForHelpText) : renderSettingHelpText(setting, props.schema, isDisabled(setting));
                }
                return (
                    <DropdownSetting
                        key={props.schema.id + '_dropdown_' + setting.key}
                        id={setting.key}
                        values={values}
                        label={label}
                        helpText={helpText}
                        value={selectedValue}
                        disabled={isDisabled(setting)}
                        setByEnv={isSetByEnv(setting.key, props.environmentConfig)}
                        onChange={handleChange}
                    />
                );
            },
            [Constants.SettingsTypes.TYPE_RADIO]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || !setting.key || setting.type !== 'radio') {
                    return (<></>);
                }

                const options = setting.options || [];
                const values = options.map((o) => ({value: o.value, text: descriptorOrStringToString(o.display_name, intl)!}));
                const defaultOption = values.find((v) => v.value === setting.default)?.value || values[0]?.value;

                const label = renderLabel(setting, props.schema, intl);
                const helpText = renderSettingHelpText(setting, props.schema, isDisabled(setting));

                return (
                    <RadioSetting
                        key={props.schema.id + '_radio_' + setting.key}
                        id={setting.key}
                        values={values}
                        label={label}
                        helpText={helpText}
                        value={state[setting.key] ?? defaultOption}
                        disabled={isDisabled(setting)}
                        setByEnv={isSetByEnv(setting.key, props.environmentConfig)}
                        onChange={handleChange}
                    />
                );
            },
            [Constants.SettingsTypes.TYPE_BANNER]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || setting.type !== 'banner' || isDisabled(setting)) {
                    return (<></>);
                }

                return (
                    <div
                        className={'banner ' + setting.banner_type}
                        key={props.schema.id + '_bool_' + setting.key}
                    >
                        <div className='banner__content'>
                            <span>
                                {setting.banner_type === 'warning' ? <WarningIcon additionalClassName='banner__icon'/> : null}
                                {renderBannerContent(setting)}
                            </span>
                        </div>
                    </div>
                );
            },
            [Constants.SettingsTypes.TYPE_GENERATED]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || !setting.key || setting.type !== 'generated') {
                    return (<></>);
                }

                const label = renderLabel(setting, props.schema, intl);
                const helpText = renderSettingHelpText(setting, props.schema, isDisabled(setting));

                const handleGeneratedChange = (id: string, s: string) => {
                    handleChange(id, s.replace(/\+/g, '-').replace(/\//g, '_'));
                };

                return (
                    <GeneratedSetting
                        key={props.schema.id + '_generated_' + setting.key}
                        id={setting.key}
                        label={label}
                        helpText={helpText}
                        regenerateHelpText={setting.regenerate_help_text}
                        placeholder={descriptorOrStringToString(setting.placeholder, intl)}
                        value={state[setting.key] ?? (setting.default || '')}
                        disabled={isDisabled(setting)}
                        setByEnv={isSetByEnv(setting.key, props.environmentConfig)}
                        onChange={handleGeneratedChange}
                    />
                );
            },
            [Constants.SettingsTypes.TYPE_USERNAME]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || !setting.key || setting.type !== Constants.SettingsTypes.TYPE_USERNAME) {
                    return (<></>);
                }

                const label = renderLabel(setting, props.schema, intl);
                const helpText = renderSettingHelpText(setting, props.schema, isDisabled(setting));

                return (
                    <UserAutocompleteSetting
                        key={props.schema.id + '_userautocomplete_' + setting.key}
                        id={setting.key}
                        label={label}
                        helpText={helpText}
                        placeholder={setting.placeholder}
                        value={state[setting.key] ?? (setting.default || '')}
                        disabled={isDisabled(setting)}
                        onChange={handleChange}
                    />
                );
            },
            [Constants.SettingsTypes.TYPE_BUTTON]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || setting.type !== 'button') {
                    return (<></>);
                }

                const handleRequestAction = (success: () => void, error: (error: {message: string}) => void) => {
                    if (!setting.skipSaveNeeded && state.saveNeeded !== false) {
                        error({
                            message: intl.formatMessage({id: 'admin_settings.save_unsaved_changes', defaultMessage: 'Please save unsaved changes first'}),
                        });
                        return;
                    }
                    const successCallback = (data: any) => {
                        const metadata = new Map(Object.entries(data));
                        const settings = (props.schema && 'settings' in props.schema && props.schema.settings) || [];
                        settings.forEach((tsetting) => {
                            if (tsetting.key && 'setFromMetadataField' in tsetting && tsetting.setFromMetadataField) {
                                const inputData = metadata.get(tsetting.setFromMetadataField);

                                if (tsetting.type === Constants.SettingsTypes.TYPE_TEXT) {
                                    setState((prevState) => ({...prevState, [tsetting.key!]: inputData, [`${tsetting.key}Error`]: null}));
                                } else if (tsetting.type === Constants.SettingsTypes.TYPE_FILE_UPLOAD) {
                                    // Handle file upload metadata if needed
                                }
                            }
                        });

                        if (success && typeof success === 'function') {
                            success();
                        }
                    };

                    let sourceUrlKey = 'ServiceSettings.SiteURL';
                    if (setting.sourceUrlKey) {
                        sourceUrlKey = setting.sourceUrlKey;
                    }

                    setting.action(successCallback, error, state[sourceUrlKey]);
                };

                const helpText = renderSettingHelpText(setting, props.schema, isDisabled(setting));
                const label = renderLabel(setting, props.schema, intl);

                return (
                    <RequestButton
                        id={setting.key}
                        key={props.schema.id + '_text_' + setting.key}
                        requestAction={handleRequestAction}
                        helpText={helpText}
                        loadingText={descriptorOrStringToString(setting.loading, intl)}
                        buttonText={<span>{label}</span>}
                        showSuccessMessage={Boolean(setting.success_message)}
                        includeDetailedError={true}
                        disabled={isDisabled(setting)}
                        errorMessage={setting.error_message}
                        successMessage={setting.success_message}
                    />
                );
            },
            [Constants.SettingsTypes.TYPE_LANGUAGE]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || !setting.key || setting.type !== 'language') {
                    return (<></>);
                }
                const locales = I18n.getAllLanguages();
                const values: Array<{value: string; text: string; order: number}> = [];
                for (const l of Object.values(locales)) {
                    values.push({value: l.value, text: l.name, order: l.order});
                }
                values.sort((a, b) => a.order - b.order);

                const label = renderLabel(setting, props.schema, intl);
                const helpText = renderSettingHelpText(setting, props.schema, isDisabled(setting));

                if (setting.multiple) {
                    return (
                        <MultiSelectSetting
                            key={props.schema.id + '_language_' + setting.key}
                            id={setting.key}
                            label={label}
                            values={values}
                            helpText={helpText}
                            selected={(state[setting.key] && state[setting.key].split(',')) || []}
                            disabled={isDisabled(setting)}
                            setByEnv={isSetByEnv(setting.key, props.environmentConfig)}
                            onChange={(changedId, value) => handleChange(changedId, value.join(','))}
                            noOptionsMessage={descriptorOrStringToString(setting.no_result, intl)}
                        />
                    );
                }
                return (
                    <DropdownSetting
                        key={props.schema.id + '_language_' + setting.key}
                        id={setting.key}
                        label={label}
                        values={values}
                        helpText={helpText}
                        value={state[setting.key] ?? values[0]?.value}
                        disabled={isDisabled(setting)}
                        setByEnv={isSetByEnv(setting.key, props.environmentConfig)}
                        onChange={handleChange}
                    />
                );
            },
            [Constants.SettingsTypes.TYPE_JOBSTABLE]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || setting.type !== 'jobstable') {
                    return (<></>);
                }

                const helpText = renderSettingHelpText(setting, props.schema, isDisabled(setting));

                return (
                    <JobsTable
                        key={props.schema.id + '_jobstable_' + setting.key}
                        jobType={setting.job_type}
                        getExtraInfoText={setting.render_job}
                        disabled={isDisabled(setting)}
                        createJobButtonText={descriptorOrStringToString(setting.label, intl)}
                        createJobHelpText={helpText}
                    />
                );
            },
            [Constants.SettingsTypes.TYPE_FILE_UPLOAD]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || setting.type !== 'fileupload' || !setting.key) {
                    return (<></>);
                }

                if (state[setting.key]) {
                    const removeFile = (id: string, callback: () => void) => {
                        const successCallback = () => {
                            handleChange(setting.key!, '');
                            setState((prevState) => ({...prevState, [setting.key!]: null, [`${setting.key}Error`]: null}));
                        };
                        const errorCallback = (error: any) => {
                            callback();
                            setState((prevState) => ({...prevState, [setting.key!]: null, [`${setting.key}Error`]: error.message}));
                        };
                        setting.remove_action(successCallback, errorCallback);
                    };

                    const label = renderLabel(setting, props.schema, intl);
                    const helpText = renderSettingHelpText(setting, props.schema, isDisabled(setting));

                    return (
                        <RemoveFileSetting
                            id={props.schema.id}
                            key={props.schema.id + '_fileupload_' + setting.key}
                            label={label}
                            helpText={helpText}
                            removeButtonText={descriptorOrStringToString(setting.remove_button_text, intl)}
                            removingText={descriptorOrStringToString(setting.removing_text, intl)}
                            fileName={state[setting.key]}
                            onSubmit={removeFile}
                            disabled={isDisabled(setting)}
                            setByEnv={isSetByEnv(setting.key, props.environmentConfig)}
                        />
                    );
                }
                const uploadFile = (id: string, file: File, callback: (error?: string) => void) => {
                    const successCallback = (filename: string) => {
                        handleChange(id, filename);
                        setState((prevState) => ({...prevState, [setting.key!]: filename, [`${setting.key}Error`]: null}));
                        if (callback && typeof callback === 'function') {
                            callback();
                        }
                    };
                    const errorCallback = (error: any) => {
                        if (callback && typeof callback === 'function') {
                            callback(error.message);
                        }
                    };
                    setting.upload_action(file, successCallback, errorCallback);
                };

                const label = renderLabel(setting, props.schema, intl);
                const helpText = renderSettingHelpText(setting, props.schema, isDisabled(setting));

                return (
                    <FileUploadSetting
                        id={setting.key}
                        key={props.schema.id + '_fileupload_' + setting.key}
                        label={label}
                        helpText={helpText}
                        uploadingText={descriptorOrStringToString(setting.uploading_text, intl)}
                        disabled={isDisabled(setting)}
                        fileType={setting.fileType}
                        onSubmit={uploadFile}
                        error={state.idpCertificateFileError}
                    />
                );
            },
            [Constants.SettingsTypes.TYPE_ROLES]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || !setting.key || setting.type !== 'roles') {
                    return (<></>);
                }
                const {roles} = props;

                const values = Object.keys(roles).map((r) => {
                    return {
                        value: roles[r].name,
                        text: roles[r].name,
                    };
                });

                const label = renderLabel(setting, props.schema, intl);
                const helpText = renderSettingHelpText(setting, props.schema, isDisabled(setting));

                if (setting.multiple) {
                    const noOptionsMessage = typeof setting.no_result === 'object' ? (
                        <FormattedMessage {...setting.no_result}/>
                    ) : setting.no_result;

                    return (
                        <MultiSelectSetting
                            key={props.schema.id + '_language_' + setting.key}
                            id={setting.key}
                            values={values}
                            label={label}
                            helpText={helpText}
                            selected={(state[setting.key] || emptyList)}
                            disabled={isDisabled(setting)}
                            setByEnv={isSetByEnv(setting.key, props.environmentConfig)}
                            onChange={handleChange}
                            noOptionsMessage={noOptionsMessage}
                        />
                    );
                }
                return (
                    <DropdownSetting
                        key={props.schema.id + '_language_' + setting.key}
                        id={setting.key}
                        values={values}
                        label={label}
                        helpText={helpText}
                        value={state[setting.key] ?? values[0]?.value}
                        disabled={isDisabled(setting)}
                        setByEnv={isSetByEnv(setting.key, props.environmentConfig)}
                        onChange={handleChange}
                    />
                );
            },
            [Constants.SettingsTypes.TYPE_CUSTOM]: (setting: AdminDefinitionSetting) => {
                if (!props.schema || !(setting.type === 'custom')) {
                    return (<></>);
                }

                const label = renderLabel(setting, props.schema, intl);
                const helpText = renderSettingHelpText(setting, props.schema, isDisabled(setting));

                const CustomComponent = setting.component;

                const componentInstance = (
                    <CustomComponent
                        key={props.schema.id + '_custom_' + setting.key}
                        id={setting.key}
                        label={label}
                        helpText={helpText}
                        value={state[setting.key]}
                        disabled={isDisabled(setting)}
                        config={props.config}
                        license={props.license}
                        setByEnv={isSetByEnv(setting.key, props.environmentConfig)}
                        onChange={handleChange}
                        registerSaveAction={registerSaveAction}
                        setSaveNeeded={setSaveNeeded}
                        unRegisterSaveAction={unRegisterSaveAction}
                        cancelSubmit={cancelSubmit}
                        showConfirm={state.showConfirmId === setting.key}
                    />);

                // Show the plugin custom setting title
                // consistently as other settings with the Setting component
                if (setting.showTitle) {
                    return (
                        <Setting
                            label={label}
                            inputId={setting.key}
                            helpText={helpText}
                            key={props.schema.id + '_custom_setting_' + setting.key}
                        >
                            {componentInstance}
                        </Setting>
                    );
                }
                return componentInstance;
            },
        };
    }, [props.schema, props.config, props.environmentConfig, props.license, props.enterpriseReady, props.roles, state, intl, isDisabled, handleChange, handlePermissionChange, registerSaveAction, setSaveNeeded, unRegisterSaveAction, cancelSubmit]);

    const renderTitle = () => {
        if (!props.schema) {
            return '';
        }

        let name: string | MessageDescriptor = props.schema.id;
        if (('name' in props.schema)) {
            name = props.schema.name;
        }

        const betaBadge = props.schema.isBeta && (
            <BetaTag
                variant='default'
                size='sm'
                className='admin-header-beta-badge'
            />
        );

        if (typeof name === 'string') {
            return (
                <AdminHeader>
                    {name}
                    {betaBadge}
                </AdminHeader>
            );
        }

        return (
            <AdminHeader>
                <FormattedMessage
                    {...name}
                />
                {betaBadge}
            </AdminHeader>
        );
    };

    const renderSettings = () => {
        const schema = props.schema;
        if (!schema) {
            return null;
        }

        if ('settings' in schema && schema.settings) {
            const settingsList: React.ReactNode[] = [];
            if (schema.settings) {
                schema.settings.forEach((setting) => {
                    if (buildSettingFunctions[setting.type] && !isHidden(setting)) {
                        settingsList.push(buildSettingFunctions[setting.type](setting));
                    }
                });
            }

            let header;
            if (schema.header) {
                header = (
                    <div className='banner'>
                        <SchemaText
                            text={schema.header}
                            isMarkdown={true}
                        />
                    </div>
                );
            }

            let footer;
            if (schema.footer) {
                footer = (
                    <div className='banner'>
                        <SchemaText
                            text={schema.footer}
                            isMarkdown={true}
                        />
                    </div>
                );
            }

            return (
                <SettingsGroup container={false}>
                    {header}
                    {settingsList}
                    {footer}
                </SettingsGroup>
            );
        } else if ('sections' in schema && schema.sections) {
            const sections: React.ReactNode[] = [];

            schema.sections.forEach((section) => {
                if (isSectionHidden(section)) {
                    return;
                }

                const sectionTitle = descriptorOrStringToString(section.title, intl);

                const settingsList: React.ReactNode[] = [];
                if (section.settings) {
                    section.settings.forEach((setting) => {
                        if (buildSettingFunctions[setting.type] && !isHidden(setting)) {
                            settingsList.push(buildSettingFunctions[setting.type](setting));
                        }
                    });
                }

                if (section.component) {
                    const CustomComponent = section.component;
                    sections.push((
                        <CustomComponent
                            settingsList={settingsList}
                            key={section.key}
                            sectionTitle={sectionTitle}
                            sectionDescription={section.description}
                            {...section.componentProps}
                        />
                    ));
                    return;
                }

                let header;
                if (section.header) {
                    header = (
                        <div className='banner'>
                            <SchemaText
                                text={section.header}
                                isMarkdown={true}
                            />
                        </div>
                    );
                }

                let footer;
                if (section.footer) {
                    footer = (
                        <div className='banner'>
                            <SchemaText
                                text={section.footer}
                                isMarkdown={true}
                            />
                        </div>
                    );
                }

                // This is a bit of special case since designs for plugin config expect the Enable/Disable setting
                // to be on top and out of the sections.
                if (section.key.startsWith('PluginSettings.PluginStates') && section.key.endsWith('Enable.Section')) {
                    sections.push(
                        <SettingsGroup
                            container={false}
                            key={section.key}
                        >
                            {header}
                            {settingsList}
                            {footer}
                        </SettingsGroup>,
                    );

                    return;
                }

                // Sections with enhanced properties use AdminSectionPanel for richer UI
                const hasEnhancedProps = section.description || section.license_sku;

                if (hasEnhancedProps) {
                    sections.push(
                        <AdminSectionPanel
                            key={section.key}
                            title={sectionTitle}
                            description={section.description}
                            licenseSku={section.license_sku}
                        >
                            {header}
                            {settingsList}
                            {footer}
                        </AdminSectionPanel>,
                    );
                } else {
                    // Standard sections use existing rendering
                    sections.push(
                        <div
                            className={'config-section'}
                            key={section.key}
                        >
                            <SettingsGroup
                                show={true}
                                title={sectionTitle}
                                subtitle={section.subtitle}
                            >
                                <div className={'section-body'}>
                                    {header}
                                    {settingsList}
                                    {footer}
                                </div>
                            </SettingsGroup>
                        </div>,
                    );
                }
            });

            return (
                <div>
                    {sections}
                </div>
            );
        }

        return null;
    };

    const hybridSchemaAndComponent = () => {
        const schema = props.schema;
        if (schema && 'component' in schema && schema.component) {
            const CustomComponent = schema.component;
            return (
                <CustomComponent
                    {...props}
                    disabled={props.isDisabled}
                />
            );
        }
        return null;
    };

    const canSave = () => {
        if (!props.schema || !('settings' in props.schema) || !props.schema.settings) {
            return true;
        }

        for (const setting of props.schema.settings) {
            // Some settings are actually not settings (banner)
            // and don't have a key, skip those ones
            if (!('key' in setting) || !setting.key) {
                continue;
            }

            // don't validate elements set by env.
            if (isSetByEnv(setting.key, props.environmentConfig)) {
                continue;
            }

            if ('validate' in setting && setting.validate) {
                if ('isHidden' in setting) {
                    let hidden = false;
                    if (typeof setting.isHidden === 'function') {
                        hidden = setting.isHidden?.(props.config, state, props.license, props.enterpriseReady, props.consoleAccess, props.cloud, props.isCurrentUserSystemAdmin);
                    } else {
                        hidden = Boolean(setting.isHidden);
                    }

                    if (hidden) {
                        continue;
                    }
                }
                const result = setting.validate(state[setting.key]);
                if (!result.isValid()) {
                    return false;
                }
            }
        }

        return true;
    };

    const schema = props.schema;
    if (schema && 'component' in schema && schema.component && (!('settings' in schema))) {
        const CustomComponent = schema.component;
        return (
            <CustomComponent
                {...props}
                disabled={props.isDisabled}
            />
        );
    }

    if (!schema) {
        return (
            <div className={'wrapper--fixed'}>
                <AdminHeader>
                    <FormattedMessage
                        id='error.plugin_not_found.title'
                        defaultMessage='Plugin Not Found'
                    />
                </AdminHeader>
                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <p>
                            <FormattedMessage
                                id='error.plugin_not_found.desc'
                                defaultMessage='The plugin you are looking for does not exist.'
                            />
                        </p>
                        <Link
                            to={'plugin_management'}
                        >
                            <FormattedMessage
                                id='admin.plugin.backToPlugins'
                                defaultMessage='Go back to the Plugins'
                            />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={'wrapper--fixed ' + state.customComponentWrapperClass}
            data-testid={`sysconsole_section_${props.schema.id}`}
        >
            {renderTitle()}
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    <form
                        className='form-horizontal'
                        role='form'
                        onSubmit={handleSubmit}
                    >
                        {renderSettings()}
                    </form>
                    {hybridSchemaAndComponent()}
                </div>
            </div>
            <div className='admin-console-save'>
                <SaveButton
                    saving={state.saving}
                    disabled={!state.saveNeeded || (canSave && !canSave())}
                    onClick={handleSubmit}
                    savingMessage={intl.formatMessage({id: 'admin.saving', defaultMessage: 'Saving Config...'})}
                />
                <WithTooltip
                    title={state?.serverError ?? ''}
                >
                    <div
                        className='error-message'
                        data-testid='errorMessage'
                    >
                        <FormError
                            iconClassName='fa-exclamation-triangle'
                            textClassName='has-warning'
                            error={state.clientWarning}
                        />

                        <FormError error={state.serverError}/>
                    </div>
                </WithTooltip>
            </div>
        </div>
    );
};

export default SchemaAdminSettings;
