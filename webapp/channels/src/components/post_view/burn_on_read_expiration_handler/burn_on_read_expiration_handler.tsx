// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect} from 'react';

import {useDispatch} from 'react-redux';

import {expirationScheduler} from 'utils/burn_on_read_expiration_scheduler';

interface Props {
    postId: string;
    expireAt?: number | null;
    maxExpireAt?: number | null;
}

/**
 * Invisible component that registers burn-on-read posts with the global expiration scheduler.
 * Handles automatic post deletion when timers expire.
 *
 * - Revealed messages: have expire_at (starts when user reveals the message)
 * - Unrevealed messages: have max_expire_at (maximum time to live for unopened messages)
 * - Sender messages: have expire_at (starts after all recipients have revealed)
 *
 * The scheduler automatically picks whichever timer expires first.
 */
const BurnOnReadExpirationHandler = ({postId, expireAt = null, maxExpireAt = null}: Props) => {
    const dispatch = useDispatch();

    useEffect(() => {
        expirationScheduler.initialize(dispatch as any);
    }, [dispatch]);

    // Register post with scheduler when component mounts or expiration times change
    useEffect(() => {
        // Register with the global scheduler
        // The scheduler handles all optimization internally (deduplication, schedule recomputation)
        expirationScheduler.registerPost(postId, expireAt, maxExpireAt);

        // Cleanup: unregister when component unmounts (post deleted or scrolled out of view)
        return () => {
            expirationScheduler.unregisterPost(postId);
        };
    }, [postId, expireAt, maxExpireAt]);

    // This component renders nothing - it only manages scheduler registration
    return null;
};

export default BurnOnReadExpirationHandler;
