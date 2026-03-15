// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {RefObject} from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import type {IntlShape} from 'react-intl';
import ReactSelect from 'react-select';
import type {OnChangeValue, StylesConfig} from 'react-select';

import type {PreferencesType, PreferenceType} from '@workspace/types/preferences';

import {Preferences} from 'workspace-redux/constants';
import type {ActionResult} from 'workspace-redux/types/actions';

import Constants from 'utils/constants';

import SettingItemMax from 'components/setting_item_max';
import SettingItemMin from 'components/setting_item_min';
import type SettingItemMinComponent from 'components/setting_item_min';

type Limit = {
    value: number;
    label: string;
};

export type OwnProps = {
    adminMode?: boolean;
    userId: string;
    userPreferences?: PreferencesType;
}

type Props = OwnProps & {
    active: boolean;
    areAllSectionsInactive: boolean;
    savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<ActionResult>;
    dmGmLimit: number;
    updateSection: (section: string) => void;
    intl: IntlShape;
}

type State = {
    active: boolean;
    limit: Limit;
    isSaving: boolean;
}

const getLimits = (intl: IntlShape): Limit[] => [
    {value: 10, label: '10'},
    {value: 15, label: '15'},
    {value: 20, label: '20'},
    {value: 40, label: '40'},
    {
        value: Constants.HIGHEST_DM_SHOW_COUNT,
        label: intl.formatMessage({
            id: 'channel_notifications.levels.all',
            defaultMessage: 'All',
        }),
    },
];

class LimitVisibleGMsDMs extends React.PureComponent<Props, State> {
    minRef: RefObject<SettingItemMinComponent>;

    constructor(props: Props) {
        super(props);

        this.state = {
            active: false,
            limit: {value: 20, label: '20'},
            isSaving: false,
        };

        this.minRef = React.createRef();
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        const limits = getLimits(props.intl);
        if (props.active !== state.active) {
            if (props.active && !state.active) {
                return {
                    limit: limits.find((l) => l.value === props.dmGmLimit),
                    active: props.active,
                };
            }

            return {
                active: props.active,
            };
        } else if (!props.active) {
            return {
                limit: limits.find((l) => l.value === props.dmGmLimit),
            };
        }

        return null;
    }

    focusEditButton(): void {
        this.minRef.current?.focus();
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.active && !this.props.active && this.props.areAllSectionsInactive) {
            this.focusEditButton();
        }
    }

    handleChange = (selected: OnChangeValue<Limit, boolean>) => {
        if (selected && 'value' in selected) {
            this.setState({limit: selected});
        }
    };

    handleSubmit = async () => {
        if (!this.props.userId) {
            return;
        }

        this.setState({isSaving: true});

        await this.props.savePreferences(this.props.userId, [{
            user_id: this.props.userId,
            category: Preferences.CATEGORY_SIDEBAR_SETTINGS,
            name: Preferences.LIMIT_VISIBLE_DMS_GMS,
            value: this.state.limit.value.toString(),
        }]);

        this.setState({isSaving: false});

        this.props.updateSection('');
    };

    renderDescription = () => {
        return (
            <span>{this.state.limit.label}</span>
        );
    };

    render() {
        const title = (
            <FormattedMessage
                id='user.settings.sidebar.limitVisibleGMsDMsTitle'
                defaultMessage='Number of direct messages to show'
            />
        );

        if (!this.props.active) {
            return (
                <SettingItemMin
                    title={title}
                    describe={this.renderDescription()}
                    section='limitVisibleGMsDMs'
                    updateSection={this.props.updateSection}
                    ref={this.minRef}
                />
            );
        }

        return (
            <SettingItemMax
                title={title}
                inputs={
                    <fieldset>
                        <legend className='form-legend hidden-label'>
                            {title}
                        </legend>
                        <ReactSelect
                            className='react-select'
                            classNamePrefix='react-select'
                            id='limitVisibleGMsDMs'
                            options={getLimits(this.props.intl)}
                            isClearable={false}
                            onChange={this.handleChange}
                            value={this.state.limit}
                            isSearchable={false}
                            menuPortalTarget={document.body}
                            styles={reactStyles}
                        />
                        <div className='mt-5'>
                            <FormattedMessage
                                id='user.settings.sidebar.limitVisibleGMsDMsDesc'
                                defaultMessage='You can also change these settings in the direct messages sidebar menu.'
                            />
                        </div>
                    </fieldset>
                }
                submit={this.handleSubmit}
                saving={this.state.isSaving}
                updateSection={this.props.updateSection}
            />
        );
    }
}

export default injectIntl(LimitVisibleGMsDMs);

const reactStyles = {
    menuPortal: (provided) => ({
        ...provided,
        zIndex: 9999,
    }),
} satisfies StylesConfig<Limit, boolean>;
