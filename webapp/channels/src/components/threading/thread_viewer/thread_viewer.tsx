// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {HTMLAttributes} from 'react';

import type {Channel} from '@workspace/types/channels';
import type {Post} from '@workspace/types/posts';
import type {UserThread} from '@workspace/types/threads';

import type {ActionResult} from 'workspace-redux/types/actions';

import deferComponentRender from 'components/deferComponentRender';
import FileUploadOverlay from 'components/file_upload_overlay';
import {DropOverlayIdThreads} from 'components/file_upload_overlay/file_upload_overlay';
import LoadingScreen from 'components/loading_screen';

import WebSocketClient from 'client/web_websocket_client';

import type {FakePost} from 'types/store/rhs';

import ThreadViewerVirtualized from '../virtualized_thread_viewer';

import './thread_viewer.scss';

const DeferredThreadViewerVirt = deferComponentRender(ThreadViewerVirtualized);

type Attrs = Pick<HTMLAttributes<HTMLDivElement>, 'className' | 'id'>;

export type Props = Attrs & {
    isCollapsedThreadsEnabled: boolean;
    appsEnabled: boolean;
    userThread?: UserThread | null;
    channel?: Channel;
    selected?: Post | FakePost;
    currentUserId: string;
    currentTeamId: string;
    socketConnectionStatus: boolean;
    actions: {
        fetchRHSAppsBindings: (channelId: string, rootID: string) => unknown;
        getNewestPostThread: (rootId: string) => Promise<ActionResult>;
        getPostThread: (rootId: string, fetchThreads: boolean, lastUpdateAt: number) => Promise<ActionResult>;
        getThread: (userId: string, teamId: string, threadId: string, extended: boolean) => Promise<ActionResult>;
        selectPostCard: (post: Post) => void;
        updateThreadLastOpened: (threadId: string, lastViewedAt: number) => unknown;
        updateThreadRead: (userId: string, teamId: string, threadId: string, timestamp: number) => unknown;
        updateThreadLastUpdateAt: (threadId: string, lastUpdateAt: number) => unknown;
    };
    useRelativeTimestamp?: boolean;
    postIds: string[];
    highlightedPostId?: Post['id'];
    selectedPostFocusedAt?: number;
    isThreadView: boolean;
    inputPlaceholder?: string;
    rootPostId: string;
    enableWebSocketEventScope: boolean;
    lastUpdateAt: number;
};

