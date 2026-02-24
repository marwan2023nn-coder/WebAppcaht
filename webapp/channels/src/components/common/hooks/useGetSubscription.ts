// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import type {Subscription} from '@workspace/types/cloud';

import {
    getCloudSubscription as getCloudSubscriptionAction,
} from 'workspace-redux/actions/cloud';
import {getCloudSubscription} from 'workspace-redux/selectors/entities/cloud';
import {getLicense} from 'workspace-redux/selectors/entities/general';

export default function useGetSubscription(): Subscription | undefined {
    const cloudSubscription = useSelector(getCloudSubscription);
    const license = useSelector(getLicense);
    const retrievedCloudSub = Boolean(cloudSubscription);
    const dispatch = useDispatch();
    const [requestedSubscription, setRequestedSubscription] = useState(false);

    useEffect(() => {
        if (license.Cloud === 'true' && !retrievedCloudSub && !requestedSubscription) {
            dispatch(getCloudSubscriptionAction());
            setRequestedSubscription(true);
        }
    }, [requestedSubscription, retrievedCloudSub, license]);

    return cloudSubscription;
}
