// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {IntlShape, MessageDescriptor} from 'react-intl';
import {defineMessage, injectIntl} from 'react-intl';

import type {UserProfile} from '@workspace/types/users';
import type {RelationOneToOne} from '@workspace/types/utilities';

import type {ActionResult} from 'workspace-redux/types/actions';
import {filterProfilesStartingWithTerm} from 'workspace-redux/utils/user_utils';

import MultiSelect from 'components/multiselect/multiselect';
import type {Value} from 'components/multiselect/multiselect';

import Constants from 'utils/constants';

import MultiSelectOption from './multiselect_option/multiselect_option';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = 256;

type UserProfileValue = Value & UserProfile;

export type Props = {
    multilSelectKey: string;
    userStatuses: RelationOneToOne<UserProfile, string>;
    focusOnLoad?: boolean;

    intl: IntlShape;

    // Used if we are adding new members to an existing group
    groupId?: string;

    // onSubmitCallback takes an array of UserProfiles and should set usersToAdd in state of parent component
    onSubmitCallback: (userProfiles?: UserProfile[]) => Promise<void>;
    addUserCallback?: (userProfiles: UserProfile[]) => void;
    deleteUserCallback?: (userProfiles: UserProfile[]) => void;

    // These are the optinoal search parameters
    searchOptions?: any;

    // Dictionaries of userid mapped users to exclude or include from this list
    excludeUsers?: Record<string, UserProfileValue>;
    includeUsers?: Record<string, UserProfileValue>;

    profiles: UserProfileValue[];

    savingEnabled: boolean;
    saving: boolean;
    buttonSubmitText?: string | MessageDescriptor;
    buttonSubmitLoadingText?: string | MessageDescriptor;
    backButtonClick?: () => void;
    backButtonClass?: string;
    backButtonText?: string | MessageDescriptor;

    actions: {
        getProfiles: (page?: number, perPage?: number) => Promise<ActionResult>;
        getProfilesNotInGroup: (groupId: string, page?: number, perPage?: number) => Promise<ActionResult>;
        loadStatusesForProfilesList: (users: UserProfile[]) => void;
        searchProfiles: (term: string, options: any) => Promise<ActionResult>;
    };
}

