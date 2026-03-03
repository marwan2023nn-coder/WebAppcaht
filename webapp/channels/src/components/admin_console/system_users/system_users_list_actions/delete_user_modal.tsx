// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';

import type {ServerError} from '@workspace/types/errors';
import type {UserProfile} from '@workspace/types/users';

import {deleteUser} from 'workspace-redux/actions/users';

import ConfirmModalRedux from 'components/confirm_modal_redux';

type Props = {
    user: UserProfile;
    onExited: () => void;
    onSuccess: () => void;
    onError: (error: ServerError) => void;
}

export default function DeleteUserModal({user, onExited, onSuccess, onError}: Props) {
    const dispatch = useDispatch();

    async function handleDelete() {
        const {error} = await dispatch(deleteUser(user.id));
        if (error) {
            onError(error);
        } else {
            onSuccess();
        }
    }

    const title = (
        <FormattedMessage
            id='admin.delete_user_modal.title'
            defaultMessage='Delete {username}'
            values={{
                username: user.username,
            }}
        />
    );

    const message = (
        <div>
            <FormattedMessage
                id='admin.delete_user_modal.message'
                defaultMessage='Are you sure you want to delete the user {username}? This action is permanent and cannot be undone from the UI.'
                values={{
                    username: user.username,
                }}
            />
        </div>
    );

    const confirmButtonClass = 'btn btn-danger';
    const deleteButtonText = (
        <FormattedMessage
            id='admin.delete_user_modal.delete'
            defaultMessage='Delete'
        />
    );

    return (
        <ConfirmModalRedux
            id='deleteUserModal'
            title={title}
            message={message}
            confirmButtonClass={confirmButtonClass}
            confirmButtonText={deleteButtonText}
            onConfirm={handleDelete}
            onExited={onExited}
        />
    );
}
