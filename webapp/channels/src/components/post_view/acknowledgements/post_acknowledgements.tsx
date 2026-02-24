// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    FloatingFocusManager,
    autoUpdate,
    flip,
    offset,
    safePolygon,
    shift,
    useFloating,
    useHover,
    useInteractions,
    useRole,
} from '@floating-ui/react';
import classNames from 'classnames';
import React, {memo, useState, useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

// import {CheckCircleOutlineIcon, CheckCircleIcon} from '@workspace/compass-icons/components';
import type {Post, PostAcknowledgement} from '@workspace/types/posts';
import type {UserProfile} from '@workspace/types/users';

import {acknowledgePost, editPost} from 'workspace-redux/actions/posts';
import {getProfilesByIds} from 'workspace-redux/actions/users';
import {getStatusForUserId} from 'workspace-redux/selectors/entities/users';
import {UserStatuses} from 'utils/constants';

import PostAcknowledgementsUserPopover from './post_acknowledgements_users_popover';

import './post_acknowledgements.scss';

type Props = {
    authorId: UserProfile['id'];
    currentUserId: UserProfile['id'];
    hasReactions: boolean;
    isDeleted: boolean;
    list?: Array<{ user: UserProfile; acknowledgedAt: PostAcknowledgement['acknowledged_at'] }>;
    postId: Post['id'];
    showDivider?: boolean;
    isComment?: boolean;
    comment_acks?: PostAcknowledgement[];
}

type ListItem = {
    user: UserProfile | undefined; // UserProfile or undefined if not found
    acknowledgedAt: PostAcknowledgement['acknowledged_at']; // Timestamp
};

function moreThan5minAgo(time: number) {
    const now = new Date().getTime();
    return now - time > 5 * 60 * 1000;
}

function PostAcknowledgements({
    authorId,
    currentUserId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hasReactions,
    isDeleted,
    list,
    postId,
    isComment,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    comment_acks = [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    showDivider = true,
}: Props) {
    const [acknowledgementList, setAcknowledgementList] = useState<ListItem[]>();
    let acknowledgedAt = 0;
    const isCurrentAuthor = authorId === currentUserId;
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);

    // Get current user status to prevent auto-acknowledgment for offline/dnd users
    const currentUserStatus = useSelector((state: any) => getStatusForUserId(state, currentUserId));

    useEffect(() => {
        // eslint-disable-next-line no-negated-condition
        if (list !== null) {
            // If list is not null, directly set the acknowledgementList to list
            setAcknowledgementList(list);
        } else {
            // If list is null, fetch profiles and process comment_acks
            const fetchProfiles = async () => {
                if (isComment && comment_acks.length > 0) {
                    // Dispatch and await the result to get profiles
                    const result = await dispatch(getProfilesByIds(comment_acks.map((ack) => ack.user_id)));

                    // Check if result is successful
                    if (result.data) {
                        const profiles = result.data; // The profiles array

                        // Map through comment_acks and pair with corresponding profiles
                        const newList: ListItem[] = comment_acks.map((ack) => {
                            // Find the profile with the matching user_id
                            const profile = profiles.find((profile) => profile.id === ack.user_id);
                            return {
                                user: profile, // The corresponding user profile (can be undefined)
                                acknowledgedAt: ack.acknowledged_at, // Timestamp of the acknowledgment
                            };
                        });

                        // Update the local state with the new list
                        setAcknowledgementList(newList);
                    } else {
                        // eslint-disable-next-line no-console
                        console.error('Failed to fetch profiles:', result.error);
                    }
                }
            };

            fetchProfiles();
        }
    }, [comment_acks, dispatch, isComment, list]);

    // if (list && list.length) {
    //     const ack = list.find((ack) => ack.user.id === currentUserId);
    //     if (ack) {
    //         acknowledgedAt = ack.acknowledgedAt;
    //     }
    // }
    if (isComment) {
        if (comment_acks && comment_acks.length) {
            const ack = comment_acks.find((ack) => ack.user_id === currentUserId);
            if (ack) {
                acknowledgedAt = ack.acknowledged_at;
            }
        }
    } else if (list && list.length) {
        const ack = list.find((ack) => ack.user.id === currentUserId);
        if (ack) {
            acknowledgedAt = ack.acknowledgedAt;
        }
    }
    const buttonDisabled = (Boolean(acknowledgedAt) && moreThan5minAgo(acknowledgedAt)) || isCurrentAuthor;

    // Automatically acknowledge the post if not already acknowledged
    useEffect(() => {
        // Prevent auto-acknowledgment if current user is offline or in DND mode
        const isCurrentUserOnline = currentUserStatus === UserStatuses.ONLINE;

        if (!isCurrentUserOnline) {
            return; // Exit early if user is offline or in DND
        }

        if (!buttonDisabled && !acknowledgedAt) {
            dispatch(acknowledgePost(postId));
            if (isComment) {
                const post = {
                    id: postId,
                    props: {
                        acknowledgements: [
                            ...comment_acks,
                            {
                                user_id: authorId,
                                post_id: postId,
                                acknowledged_at: new Date().getTime(),
                            },
                        ],
                    },
                } as unknown as Post;
                dispatch(editPost(post));
            }
        }
    }, [acknowledgedAt, buttonDisabled, dispatch, postId, currentUserStatus]);

    const {x, y, strategy, context, refs: {setReference, setFloating}} = useFloating({
        open,
        onOpenChange: setOpen,
        placement: 'top-start',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(5),
            flip({
                fallbackPlacements: ['bottom-start', 'right'],
                padding: 12,
            }),
            shift({
                padding: 12,
            }),
        ],
    });

    const {getReferenceProps, getFloatingProps} = useInteractions([
        useHover(context, {
            enabled: acknowledgementList && acknowledgementList.length > 0,
            mouseOnly: true,
            delay: {
                open: 300,
                close: 0,
            },
            restMs: 100,
            handleClose: safePolygon({
                blockPointerEvents: false,
            }),
        }),
        useRole(context),
    ]);

    if (isDeleted) {
        return null;
    }

    let buttonText: React.ReactNode = (
        <FormattedMessage
            id={'post_priority.button.acknowledge'}
            defaultMessage={'Acknowledge'}
        />
    );

    // Choose the icon based on the acknowledgementList length
    const icon = (acknowledgementList && acknowledgementList.length > 0) ? (
        <svg
            fill='none'
            height='1.8rem'
            viewBox='0 0 24 24'
            width='1.8rem'
            xmlns='http://www.w3.org/2000/svg'
            style={{margin: '2px'}}
            className='svg1'
        >
            <path
                clipRule='evenodd'
                d='m16.6795 6.26636c.4052.3753.4294 1.00801.0541 1.41318l-9.00624 9.72336c-.73748.7962-1.96723.7962-2.70471 0l-3.75629-4.0554c-.375294-.4052-.351072-1.0379.05411-1.4132.40517-.3753 1.03788-.351 1.41317.0541l3.64136 3.9313 8.8914-9.59923c.3753-.40518 1.008-.4294 1.4131-.05411zm5.0005 0c.4051.3753.4294 1.008.0541 1.41318l-9.0063 9.72336c-.3753.4051-1.008.4294-1.4132.0541s-.4294-1.008-.0541-1.4132l9.0063-9.72333c.3753-.40518 1.008-.4294 1.4132-.05411z'

                fillRule='evenodd'
            />
        </svg>
    ) : (
        <svg
            height='1.8rem'
            width='1.8rem'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
            fill='#B0B0B0'
            className='svg2'

        >
            <path
                d='M9 16.2l-4.2-4.2c-.3-.3-.3-.8 0-1.1.3-.3.8-.3 1.1 0L9 14.6l8.9-8.9c.3-.3.8-.3 1.1 0 .3.3.3.8 0 1.1L10 16.2c-.3.3-.8.3-1.1 0z'

            />
        </svg>

    );

    // Only show the number if more than one person acknowledged, or if the current user is the author
    if (acknowledgementList && acknowledgementList.length > 1) {
        buttonText = acknowledgementList.length;
    } else if (isCurrentAuthor) {
        buttonText = acknowledgementList?.length ? acknowledgementList.length : null;
    }
    // eslint-disable-next-line no-negated-condition
    const textbutton = buttonText !== 1 ? buttonText : null;
    const button = (
        <div className='cardButton'>
            <button
                ref={setReference}
                className={classNames({
                    AcknowledgementButton: true,
                    'AcknowledgementButton--acked': Boolean(acknowledgedAt),
                    'AcknowledgementButton--disabled': buttonDisabled,
                    'AcknowledgementButton--default': !acknowledgementList || acknowledgementList.length === 1,
                })}
                {...getReferenceProps()}
            >
                {icon} {/* Render the selected icon */}
                {textbutton}
            </button>
        </div>
    );

    if (!acknowledgementList || !acknowledgementList.length) {
        return button;
    }

    return (
        <>
            {button}
            {open && (
                <FloatingFocusManager
                    context={context}
                    modal={true}
                >
                    <div
                        ref={setFloating}
                        style={{
                            position: strategy,
                            top: y ?? 0,
                            left: x ?? 0,
                            width: 248,
                            zIndex: 999,
                        }}
                        {...getFloatingProps()}
                    >
                        <PostAcknowledgementsUserPopover
                            currentUserId={currentUserId}
                            list={acknowledgementList.filter(
                                (item): item is { user: UserProfile; acknowledgedAt: number } => Boolean(item.user),
                            )}
                        />

                    </div>
                </FloatingFocusManager>
            )}
        </>
    );
}

export default memo(PostAcknowledgements);
