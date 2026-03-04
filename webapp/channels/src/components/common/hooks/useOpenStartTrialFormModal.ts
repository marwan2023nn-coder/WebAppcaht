// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getLicense} from 'workspace-redux/selectors/entities/general';

import {openModal} from 'actions/views/modals';

import StartTrialFormModal from 'components/start_trial_form_modal';

import {ModalIdentifiers} from 'utils/constants';

export default function useOpenStartTrialFormModal() {
    const dispatch = useDispatch();
    const isLicensed = useSelector(getLicense)?.IsLicensed === 'true';

    return useCallback((onClose?: () => void) => {
        if (!isLicensed) {
            return;
        }

        dispatch(openModal({
            modalId: ModalIdentifiers.START_TRIAL_FORM_MODAL,
            dialogType: StartTrialFormModal,
            dialogProps: {
                onClose,
            },
        }));
    }, [dispatch, isLicensed]);
}
