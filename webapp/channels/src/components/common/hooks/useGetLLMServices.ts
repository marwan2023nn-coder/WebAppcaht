// Copyright (c) 2015-present Sofa Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getLLMServices as getLLMServicesAction} from 'workspace-redux/actions/agents';
import {getLLMServices} from 'workspace-redux/selectors/entities/agents';

export default function useGetLLMServices() {
    const dispatch = useDispatch();
    const services = useSelector(getLLMServices);

    useEffect(() => {
        dispatch(getLLMServicesAction());
    }, [dispatch]);

    return services;
}
