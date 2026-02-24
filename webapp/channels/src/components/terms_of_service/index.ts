// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {GlobalState} from '@workspace/types/store';

import {getTermsOfService, updateMyTermsOfServiceStatus} from 'workspace-redux/actions/users';
import {getConfig} from 'workspace-redux/selectors/entities/general';
import {getIsOnboardingFlowEnabled} from 'workspace-redux/selectors/entities/preferences';

import {getEmojiMap} from 'selectors/emojis';

import TermsOfService from './terms_of_service';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const onboardingFlowEnabled = getIsOnboardingFlowEnabled(state);
    return {
        onboardingFlowEnabled,
        termsEnabled: config.EnableCustomTermsOfService === 'true',
        emojiMap: getEmojiMap(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            getTermsOfService,
            updateMyTermsOfServiceStatus,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TermsOfService);
