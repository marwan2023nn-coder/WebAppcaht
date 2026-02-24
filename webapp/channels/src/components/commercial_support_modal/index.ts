// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig, getLicense} from 'workspace-redux/selectors/entities/general';
import {getCurrentUser} from 'workspace-redux/selectors/entities/users';

import type {SupportPacketContent} from '@workspace/types/admin';

import type {GlobalState} from 'types/store';

import CommercialSupportModal from './commercial_support_modal';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const license = getLicense(state);
    const isCloud = license.Cloud === 'true';
    const currentUser = getCurrentUser(state);
    const showBannerWarning = (config.EnableFile !== 'true' || config.FileLevel !== 'DEBUG') && !(isCloud);
    const packetContents: SupportPacketContent[] = [
        {id: 'basic.contents', translation_id: 'commercial_support.support_packet_contents.basic_contents', label: 'Basic contents', selected: true, mandatory: true},
        {id: 'basic.server.logs', translation_id: 'commercial_support.support_packet_contents.server_logs', label: 'Server logs', selected: true, mandatory: false},
    ];

    for (const [key, value] of Object.entries(state.entities.admin.plugins!)) {
        if (value.active && value.props !== undefined && value.props.support_packet !== undefined) {
            packetContents.push({
                id: key,
                label: String(value.props.support_packet),
                selected: false,
                mandatory: false,
            });
        }
    }

    return {
        isCloud,
        currentUser,
        showBannerWarning,
        packetContents,
    };
}

export default connect(mapStateToProps)(CommercialSupportModal);