const ThreadViewer: React.FC<Props> = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const prevSocketConnectionStatus = useRef(props.socketConnectionStatus);
    const prevSelectedId = useRef(props.selected?.id);
    const prevUserThreadId = useRef(props.userThread?.id);
    const prevChannelId = useRef(props.channel?.id);

    const getReplyCount = useCallback((): number => {
        return (props.selected as Post)?.reply_count || props.userThread?.reply_count || 0;
    }, [props.selected, props.userThread]);

    const fetchThread = useCallback(() => {
        const {
            actions: {
                getThread,
            },
            currentUserId,
            currentTeamId,
            selected,
        } = props;

        if (selected && getReplyCount() && (props.selected as Post)?.is_following) {
            return getThread(
                currentUserId,
                currentTeamId,
                selected.id,
                true,
            );
        }

        return Promise.resolve({data: true});
    }, [props.actions, props.currentUserId, props.currentTeamId, props.selected, getReplyCount]);

    const markThreadRead = useCallback(() => {
        if (props.userThread) {
            // update last viewed at for thread before marking as read.
            props.actions.updateThreadLastOpened(
                props.userThread.id,
                props.userThread.last_viewed_at,
            );

            if (
                props.userThread.last_viewed_at < props.userThread.last_reply_at ||
                props.userThread.unread_mentions ||
                props.userThread.unread_replies
            ) {
                props.actions.updateThreadRead(
                    props.currentUserId,
                    props.currentTeamId,
                    props.selected?.id || props.rootPostId,
                    Date.now(),
                );
            }
        }
    }, [props.userThread, props.actions, props.currentUserId, props.currentTeamId, props.selected?.id, props.rootPostId]);

    const onInit = useCallback(async (reconnected = false): Promise<void> => {
        setIsLoading(!reconnected);
        const res = await props.actions.getPostThread(props.selected?.id || props.rootPostId, !reconnected, props.lastUpdateAt);

        if (props.selected && res.data) {
            const {order, posts} = res.data;
            if (order.length > 0 && posts[order[0]]) {
                let highestUpdateAt = posts[order[0]].update_at;

                // Check all posts to find the highest update_at
                for (const postId in posts) {
                    if (Object.hasOwn(posts, postId)) {
                        const post = posts[postId];
                        if (post.update_at > highestUpdateAt) {
                            highestUpdateAt = post.update_at;
                        }
                    }
                }

                props.actions.updateThreadLastUpdateAt(props.selected.id, highestUpdateAt);
            }
        }

        if (
            props.isCollapsedThreadsEnabled &&
            props.userThread == null
        ) {
            await fetchThread();
        }

        if (props.channel && props.enableWebSocketEventScope) {
            WebSocketClient.updateActiveThread(props.isThreadView, props.channel?.id);
        }
        setIsLoading(false);
    }, [props.actions, props.selected?.id, props.rootPostId, props.lastUpdateAt, props.isCollapsedThreadsEnabled, props.userThread, props.channel, props.enableWebSocketEventScope, props.isThreadView, fetchThread]);

    useEffect(() => {
        if (props.isCollapsedThreadsEnabled && props.userThread !== null) {
            markThreadRead();
        }

        onInit();

        if (props.appsEnabled) {
            props.actions.fetchRHSAppsBindings(props.channel?.id || '', props.selected?.id || props.rootPostId);
        }

        return () => {
            if (props.enableWebSocketEventScope) {
                WebSocketClient.updateActiveThread(props.isThreadView, '');
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const reconnected = props.socketConnectionStatus && !prevSocketConnectionStatus.current;
        const selectedChanged = props.selected?.id !== prevSelectedId.current;

        if (props.selected && (reconnected || selectedChanged)) {
            onInit(reconnected);
        }

        if (
            props.isCollapsedThreadsEnabled &&
            props.userThread?.id !== prevUserThreadId.current
        ) {
            markThreadRead();
        }

        if (props.appsEnabled && (
            props.channel?.id !== prevChannelId.current || selectedChanged
        )) {
            props.actions.fetchRHSAppsBindings(props.channel?.id || '', props.selected?.id || props.rootPostId);
        }

        prevSocketConnectionStatus.current = props.socketConnectionStatus;
        prevSelectedId.current = props.selected?.id;
        prevUserThreadId.current = props.userThread?.id;
        prevChannelId.current = props.channel?.id;
    }, [
        props.socketConnectionStatus,
        props.selected,
        props.isCollapsedThreadsEnabled,
        props.userThread,
        props.appsEnabled,
        props.channel?.id,
        props.actions,
        props.rootPostId,
        onInit,
        markThreadRead,
    ]);

    const handleCardClick = useCallback((post: Post) => {
        if (!post) {
            return;
        }

        props.actions.selectPostCard(post);
    }, [props.actions]);

    if (props.postIds == null || props.selected == null || !props.channel) {
        return (
            <span/>
        );
    }

    if (isLoading && props.postIds.length < 2) {
        return (
            <LoadingScreen
                style={{
                    display: 'grid',
                    placeContent: 'center',
                    flex: '1',
                }}
            />
        );
    }

    return (
        <>
            <div className={classNames('ThreadViewer', props.className)}>
                <div className='post-right-comments-container'>
                    <>
                        <FileUploadOverlay
                            overlayType='right'
                            id={DropOverlayIdThreads}
                        />
                        {props.selected && (
                            <DeferredThreadViewerVirt
                                inputPlaceholder={props.inputPlaceholder}
                                key={props.selected.id}
                                channelId={props.channel.id}
                                onCardClick={handleCardClick}
                                postIds={props.postIds}
                                selected={props.selected}
                                useRelativeTimestamp={props.useRelativeTimestamp || false}
                                highlightedPostId={props.highlightedPostId}
                                selectedPostFocusedAt={props.selectedPostFocusedAt}
                                isThreadView={Boolean(props.isCollapsedThreadsEnabled && props.isThreadView)}
                            />
                        )}
                    </>
                </div>
            </div>
        </>
    );
};

export default React.memo(ThreadViewer);
