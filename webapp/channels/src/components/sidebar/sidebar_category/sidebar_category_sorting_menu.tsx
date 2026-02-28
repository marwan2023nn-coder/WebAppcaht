// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {memo, useState} from 'react';
import type {MouseEvent, KeyboardEvent} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {
    SortAlphabeticalAscendingIcon,
    ClockOutlineIcon,
    AccountMultipleOutlineIcon,
    AccountPlusOutlineIcon,
    DotsVerticalIcon,
    ChevronRightIcon,
    CheckIcon,
} from '@workspace/compass-icons/components';
import type {ChannelCategory} from '@workspace/types/channel_categories';
import {CategorySorting} from '@workspace/types/channel_categories';

import {setCategorySorting} from 'workspace-redux/actions/channel_categories';
import {savePreferences} from 'workspace-redux/actions/preferences';
import {Preferences} from 'workspace-redux/constants';
import {get as getPreference, getVisibleDmGmLimit} from 'workspace-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'workspace-redux/selectors/entities/users';
import type {GlobalState} from '@workspace/types/store';

import * as Menu from 'components/menu';

import Constants from 'utils/constants';

type Props = {
    category: ChannelCategory;
    handleOpenDirectMessagesModal: (e: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>) => void;
};

const SidebarCategorySortingMenu = ({
    category,
    handleOpenDirectMessagesModal,
}: Props) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const {formatMessage} = useIntl();

    const dispatch = useDispatch();
    const selectedDmNumber = useSelector(getVisibleDmGmLimit);
    const currentUserId = useSelector(getCurrentUserId);
    const selectedStatusFilter = useSelector((state: GlobalState) => getPreference(state, Preferences.CATEGORY_SIDEBAR_SETTINGS, 'dm_gm_status_filter', 'all'));

    function handleSortDirectMessages(sorting: CategorySorting) {
        dispatch(setCategorySorting(category.id, sorting));
    }

    let sortDirectMessagesIcon = <ClockOutlineIcon size={18}/>;
    let sortDirectMessagesSelectedValue = (
        <FormattedMessage
            id='user.settings.sidebar.recent'
            defaultMessage='Recent Activity'
        />
    );
    if (category.sorting === CategorySorting.Alphabetical) {
        sortDirectMessagesSelectedValue = (
            <FormattedMessage
                id='user.settings.sidebar.sortAlpha'
                defaultMessage='Alphabetically'
            />
        );
        sortDirectMessagesIcon = <SortAlphabeticalAscendingIcon size={18}/>;
    }

    const sortDirectMessagesMenuItem = (
        <Menu.SubMenu
            id={`sortDirectMessages-${category.id}`}
            leadingElement={sortDirectMessagesIcon}
            labels={(
                <FormattedMessage
                    id='sidebar.sort'
                    defaultMessage='Sort'
                />
            )}
            trailingElements={
                <>
                    {sortDirectMessagesSelectedValue}
                    <ChevronRightIcon size={16} className='chevron-right' />
                </>
            }
            menuId={`sortDirectMessages-${category.id}-menu`}
        >
            <Menu.Item
                id={`sortAlphabetical-${category.id}`}
                labels={(
                    <FormattedMessage
                        id='user.settings.sidebar.sortAlpha'
                        defaultMessage='Alphabetically'
                    />
                )}
                onClick={() => handleSortDirectMessages(CategorySorting.Alphabetical)}
                trailingElements={category.sorting === CategorySorting.Alphabetical ? <CheckIcon size={16}/> : null}
            />
            <Menu.Item
                id={`sortByMostRecent-${category.id}`}
                labels={(
                    <FormattedMessage
                        id='sidebar.sortedByRecencyLabel'
                        defaultMessage='Recent Activity'
                    />
                )}
                onClick={() => handleSortDirectMessages(CategorySorting.Recency)}
                trailingElements={category.sorting === CategorySorting.Recency ? <CheckIcon size={16}/> : null}
            />
        </Menu.SubMenu>

    );

    function handlelimitVisibleDMsGMs(number: number) {
        dispatch(savePreferences(currentUserId, [{
            user_id: currentUserId,
            category: Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
            name: Preferences.LIMIT_VISIBLE_DMS_GMS,
            value: number.toString(),
        }]));
    }

    let showMessagesCountSelectedValue = <span>{selectedDmNumber}</span>;
    if (selectedDmNumber === 10000) {
        showMessagesCountSelectedValue = (
            <FormattedMessage
                id='channel_notifications.levels.all'
                defaultMessage='All'
            />
        );
    }

    const showMessagesCountMenuItem = (
        <Menu.SubMenu
            id={`showMessagesCount-${category.id}`}
            leadingElement={<AccountMultipleOutlineIcon size={18}/>}
            labels={(
                <FormattedMessage
                    id='sidebar.show'
                    defaultMessage='Show'
                />
            )}
            trailingElements={(
                <>
                    {showMessagesCountSelectedValue}
                    <ChevronRightIcon size={16} className='chevron-right' />
                </>
            )}
            menuId={`showMessagesCount-${category.id}-menu`}
        >
            {Constants.DM_AND_GM_SHOW_COUNTS.map((dmGmShowCount) => (
                <Menu.Item
                    id={`showDmCount-${category.id}-${dmGmShowCount}`}
                    key={`showDmCount-${category.id}-${dmGmShowCount}`}
                    labels={<span>{dmGmShowCount}</span>}
                    onClick={() => handlelimitVisibleDMsGMs(dmGmShowCount)}
                    trailingElements={selectedDmNumber === dmGmShowCount ? <CheckIcon size={16}/> : null}
                />
            ))}
        </Menu.SubMenu>

    );

    function handleStatusFilterChange(value: string) {
        dispatch(savePreferences(currentUserId, [{
            user_id: currentUserId,
            category: Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
            name: 'dm_gm_status_filter',
            value,
        }]));
    }

    let statusFilterSelectedValue: React.ReactNode = (
        <FormattedMessage id='channel_notifications.levels.all' defaultMessage='All'/>
    );

    if (selectedStatusFilter === 'online') {
        statusFilterSelectedValue = (
            <FormattedMessage id='sidebar.status.online' defaultMessage='Online'/>
        );
    } else if (selectedStatusFilter === 'away') {
        statusFilterSelectedValue = (
            <FormattedMessage id='sidebar.status.away' defaultMessage='Away'/>
        );
    } else if (selectedStatusFilter === 'offline') {
        statusFilterSelectedValue = (
            <FormattedMessage id='sidebar.status.offline' defaultMessage='Offline'/>
        );
    }

    const filterByStatusMenuItem = (
        <Menu.SubMenu
            id={`filterByStatus-${category.id}`}
            leadingElement={<AccountMultipleOutlineIcon size={18}/>}
            labels={(
                <FormattedMessage id='sidebar.filterByStatus' defaultMessage='Filter' />
            )}
            trailingElements={(
                <>
                    {statusFilterSelectedValue}
                    <ChevronRightIcon size={16} className='chevron-right' />
                </>
            )}
            menuId={`filterByStatus-${category.id}-menu`}
        >
            <Menu.Item
                id={`filterByStatus-online-${category.id}`}
                labels={(<FormattedMessage id='sidebar.status.online' defaultMessage='Online' />)}
                onClick={() => handleStatusFilterChange('online')}
                trailingElements={selectedStatusFilter === 'online' ? <CheckIcon size={16}/> : null}
            />
            <Menu.Item
                id={`filterByStatus-away-${category.id}`}
                labels={(<FormattedMessage id='sidebar.status.away' defaultMessage='Away' />)}
                onClick={() => handleStatusFilterChange('away')}
                trailingElements={selectedStatusFilter === 'away' ? <CheckIcon size={16}/> : null}
            />
            <Menu.Item
                id={`filterByStatus-offline-${category.id}`}
                labels={(<FormattedMessage id='sidebar.status.offline' defaultMessage='Offline' />)}
                onClick={() => handleStatusFilterChange('offline')}
                trailingElements={selectedStatusFilter === 'offline' ? <CheckIcon size={16}/> : null}
            />
            <Menu.Item
                id={`filterByStatus-all-${category.id}`}
                labels={(<FormattedMessage id='channel_notifications.levels.all' defaultMessage='All' />)}
                onClick={() => handleStatusFilterChange('all')}
                trailingElements={selectedStatusFilter === 'all' ? <CheckIcon size={16}/> : null}
            />
        </Menu.SubMenu>
    );

    const openDirectMessageMenuItem = (
        <Menu.Item
            id={`openDirectMessage-${category.id}`}
            onClick={handleOpenDirectMessagesModal}
            leadingElement={<AccountPlusOutlineIcon size={18}/>}
            labels={(
                <FormattedMessage
                    id='sidebar.openDirectMessage'
                    defaultMessage='Open a direct message'
                />
            )}
        />
    );

    function handleMenuToggle(isOpen: boolean) {
        setIsMenuOpen(isOpen);
    }

    return (
        <div
            className={classNames(
                'SidebarMenu',
                'MenuWrapper',
                {menuOpen: isMenuOpen},
                {'MenuWrapper--open': isMenuOpen},
            )}
        >
            <Menu.Container
                menuButton={{
                    id: `SidebarCategorySortingMenu-Button-${category.id}`,
                    'aria-label': formatMessage({id: 'sidebar_left.sidebar_category_menu.editCategory', defaultMessage: 'Category options'}, {name: category.display_name}),
                    class: 'SidebarMenu_menuButton sortingMenu',
                    children: <DotsVerticalIcon size={16}/>,
                }}
                menuButtonTooltip={{
                    text: formatMessage({id: 'sidebar_left.sidebar_category_menu.editCategory', defaultMessage: 'Category options'}, {name: category.display_name}),
                    class: 'hidden-xs',
                }}
                menu={{
                    id: `SidebarCategorySortingMenu-MenuList-${category.id}`,
                    'aria-label': formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Edit category menu'}),
                    onToggle: handleMenuToggle,
                }}
            >
                {sortDirectMessagesMenuItem}
                {showMessagesCountMenuItem}
                {filterByStatusMenuItem}
                <Menu.Separator/>
                {openDirectMessageMenuItem}
            </Menu.Container>
        </div>
    );
};

export default memo(SidebarCategorySortingMenu);
