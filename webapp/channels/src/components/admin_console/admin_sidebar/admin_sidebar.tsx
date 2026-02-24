// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import type {IntlShape} from 'react-intl';

import type {PluginRedux} from '@workspace/types/plugins';
import type {Team} from '@workspace/types/teams';

import BlockableLink from 'components/admin_console/blockable_link';
import AdminSidebarCategory from 'components/admin_console/admin_sidebar/admin_sidebar_category';
import AdminSidebarSection from 'components/admin_console/admin_sidebar/admin_sidebar_section';
import AdminSidebarHeader from 'components/admin_console/admin_sidebar_header';
import SearchKeywordMarking from 'components/admin_console/search_keyword_marking';
import Scrollbars from 'components/common/scrollbars';
import QuickInput from 'components/quick_input';
import SearchIcon from 'components/widgets/icons/search_icon';
import BackIcon from 'components/widgets/icons/fa_back_icon';

import {adminDefinitionsToUrlsAndTexts, generateIndex} from 'utils/admin_console_index';
import type {Index} from 'utils/admin_console_index';
import {getPluginEntries} from 'utils/admin_console_plugin_index';
import {getHistory} from 'utils/browser_history';

import type AdminDefinition from '../admin_definition';

import type {PropsFromRedux} from './index';

export interface Props extends PropsFromRedux {
    intl: IntlShape;
    onSearchChange: (term: string) => void;
    team: Team | undefined;
    showBackButton: boolean | undefined;
}

type State = {
    sections: string[] | null;
    filter: string;
}

function normalizeArabicText(text: string): string {
    let t = text;
    t = t.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
    t = t.replace(/[\u0622\u0623\u0625]/g, '\u0627');
    t = t.replace(/\u0649/g, '\u064A');
    t = t.replace(/(^|[\s\u200e\u200f])ال(?=[\u0621-\u064A])/g, '$1');
    return t;
}

class AdminSidebar extends React.PureComponent<Props, State> {
    searchRef: React.RefObject<HTMLInputElement>;
    idx: Index | null;

    static defaultProps = {
        plugins: {},
    };

    constructor(props: Props) {
        super(props);
        this.state = {
            sections: null,
            filter: '',
        };
        this.idx = null;
        this.searchRef = React.createRef();
    }

    componentDidMount() {
        if (this.props.config.PluginSettings?.Enable) {
            this.props.actions.getPlugins();
        }

        if (this.searchRef.current && !getHistory().location.hash) {
            // default focus if no other target/hash is specified for auto-focus
            this.searchRef.current.focus();
        }

        this.updateTitle();
    }

    componentDidUpdate(prevProps: Props) {
        if (this.idx !== null &&
            (!isEqual(this.props.plugins, prevProps.plugins) ||
                !isEqual(this.props.adminDefinition, prevProps.adminDefinition) ||
                this.props.intl.locale !== prevProps.intl.locale)) {
            this.idx = generateIndex(this.props.adminDefinition, this.props.intl, this.props.plugins);
        }
    }

    handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filter = e.target.value;
        if (filter === '') {
            this.setState({sections: null, filter});
            this.props.onSearchChange(filter);
            return;
        }

        if (this.idx === null) {
            this.idx = generateIndex(this.props.adminDefinition, this.props.intl, this.props.plugins);
        }
        const isNonLatinQuery = /[^\u0000-\u007f]/.test(filter);

        let query = '';
        for (const term of filter.split(' ')) {
            const trimmedTerm = term.trim();
            if (trimmedTerm !== '') {
                query += trimmedTerm + ' ';
                if (!isNonLatinQuery) {
                    query += trimmedTerm + '* ';
                }
            }
        }

        const trimmedQuery = query.trim();
        let sections = this.idx.search(trimmedQuery);
        if (!sections.length && !isNonLatinQuery) {
            const fallbackQuery = filter.split(' ').map((t) => t.trim()).filter(Boolean).join(' ');
            sections = this.idx.search(fallbackQuery);
        }

