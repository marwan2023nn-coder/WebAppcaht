// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import type {ReactNode, MouseEvent} from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import type {CloudUsage} from '@workspace/types/cloud';
import type {Team} from '@workspace/types/teams';

import {Permissions} from 'workspace-redux/constants';
import type {ActionResult} from 'workspace-redux/types/actions';

import AnnouncementBar from 'components/announcement_bar';
import BackButton from 'components/common/back_button';
import InfiniteScroll from 'components/common/infinite_scroll';
import SiteNameAndDescription from 'components/common/site_name_and_description';
import LoadingScreen from 'components/loading_screen';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import SearchSuggestionList from 'components/suggestion/search_suggestion_list';
import SuggestionBox from 'components/suggestion/suggestion_box';

import logoImage from 'images/logo.png';
import Constants from 'utils/constants';
import * as UserAgent from 'utils/user_agent';

import SelectTeamItem from './components/select_team_item';

import './select_team.scss';

export const TEAMS_PER_PAGE = 30;
const TEAM_MEMBERSHIP_DENIAL_ERROR_ID = 'api.team.add_members.user_denied';
type Actions = {
    getTeams: (page?: number, perPage?: number, includeTotalCount?: boolean) => Promise<ActionResult<unknown>>;
    loadRolesIfNeeded: (roles: Iterable<string>) => void;
    addUserToTeam: (teamId: string, userId: string) => Promise<ActionResult<unknown>>;
}

type Props = {
    currentUserId: string;
    currentUserRoles: string;
    currentUserIsGuest?: boolean;
    customDescriptionText?: string;
    isMemberOfTeam: boolean;
    listableTeams: Team[];
    siteName?: string;
    canCreateTeams: boolean;
    canManageSystem: boolean;
    canJoinPublicTeams: boolean;
    canJoinPrivateTeams: boolean;
    history?: any;
    actions: Actions;
    totalTeamsCount: number;
    isCloud: boolean;
    isFreeTrial: boolean;
    usageDeltas: CloudUsage;
};

type State = {
    loadingTeamId?: string;
    error: any;
    endofTeamsData: boolean;
    currentPage: number;
    searchQuery: string;
    currentListableTeams: Team[];
    filteredTeams: Team[];
    isTeamSearchFocused: boolean;
}

