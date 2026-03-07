// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {autoUpdate, useClick, useDismiss, useFloating, useInteractions, useRole, FloatingFocusManager, useTransitionStyles, autoPlacement, offset} from '@floating-ui/react';
import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {setAdminConsoleUsersManagementTableProperties} from 'actions/views/admin';

import {StyledPopoverContainer} from 'components/styled_popover_container';

import type {AdminConsoleUserManagementTableProperties} from 'types/store/views';

import {SystemUsersFiltersStatus} from './styled_users_filters_status';
import {SystemUsersFilterRole} from './system_users_filter_role';
import {SystemUsersFilterTeam} from './system_users_filter_team';
import {SystemUsersFilterSort} from './system_users_filter_sort';

import './system_users_filter_popover.scss';
import {RoleFilters, StatusFilter, TeamFilters} from '../constants';

type FiltersState = Partial<Pick<AdminConsoleUserManagementTableProperties, 'filterTeam' | 'filterTeamLabel' | 'filterRole' | 'filterStatus' | 'sortOrder'>>;

interface Props {
    filterTeam: AdminConsoleUserManagementTableProperties['filterTeam'];
    filterTeamLabel: AdminConsoleUserManagementTableProperties['filterTeamLabel'];
    filterRole: AdminConsoleUserManagementTableProperties['filterRole'];
    filterStatus: AdminConsoleUserManagementTableProperties['filterStatus'];
    sortOrder: AdminConsoleUserManagementTableProperties['sortOrder'];
}

export function SystemUsersFilterPopover(props: Props) {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();

    const [isPopoverOpen, setPopoverOpen] = useState(false);

    const [filterState, setFilterState] = useState<FiltersState>({});

    const {context: floatingContext, refs: floatingRefs, floatingStyles} = useFloating({
        open: isPopoverOpen,
        onOpenChange: setPopoverOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(10),
            autoPlacement({
                allowedPlacements: ['bottom-start', 'top-start'],
            }),
        ],
    });
    const {isMounted, styles: floatingTransistionStyles} = useTransitionStyles(floatingContext);
    const floatingContextClick = useClick(floatingContext);
    const floatingContextDismiss = useDismiss(floatingContext);
    const floatingContextRole = useRole(floatingContext);
    const {getReferenceProps, getFloatingProps} = useInteractions([
        floatingContextClick,
        floatingContextDismiss,
        floatingContextRole,
    ]);

    function handleTeamFilterChange(teamFilter: string, teamFilterLabel?: string) {
        let filterTeam;
        let filterTeamLabel;
        if (teamFilter === TeamFilters.AllTeams) {
            filterTeam = '';
            filterTeamLabel = '';
        } else if (teamFilter === TeamFilters.NoTeams) {
            filterTeam = TeamFilters.NoTeams;
            filterTeamLabel = '';
        } else {
            filterTeam = teamFilter;

            // We need to set the label for selected team,
            // since we might not have the selected team label in the list of teams when we are navigating back from the user details page.
            filterTeamLabel = teamFilterLabel;
        }

        setFilterState({...filterState, filterTeam, filterTeamLabel});
    }

    function handleRoleFilterChange(roleFilter: string) {
        let filterRole = '';
        if (roleFilter === RoleFilters.Admin) {
            filterRole = RoleFilters.Admin;
        } else if (roleFilter === RoleFilters.Member) {
            filterRole = RoleFilters.Member;
        } else if (roleFilter === RoleFilters.Guest) {
            filterRole = RoleFilters.Guest;
        }

        setFilterState({...filterState, filterRole});
    }

    function handleStatusFilterChange(statusFilter: string) {
        let filterStatus = '';
        if (statusFilter === StatusFilter.Active) {
            filterStatus = 'active';
        } else if (statusFilter === StatusFilter.Deactivated) {
            filterStatus = 'deactivated';
        }

        setFilterState({...filterState, filterStatus});
    }

    function handleSortOrderChange(sortOrder: AdminConsoleUserManagementTableProperties['sortOrder']) {
        setFilterState({...filterState, sortOrder});
    }

    function handleApplyFilters() {
        dispatch(setAdminConsoleUsersManagementTableProperties(filterState));
        setPopoverOpen(false);
    }

    const filterStatusApplied = props.filterStatus.length > 0 ? 1 : 0;
    const filterRoleApplied = props.filterRole.length > 0 ? 1 : 0;
    const filterTeamApplied = props.filterTeam.length > 0 ? 1 : 0;
    const sortApplied = props.sortOrder !== '' ? 1 : 0;
    const filtersCount = filterStatusApplied + filterRoleApplied + filterTeamApplied + sortApplied;

    return (
        <div className='systemUsersFilterContainer'>
            <button
                {...getReferenceProps()}
                ref={floatingRefs.setReference}
                className='btn btn-md btn-tertiary'
                aria-controls='systemUsersFilterPopover'
            >
                <i className='icon icon-filter-variant'/>
                {formatMessage({id: 'admin.system_users.filtersMenu', defaultMessage: 'Filters ({count})'}, {count: filtersCount})}
            </button>
            {isMounted && (
                <FloatingFocusManager
                    context={floatingContext}
                >
                    <StyledPopoverContainer
                        {...getFloatingProps()}
                        id='systemUsersFilterPopover'
                        ref={floatingRefs.setFloating}
                        style={Object.assign({}, floatingStyles, floatingTransistionStyles)}
                        className='systemUsersFilterPopoverContainer'
                        aria-labelledby='header'
                    >
                        <h4 id='header'>
                            {formatMessage({id: 'admin.system_users.filtersPopover.title', defaultMessage: 'Filter by'})}
                        </h4>
                        <div className='body'>
                            <SystemUsersFilterTeam
                                initialValue={props.filterTeam}
                                initialLabel={props.filterTeamLabel}
                                onChange={handleTeamFilterChange}
                            />
                            <SystemUsersFilterRole
                                initialValue={props.filterRole}
                                onChange={handleRoleFilterChange}
                            />
                            <SystemUsersFiltersStatus
                                initialValue={props.filterStatus}
                                onChange={handleStatusFilterChange}
                            />
                            <SystemUsersFilterSort
                                initialValue={props.sortOrder}
                                onChange={handleSortOrderChange}
                            />
                        </div>
                        <div className='footer'>
                            <button
                                className='btn btn-md btn-primary'
                                onClick={handleApplyFilters}
                                type='submit'
                            >
                                {formatMessage({id: 'admin.system_users.filtersPopover.apply', defaultMessage: 'Apply'})}
                            </button>
                        </div>
                    </StyledPopoverContainer>
                </FloatingFocusManager>
            )}
        </div>
    );
}