        if (isNonLatinQuery) {
            const normalizedFilter = normalizeArabicText(filter);
            if (normalizedFilter && normalizedFilter !== filter) {
                const normalizedQuery = normalizedFilter.split(' ').map((t) => t.trim()).filter(Boolean).join(' ');
                const normalizedSections = this.idx.search(normalizedQuery);
                if (normalizedSections.length) {
                    sections = Array.from(new Set([...sections, ...normalizedSections]));
                }
            }

            if (!sections.length) {
                const entries = {
                    ...adminDefinitionsToUrlsAndTexts(this.props.adminDefinition, this.props.intl),
                    ...getPluginEntries(this.props.plugins, this.props.intl),
                };

                const needleRaw = filter.trim().toLowerCase();
                const needleNorm = normalizeArabicText(filter).trim().toLowerCase();

                const manualMatches: string[] = [];
                for (const [url, texts] of Object.entries(entries)) {
                    const raw = texts.map((t) => (Array.isArray(t) ? t.join(' ') : t)).join(' ');
                    const hayRaw = raw.toLowerCase();
                    const hayNorm = normalizeArabicText(raw).toLowerCase();

                    if (needleRaw && (hayRaw.includes(needleRaw) || hayNorm.includes(needleRaw))) {
                        manualMatches.push(url);
                        continue;
                    }

                    if (needleNorm && (hayRaw.includes(needleNorm) || hayNorm.includes(needleNorm))) {
                        manualMatches.push(url);
                    }
                }

                if (manualMatches.length) {
                    sections = manualMatches;
                }
            }
        }
        this.setState({sections, filter});
        this.props.onSearchChange(filter);

        if (this.props.navigationBlocked) {
            return;
        }