export default class SelectTeam extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            filteredTeams: [],
            loadingTeamId: '',
            error: null,
            endofTeamsData: false,
            currentPage: 0,
            searchQuery: '',
            currentListableTeams: [],
            isTeamSearchFocused: false,
        };
    }

    handleTeamSearchFocus = () => {
        this.setState({isTeamSearchFocused: true});
    };

    handleTeamSearchBlur = () => {
        this.setState({isTeamSearchFocused: false});
    };

    handleTeamSearchClear = () => {
        this.setState({searchQuery: ''}, () => {
            this.filterTeams('');
        });
    };
    handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const searchQuery = e.target.value;
        this.setState({searchQuery}, () => {
            this.filterTeams(searchQuery);
        });
    };
    filterTeams = (query: string): void => {
        const {listableTeams} = this.props;
        const filteredTeams = query.trim() ? listableTeams.filter((team) =>
            team.display_name.toLowerCase().includes(query.toLowerCase()) ||
                team.name.toLowerCase().includes(query.toLowerCase()),
        ) : listableTeams;

        this.setState({
            filteredTeams,
            currentPage: 0,
            currentListableTeams: query.trim() ? filteredTeams.slice(0, TEAMS_PER_PAGE) : this.props.listableTeams.slice(0, TEAMS_PER_PAGE),
        });
    };
    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.listableTeams.length !== state.currentListableTeams.length) {
            return {
                currentListableTeams: props.listableTeams.slice(0, TEAMS_PER_PAGE * (state.currentPage + 1)),
            };
        }
        return null;
    }

    componentDidMount() {
        this.fetchMoreTeams();
        if (this.props.currentUserRoles !== undefined) {
            this.props.actions.loadRolesIfNeeded(this.props.currentUserRoles.split(' '));
        }
    }

    fetchMoreTeams = async () => {
        const {currentPage} = this.state;
        const {actions} = this.props;

        const response = await actions.getTeams(currentPage, TEAMS_PER_PAGE, true);

        // We don't want to increase the page number if no data came back previously
        if (!response.error && !(response.error instanceof Error)) {
            this.setState((prevState) => (
                {
                    currentPage: prevState.currentPage + 1,
                }
            ),
            );
        }
    };

    handleTeamClick = async (team: Team) => {
        const {currentUserRoles} = this.props;
        this.setState({loadingTeamId: team.id});

        const {data, error} = await this.props.actions.addUserToTeam(team.id, this.props.currentUserId);
        if (data && this.props.history !== undefined) {
            this.props.history.push(`/${team.name}/channels/${Constants.DEFAULT_CHANNEL}`);
        } else if (error) {
            let errorMsg = error.message;

            if (error.server_error_id === TEAM_MEMBERSHIP_DENIAL_ERROR_ID) {
                if (currentUserRoles !== undefined && currentUserRoles.includes(Constants.PERMISSIONS_SYSTEM_ADMIN)) {
                    errorMsg = (
                        <FormattedMessage
                            id='join_team_group_constrained_denied_adminText'
                            defaultMessage={'You need to be a member of a linked group to join this team. You can add a group to this team <a>here</a>.'}
                            values={{
                                a: (chunks) => (
                                    <Link to='/admin_console/user_management/groups'>
                                        {chunks}
                                    </Link>
                                ),
                            }}
                        />
                    );
                } else {
                    errorMsg = (
                        <FormattedMessage
                            id='join_team_group_constrained_denied'
                            defaultMessage='You need to be a member of a linked group to join this team.'
                        />
                    );
                }
            }

            this.setState({
                error: errorMsg,
                loadingTeamId: '',
            });
        }
    };

    clearError = (e: MouseEvent): void => {
        e.preventDefault();

        this.setState({
            error: null,
        });
    };

    handleBackClick = (e: MouseEvent): void => {
        e.preventDefault();

        if (this.state.error) {
            this.setState({
                error: null,
            });
            return;
        }

        if (this.props.history?.push) {
            this.props.history.push('/');
            return;
        }

        window.location.assign('/');
    };

    render(): ReactNode {
        const {currentPage, currentListableTeams, searchQuery, filteredTeams} = this.state;
        const {
            currentUserIsGuest,
            canManageSystem,
            customDescriptionText,
            isMemberOfTeam,
            siteName,
            canCreateTeams,
            canJoinPublicTeams,
            canJoinPrivateTeams,
            totalTeamsCount,
            isCloud,
            isFreeTrial,
            usageDeltas: {
                teams: {
                    active: usageDeltaTeams,
                },
            },
        } = this.props;

        const teamsLimitReached = usageDeltaTeams >= 0;
        const createTeamRestricted = isCloud && !isFreeTrial && teamsLimitReached;

        let openContent;
        if (this.state.loadingTeamId) {
            openContent = <LoadingScreen/>;
        } else if (this.state.error) {
            openContent = (
                <div className='signup__content'>
                    <div className={'form-group has-error'}>
                        <div className='control-label'>{this.state.error}</div>
                    </div>
                </div>
            );
        } else if (currentUserIsGuest) {
            openContent = (
                <div className='signup__content'>
                    <div className={'form-group has-error'}>
                        <div className='control-label'>
                            <FormattedMessage
                                id='signup_team.guest_without_channels'
                                defaultMessage='Your guest account has no channels assigned. Please contact an administrator.'
                            />
                        </div>
                    </div>
                </div>
            );
        } else {
            let joinableTeamContents: any = [];
            const teamsToUse = searchQuery.trim() ? filteredTeams : currentListableTeams;
            teamsToUse.forEach((listableTeam) => {
                const canJoinBasedOnType = (listableTeam.allow_open_invite && canJoinPublicTeams) || (!listableTeam.allow_open_invite && canJoinPrivateTeams);

                // Skip group-constrained teams as they will fail to join and show error
                if (canJoinBasedOnType && !listableTeam.group_constrained) {
                    joinableTeamContents.push(
                        <SelectTeamItem
                            key={'team_' + listableTeam.name}
                            team={listableTeam}
                            onTeamClick={this.handleTeamClick}
                            loading={this.state.loadingTeamId === listableTeam.id}
                            canJoinPublicTeams={canJoinPublicTeams}
                            canJoinPrivateTeams={canJoinPrivateTeams}
                        />,
                    );
                }
            });

            if (joinableTeamContents.length === 0 && (canCreateTeams || canManageSystem)) {
                joinableTeamContents = (
                    <div className='signup-team-dir-err'>
                        <div>
                            {createTeamRestricted ? (
                                <FormattedMessage
                                    id='signup_team.no_open_teams'
                                    defaultMessage='No teams are available to join. Please ask your administrator for an invite.'
                                />
                            ) : (
                                <FormattedMessage
                                    id='signup_team.no_open_teams_canCreate'
                                    defaultMessage='No teams are available to join. Please create a new team or ask your administrator for an invite.'
                                />
                            )}
                        </div>
                    </div>
                );
            } else if (joinableTeamContents.length === 0) {
                joinableTeamContents = (
                    <div className='signup-team-dir-err'>
                        <div>
                            <SystemPermissionGate permissions={[Permissions.CREATE_TEAM]}>
                                <FormattedMessage
                                    id='signup_team.no_open_teams_canCreate'
                                    defaultMessage='No teams are available to join. Please create a new team or ask your administrator for an invite.'
                                />
                            </SystemPermissionGate>
                            <SystemPermissionGate
                                permissions={[Permissions.CREATE_TEAM]}
                                invert={true}
                            >
                                <FormattedMessage
                                    id='signup_team.no_open_teams'
                                    defaultMessage='No teams are available to join. Please ask your administrator for an invite.'
                                />
                            </SystemPermissionGate>
                        </div>
                    </div>
                );
            }
            const teamSignUp = !createTeamRestricted && (
                <SystemPermissionGate permissions={[Permissions.CREATE_TEAM]}>
                    <Link
                        id='createNewTeamLink'
                        to='/create_team'
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='login.createTeam'
                            defaultMessage='Create a team'
                        />
                    </Link>
                </SystemPermissionGate>
            );
            openContent = (
                <div
                    id='teamsYouCanJoinContent'
                    className='signup__content'
                >
                    <div className='SelectTeam__bottomSection'>
                        <div className='SelectTeam__search-row'>
                            <div className='search-form__container'>
                                <form
                                    role='search'
                                    className={classNames(['search__form', {'search__form--focused team': this.state.isTeamSearchFocused}])}
                                    onSubmit={(e) => e.preventDefault()}
                                    autoComplete='off'
                                    aria-labelledby='selectTeamSearchBox'
                                >
                                    <div className='search__font-icon'>
                                        <i className='icon icon-magnify icon-16'/>
                                    </div>
                                    <SuggestionBox
                                        id='selectTeamSearchBox'
                                        className={'search-bar search-bar-team form-control a11y__region'}
                                        containerClass='w-full'
                                        placeholder='ابحث عن فريق...'
                                        value={searchQuery}
                                        onChange={this.handleSearchChange}
                                        onFocus={this.handleTeamSearchFocus}
                                        onBlur={this.handleTeamSearchBlur}
                                        listComponent={SearchSuggestionList}
                                        providers={[]}
                                        type='search'
                                        clearable={true}
                                        onClear={this.handleTeamSearchClear}
                                    />
                                </form>
                            </div>
                            <div className='SelectTe'>
                                {teamSignUp}
                            </div>
                        </div>

                        <div className='SelectTeam__listCard'>
                            <InfiniteScroll
                                callBack={this.fetchMoreTeams}
                                styleClass='signup-team-all'
                                totalItems={totalTeamsCount}
                                itemsPerPage={TEAMS_PER_PAGE}
                                bufferValue={280}
                                pageNumber={currentPage}
                                loaderStyle={{padding: '0px', height: '40px'}}
                            >
                                {joinableTeamContents}
                            </InfiniteScroll>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div>
                <AnnouncementBar/>
                <div className='col-sm-12'>
                    <div
                        className={'select-team__container signup-team__container'}
                    >
                        <div
                            className='card-select-team'
                        >
                            <div className='SelectTeam__pageHeader'>
                                {(this.state.error || isMemberOfTeam) && (
                                    <a
                                        href='#'
                                        className='SelectTeam__back'
                                        onClick={this.handleBackClick}
                                    >
                                        <span className='fa fa-angle-right'/>
                                    </a>
                                )}
                                <div className='name'>
                                    <h1 id='site_name'>
                                        المجتمعات
                                    </h1>
                                    <h3
                                        id='site_description'
                                        className='color--light'
                                    >
                                        {customDescriptionText || (
                                            <FormattedMessage
                                                id='web.root.signup_info'
                                                defaultMessage='All team communication in one place, searchable and accessible anywhere'
                                            />
                                        )}
                                    </h3>
                                </div>
                            </div>
                            {openContent}
                            <img
                                alt={'signup team logo'}
                                className='signup-team-logo'
                                src={logoImage}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
