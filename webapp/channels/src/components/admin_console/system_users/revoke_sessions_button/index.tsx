// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import type {GlobalState} from '@workspace/types/store';

import {revokeSessionsForAllUsers} from 'workspace-redux/actions/users';
import {Permissions} from 'workspace-redux/constants';
import {haveISystemPermission} from 'workspace-redux/selectors/entities/roles_helpers';
import {isCurrentUserTeamAdminInAnyTeam} from 'workspace-redux/selectors/entities/teams';
import {getCurrentUser} from 'workspace-redux/selectors/entities/users';
import {isSystemAdmin} from 'workspace-redux/utils/user_utils';

import {emitUserLoggedOutEvent} from 'actions/global_actions';

import ConfirmModal from 'components/confirm_modal';
import DropdownIcon from 'components/widgets/icons/fa_dropdown_icon';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import * as Utils from 'utils/utils';

import CreateAccountModal from './CreateAccountModal';

export function RevokeSessionsButton() {
    const dispatch = useDispatch();
    const currentUser = useSelector(getCurrentUser);
    const isAdmin = isSystemAdmin(currentUser.roles);
    const haveWritePermissions = useSelector((state: GlobalState) => haveISystemPermission(state, {permission: Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_USERS}));
    const isTeamAdmin = useSelector(isCurrentUserTeamAdminInAnyTeam);

    // Show create button only if user is System Admin OR (has User Manager permission AND is Team Admin)
    const showCreateButton = isAdmin || (haveWritePermissions && isTeamAdmin);

    const [showModal, setShowModal] = useState(false);
    const [showCreateAccountModal, setShowCreateAccountModal] = useState(false); // لإدارة ظهور مودال إنشاء الحساب
    const [createAccountMode, setCreateAccountMode] = useState<'manual' | 'excel'>('manual');
    const handleClose = () => setShowCreateAccountModal(false);
    function handleModalToggle() {
        setShowModal((showModal) => !showModal);
    }

    async function handleModalConfirm() {
        const {data} = await dispatch(revokeSessionsForAllUsers());

        if (data) {
            emitUserLoggedOutEvent();
        } else {
            setShowModal(false);
        }
    }

    function openCreateAccountModal(mode: 'manual' | 'excel') {
        setCreateAccountMode(mode);
        setShowCreateAccountModal(true);
    }

    const createAccountAriaLabel = Utils.localizeMessage({
        id: 'admin.system_users.create_account.menu.aria',
        defaultMessage: 'Create account menu',
    });

    return (
        <>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                {showCreateButton && (
                    <MenuWrapper>
                        <button
                            type='button'
                            className='btn btn-tertiary dropdown-toggle theme'
                            aria-expanded='true'
                        >
                            <span style={{display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
                                <FormattedMessage
                                    id='signup_user_completed.create'
                                    defaultMessage='إنشاء حساب'
                                />
                                <DropdownIcon/>
                            </span>
                        </button>
                        <Menu ariaLabel={createAccountAriaLabel}>
                            <Menu.ItemAction
                                onClick={() => openCreateAccountModal('manual')}
                                text={(
                                    <FormattedMessage
                                        id='admin.system_users.create_account.menu.manual'
                                        defaultMessage='إنشاء حساب'
                                    />
                                )}
                            />
                            <Menu.ItemAction
                                onClick={() => openCreateAccountModal('excel')}
                                text={(
                                    <FormattedMessage
                                        id='admin.system_users.create_account.menu.excel'
                                        defaultMessage='إنشاء حساب من ملف إكسل'
                                    />
                                )}
                            />
                        </Menu>
                    </MenuWrapper>
                )}
                {isAdmin && (
                    <button
                        className='btn btn-tertiary btn-danger'
                        onClick={handleModalToggle}
                    >
                        <FormattedMessage
                            id='admin.system_users.revokeAllSessions'
                            defaultMessage='Revoke All Sessions'
                        />
                    </button>
                )}
            </div>
            <ConfirmModal
                show={showModal}
                title={
                    <FormattedMessage
                        id='admin.system_users.revoke_all_sessions_modal_title'
                        defaultMessage='Revoke all sessions in the system'
                    />
                }
                message={
                    <FormattedMessage
                        id='admin.system_users.revoke_all_sessions_modal_message'
                        defaultMessage='This action revokes all sessions in the system. All users will be logged out from all devices, including your session. Are you sure you want to revoke all sessions?'
                    />
                }
                confirmButtonClass='btn btn-danger'
                confirmButtonText={
                    <FormattedMessage
                        id='admin.system_users.revoke_all_sessions_button'
                        defaultMessage='Revoke All Sessions'
                    />
                }
                onConfirm={handleModalConfirm}
                onCancel={handleModalToggle}
            />
            <Modal
                show={showCreateAccountModal}
                onHide={handleClose}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        {createAccountMode === 'excel' ? 'إنشاء حساب من ملف إكسل' : 'إنشاء حساب جديد'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{overflow: 'auto'}}>
                    {showCreateAccountModal && <CreateAccountModal mode={createAccountMode}/>}

                </Modal.Body>
            </Modal>
        </>
    );
}
