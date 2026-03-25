// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getAgents, getAgentsStatus} from 'workspace-redux/actions/agents';
import {getAgentsStatus as getAgentsStatusSelector} from 'workspace-redux/selectors/entities/agents';

import {useWebSocket} from 'utils/use_websocket/hooks';

export type AgentsBridgeStatus = {
    available: boolean;
    reason?: string;
};

/**
 * Hook to determine if the bridge is enabled by checking if the plugin is active and compatible.
 */
export default function useGetAgentsBridgeEnabled(): AgentsBridgeStatus {
    const dispatch = useDispatch();
    const status = useSelector(getAgentsStatusSelector);
    const hasFetchedRef = useRef(false);

    // Fetch status on mount
    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            dispatch(getAgents());
            dispatch(getAgentsStatus());
        }
    }, [dispatch]);

    // Handle websocket events (Simplified for now, similar to reference but without manifest check)
    useWebSocket({
        handler: (msg) => {
            if (msg.event === 'config_changed' || msg.event === 'plugin_enabled' || msg.event === 'plugin_disabled') {
                dispatch(getAgentsStatus());
            }
        },
    });

    return status;
}
