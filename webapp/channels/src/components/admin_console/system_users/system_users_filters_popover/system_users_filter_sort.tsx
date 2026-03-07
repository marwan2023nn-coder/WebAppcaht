// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo, useState} from 'react';
import {useIntl} from 'react-intl';

import DropdownInput from 'components/dropdown_input';

import type {AdminConsoleUserManagementTableProperties} from 'types/store/views';

import {getDefaultSelectedValueFromList} from '../utils';

type OptionType = {
    label: string;
    value: AdminConsoleUserManagementTableProperties['sortOrder'];
}

interface Props {
    initialValue: AdminConsoleUserManagementTableProperties['sortOrder'];
    onChange: (value: AdminConsoleUserManagementTableProperties['sortOrder']) => void;
}

export function SystemUsersFilterSort(props: Props) {
    const {formatMessage} = useIntl();

    const options = useMemo<OptionType[]>(() => {
        return [
            {
                value: '',
                label: formatMessage({
                    id: 'admin.system_users.filters.sort.none',
                    defaultMessage: 'Default',
                }),
            },
            {
                value: 'asc',
                label: formatMessage({
                    id: 'admin.system_users.filters.sort.asc',
                    defaultMessage: 'Alphabetical (A-Z)',
                }),
            },
            {
                value: 'desc',
                label: formatMessage({
                    id: 'admin.system_users.filters.sort.desc',
                    defaultMessage: 'Alphabetical (Z-A)',
                }),
            },
        ];
    }, [formatMessage]);

    const [value, setValue] = useState<OptionType>(() => getDefaultSelectedValueFromList<OptionType>(props.initialValue, options));

    function handleChange(value: OptionType) {
        setValue(value);
        props.onChange(value.value);
    }

    return (
        <DropdownInput<OptionType>
            name='filterSort'
            isSearchable={false}
            legend={formatMessage({id: 'admin.system_users.filters.sort.title', defaultMessage: 'Sort Order'})}
            options={options}
            value={value}
            onChange={handleChange}
        />
    );
}