        const validSection = sections.indexOf(getHistory().location.pathname.replace('/admin_console/', '')) !== -1;
        if (!validSection) {
            const visibleSections = this.visibleSections();
            for (const section of sections) {
                if (visibleSections.has(section)) {
                    getHistory().replace('/admin_console/' + section);
                    break;
                }
            }
        }
    };

    updateTitle = () => {
        let currentSiteName = '';
        if (this.props.siteName) {
            currentSiteName = ' - ' + this.props.siteName;
        }

        document.title = this.props.intl.formatMessage({id: 'sidebar_right_menu.console', defaultMessage: 'System Console'}) + currentSiteName;
    };

    visibleSections = () => {
        const {config, license, buildEnterpriseReady, consoleAccess, adminDefinition, cloud} = this.props;
        const isVisible = (item: any) => {
            if (!item.schema) {
                return false;
            }

            if (!item.title) {
                return false;
            }

            if (item.isHidden && item.isHidden(config, this.state, license, buildEnterpriseReady, consoleAccess, cloud)) {
                return false;
            }
            return true;
        };
        const result = new Set();
        for (const section of Object.values(adminDefinition)) {
            for (const item of Object.values(section.subsections)) {
                if (isVisible(item)) {
                    result.add(item.url);
                }
            }
        }
        return result;
    };

    renderRootMenu = (definition: typeof AdminDefinition) => {
        const {config, license, buildEnterpriseReady, consoleAccess, cloud, subscriptionProduct} = this.props;
        const sidebarSections: JSX.Element[] = [];
        Object.entries(definition).forEach(([key, section]) => {
            let isSectionHidden = false;
            if (section.isHidden) {
                isSectionHidden = typeof section.isHidden === 'function' ? section.isHidden(config, this.state, license, buildEnterpriseReady, consoleAccess, cloud) : Boolean(section.isHidden);
            }
            if (!isSectionHidden) {
                const sidebarItems: JSX.Element[] = [];
                Object.entries(section.subsections).forEach(([subKey, item]) => {
                    if (!item.title) {
                        return;
                    }

                    if (item.isHidden) {
                        if (typeof item.isHidden === 'function' ? item.isHidden(config, this.state, license, buildEnterpriseReady, consoleAccess, cloud) : Boolean(item.isHidden)) {
                            return;
                        }
                    }

                    if (this.state.sections !== null) {
                        let active = false;
                        for (const url of this.state.sections) {
                            if (url === item.url) {
                                active = true;
                            }
                        }
                        if (!active) {
                            return;
                        }
                    }
                    const subDefinitionKey = `${key}.${subKey}`;
                    sidebarItems.push((
                        <AdminSidebarSection
                            key={subDefinitionKey}
                            definitionKey={subDefinitionKey}
                            name={item.url}
                            restrictedIndicator={item.restrictedIndicator?.shouldDisplay(license, subscriptionProduct) ? item.restrictedIndicator.value(cloud) : undefined}
                            title={typeof item.title === 'string' ? item.title : (
                                <FormattedMessage
                                    {...item.title}
                                />
                            )}
                        />
                    ));
                });

                // Special case for plugins entries
                if ((section as typeof AdminDefinition['plugins']).id === 'plugins') {
                    const sidebarPluginItems = this.renderPluginsMenu();
                    sidebarItems.push(...sidebarPluginItems);
                }

                // If no visible items, don't display this section
                if (sidebarItems.length === 0) {
                    return null;
                }

                sidebarSections.push((
                    <AdminSidebarCategory
                        key={key}
                        definitionKey={key}
                        parentLink='/admin_console'
                        icon={section.icon}
                        sectionClass=''
                        title={typeof section.sectionTitle === 'string' ? section.sectionTitle : (
                            <FormattedMessage
                                {...section.sectionTitle}
                            />
                        )}
                    >
                        {sidebarItems}
                    </AdminSidebarCategory>
                ));
            }
            return null;
        });
        return sidebarSections;
    };

    isPluginPresentInSections = (plugin: PluginRedux) => {
        return this.state.sections && this.state.sections.indexOf(`plugin_${plugin.id}`) >= 0;
    };

    renderPluginsMenu = () => {
        const {config, plugins} = this.props;
        if (config.PluginSettings?.Enable && plugins) {
            return Object.values(plugins).sort((a, b) => {
                const nameCompare = a.name.localeCompare(b.name);
                if (nameCompare !== 0) {
                    return nameCompare;
                }

                return a.id.localeCompare(b.id);
            }).
                filter((plugin) => this.state.sections === null || this.isPluginPresentInSections(plugin)).
                map((plugin) => {
                    return (
                        <AdminSidebarSection
                            key={'customplugin' + plugin.id}
                            name={'plugins/plugin_' + plugin.id}
                            title={plugin.name}
                        />
                    );
                });
        }

        return [];
    };

    handleClearFilter = () => {
        this.setState({sections: null, filter: ''});
        this.props.onSearchChange('');
    };

    render() {
        const {showTaskList} = this.props;

        const shouldShowBackButton = Boolean(this.props.showBackButton);
        const teamExists = this.props.team?.delete_at === 0;
        const backTo = `/${teamExists ? this.props.team?.name : ''}`;
        const backToLabel = this.props.team?.display_name || this.props.team?.name;
        const backButton = shouldShowBackButton ? (
            <div className='admin-sidebar__footer'>
                <BlockableLink
                    className='admin-sidebar__back'
                    to={backTo}
                >
                    <BackIcon/>
                    <span>
                        {teamExists ? (
                            <FormattedMessage
                                id='backstage_navbar.backToWorkspace'
                                defaultMessage='Back to {siteName}'
                                values={{siteName: backToLabel}}
                            />
                        ) : (
                            <FormattedMessage
                                id='backstage_navbar.back'
                                defaultMessage='Back'
                            />
                        )}
                    </span>
                </BlockableLink>
            </div>
        ) : null;

        return (
            <div className='admin-sidebar'>
                <AdminSidebarHeader/>
                <div className='filter-container'>
                    <SearchIcon
                        className='search__icon'
                        aria-hidden='true'
                    />
                    <QuickInput
                        className={'filter ' + (this.state.filter ? 'active' : '')}
                        type='text'
                        onChange={this.handleSearchChange}
                        value={this.state.filter}
                        placeholder={this.props.intl.formatMessage({id: 'admin.sidebar.filter', defaultMessage: 'Find settings'})}
                        ref={this.searchRef}
                        id='adminSidebarFilter'
                        clearable={true}
                        onClear={this.handleClearFilter}
                    />
                </div>
                {shouldShowBackButton ? (
                    <div className='admin-sidebar__scroll'>
                        <Scrollbars>
                            <div className='nav-pills__container'>
                                <SearchKeywordMarking keyword={this.state.filter}>
                                    <ul className={classNames('nav nav-pills nav-stacked', {'task-list-shown': showTaskList})}>
                                        {this.renderRootMenu(this.props.adminDefinition)}
                                    </ul>
                                </SearchKeywordMarking>
                            </div>
                        </Scrollbars>
                    </div>
                ) : (
                    <Scrollbars>
                        <div className='nav-pills__container'>
                            <SearchKeywordMarking keyword={this.state.filter}>
                                <ul className={classNames('nav nav-pills nav-stacked', {'task-list-shown': showTaskList})}>
                                    {this.renderRootMenu(this.props.adminDefinition)}
                                </ul>
                            </SearchKeywordMarking>
                        </div>
                    </Scrollbars>
                )}
                {backButton}
            </div>
        );
    }
}

export default injectIntl(AdminSidebar);
