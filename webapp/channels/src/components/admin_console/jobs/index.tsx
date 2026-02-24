// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {getJobsByType, createJob, cancelJob} from 'workspace-redux/actions/jobs';
import {getConfig} from 'workspace-redux/selectors/entities/admin';
import {makeGetJobsByType} from 'workspace-redux/selectors/entities/jobs';

import type {GlobalState} from 'types/store';

import Table from './table';
import type {Props} from './table';

type OwnProps = Omit<Props, 'actions'|'jobs'|'downloadExportRresults'>;

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    return {
        jobs: makeGetJobsByType(ownProps.jobType)(state),
        downloadExportResults: getConfig(state).MessageExportSettings?.DownloadExportResults,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            getJobsByType,
            createJob,
            cancelJob,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Table);