const AddUserToGroupMultiSelect = ({
    multilSelectKey,
    userStatuses,
    focusOnLoad,
    intl,
    groupId,
    onSubmitCallback,
    addUserCallback,
    deleteUserCallback,
    searchOptions,
    excludeUsers = {},
    includeUsers = {},
    profiles,
    savingEnabled,
    saving,
    buttonSubmitText = defineMessage({id: 'multiselect.createGroup', defaultMessage: 'Create Group'}),
    buttonSubmitLoadingText = defineMessage({id: 'multiselect.creating', defaultMessage: 'Creating...'}),
    backButtonClick,
    backButtonClass,
    backButtonText,
    actions,
}: Props) => {
    const [values, setValues] = useState<UserProfileValue[]>([]);
    const [term, setTerm] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(true);

    const searchTimeoutId = useRef<number>(0);
    const selectedItemRef = useRef<HTMLDivElement>(null);

    const addValue = useCallback((value: UserProfileValue) => {
        setValues((prevValues) => {
            const nextValues = [...prevValues];
            if (nextValues.indexOf(value) === -1) {
                nextValues.push(value);
            }

            if (addUserCallback) {
                addUserCallback(nextValues);
            }

            return nextValues;
        });
    }, [addUserCallback]);

    useEffect(() => {
        const fetchProfiles = async () => {
            if (groupId) {
                await actions.getProfilesNotInGroup(groupId);
            } else {
                await actions.getProfiles();
            }
            setLoadingUsers(false);
        };

        fetchProfiles();
        actions.loadStatusesForProfilesList(profiles);
    }, [groupId, actions, profiles]);

    const handleDelete = useCallback((nextValues: UserProfileValue[]) => {
        if (deleteUserCallback) {
            deleteUserCallback(nextValues);
        }

        setValues(nextValues);
    }, [deleteUserCallback]);

    const handlePageChange = useCallback((page: number, prevPage: number) => {
        if (page > prevPage) {
            setLoadingUsers(true);
            const fetchNextPage = async () => {
                if (groupId) {
                    await actions.getProfilesNotInGroup(groupId, page + 1, USERS_PER_PAGE);
                } else {
                    await actions.getProfiles(page + 1, USERS_PER_PAGE);
                }
                setLoadingUsers(false);
            };
            fetchNextPage();
        }
    }, [groupId, actions]);

    const handleSubmit = useCallback(() => {
        if (values.length === 0) {
            return;
        }
        onSubmitCallback(values);
    }, [values, onSubmitCallback]);

    const search = useCallback((searchTerm: string) => {
        const trimmedTerm = searchTerm.trim();
        window.clearTimeout(searchTimeoutId.current);
        setTerm(trimmedTerm);

        if (trimmedTerm) {
            setLoadingUsers(true);
            searchTimeoutId.current = window.setTimeout(
                async () => {
                    await actions.searchProfiles(trimmedTerm, searchOptions);
                    setLoadingUsers(false);
                },
                Constants.SEARCH_TIMEOUT_MILLISECONDS,
            );
        }
    }, [actions, searchOptions]);

    const renderAriaLabel = useCallback((option: UserProfileValue): string => {
        if (!option) {
            return '';
        }
        return option.username;
    }, []);

    const renderOption = useCallback((option: UserProfileValue, isSelected: boolean, onAdd: (user: UserProfileValue) => void, onMouseMove: (user: UserProfileValue) => void) => {
        return (
            <MultiSelectOption
                option={option}
                onAdd={onAdd}
                isSelected={isSelected}
                onMouseMove={onMouseMove}
                userStatuses={userStatuses}
                ref={isSelected ? selectedItemRef : undefined}
                key={option.id}
            />
        );
    }, [userStatuses]);

    const filteredUsers = useMemo(() => {
        let users = filterProfilesStartingWithTerm(profiles, term).filter((user) => {
            return user.delete_at === 0 && !excludeUsers[user.id];
        }).map((user) => user as UserProfileValue);

        if (includeUsers) {
            const extraUsers = Object.values(includeUsers);
            users = [...users, ...extraUsers];
        }

        return users;
    }, [profiles, term, excludeUsers, includeUsers]);

    const maxValues = values.length >= MAX_SELECTABLE_VALUES ? MAX_SELECTABLE_VALUES : undefined;
    const numRemainingText = maxValues ? defineMessage({id: 'multiselect.maxGroupMembers', defaultMessage: 'No more than 256 members can be added to a group at once.'}) : undefined;

    return (
        <MultiSelect
            key={multilSelectKey}
            options={filteredUsers}
            optionRenderer={renderOption}
            intl={intl}
            selectedItemRef={selectedItemRef}
            values={values}
            ariaLabelRenderer={renderAriaLabel}
            saveButtonPosition={'bottom'}
            perPage={USERS_PER_PAGE}
            handlePageChange={handlePageChange}
            handleInput={search}
            handleDelete={handleDelete}
            handleAdd={addValue}
            handleSubmit={handleSubmit}
            buttonSubmitText={buttonSubmitText}
            buttonSubmitLoadingText={buttonSubmitLoadingText}
            saving={saving}
            loading={loadingUsers}
            placeholderText={defineMessage({id: 'multiselect.placeholder', defaultMessage: 'Search for people'})}
            valueWithImage={true}
            focusOnLoad={focusOnLoad}
            savingEnabled={savingEnabled}
            backButtonClick={backButtonClick}
            backButtonClass={backButtonClass}
            backButtonText={backButtonText}
            maxValues={maxValues}
            numRemainingText={numRemainingText}
            required={true}
        />
    );
};

export default injectIntl(React.memo(AddUserToGroupMultiSelect));
