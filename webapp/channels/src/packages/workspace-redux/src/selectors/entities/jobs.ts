// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {JobType, Job, JobsByType} from '@workspace/types/jobs';
import type {GlobalState} from '@workspace/types/store';
import type {IDMappedObjects} from '@workspace/types/utilities';

import {createSelector} from 'workspace-redux/selectors/create_selector';

export function getAllJobs(state: GlobalState): IDMappedObjects<Job> {
    return state.entities.jobs.jobs;
}

export function getJobsByType(state: GlobalState): JobsByType {
    return state.entities.jobs.jobsByTypeList;
}

export function makeGetJobsByType(type: JobType): (state: GlobalState) => Job[] {
    return createSelector(
        'makeGetJobsByType',
        getJobsByType,
        (jobsByType) => {
            return jobsByType[type] || [];
        },
    );
}
