// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {updateApproximateViewTime} from 'workspace-redux/actions/channels';
import {getCustomProfileAttributeFields} from 'workspace-redux/actions/general';
import {autoUpdateTimezone} from 'workspace-redux/actions/timezone';
import {getChannel, getCurrentChannelId, isManuallyUnread} from 'workspace-redux/selectors/entities/channels';
import {getLicense, getConfig, getFeatureFlagValue} from 'workspace-redux/selectors/entities/general';
import {getCurrentUser, shouldShowTermsOfService} from 'workspace-redux/selectors/entities/users';

import {getChannelURL} from 'selectors/urls';

import {getHistory} from 'utils/browser_history';
import {isEnterpriseLicense} from 'utils/license_utils';
import {checkIfMFARequired} from 'utils/route';
import {isPermalinkURL} from 'utils/url';

import type {ThunkActionFunc, GlobalState} from 'types/store';

import LoggedIn from './logged_in';

type Props = {
    match: {
        url: string;
    };
};

export function mapStateToProps(state: GlobalState, ownProps: Props) {
    const license = getLicense(state);
    const config = getConfig(state);
    const showTermsOfService = shouldShowTermsOfService(state);
    const currentChannelId = getCurrentChannelId(state);

    return {
        currentUser: getCurrentUser(state),
        currentChannelId,
        isCurrentChannelManuallyUnread: isManuallyUnread(state, currentChannelId),
        mfaRequired: checkIfMFARequired(getCurrentUser(state), license, config, ownProps.match.url),
        showTermsOfService,
        customProfileAttributesEnabled: isEnterpriseLicense(license) && getFeatureFlagValue(state, 'CustomProfileAttributes') === 'true',
    };
}

// NOTE: suggestions where to keep this welcomed
const getChannelURLAction = (channelId: string, teamId: string, url: string): ThunkActionFunc<void> => (dispatch, getState) => {
    const state = getState();

    if (url && isPermalinkURL(url)) {
        getHistory().push(url);
        return;
    }

    const channel = getChannel(state, channelId);
    if (channel) {
        getHistory().push(getChannelURL(state, channel, teamId));
    }
};

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            autoUpdateTimezone,
            getChannelURLAction,
            updateApproximateViewTime,
            getCustomProfileAttributeFields,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoggedIn);
