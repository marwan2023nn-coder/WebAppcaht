// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {ComponentProps} from 'react';
import {Link} from 'react-router-dom';

import * as GlobalActions from 'actions/global_actions';

import Timestamp from 'components/timestamp';
import WithTooltip from 'components/with_tooltip';

import {Locations} from 'utils/constants';
import {isMobile} from 'utils/user_agent';

const getTimeFormat: ComponentProps<typeof Timestamp>['useTime'] = (_, {hour, minute, second}) => ({hour, minute, second});
const getDateFormat: ComponentProps<typeof Timestamp>['useDate'] = {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'};

type Props = {

    /*
     * If true, time will be rendered as a permalink to the post
     */
    isPermalink: boolean;

    /*
     * The time to display
     */
    eventTime: number;

    isMobileView: boolean;
    location: string;

    /*
     * The post id of posting being rendered
     */
    postId: string;
    teamUrl: string;
    timestampProps?: ComponentProps<typeof Timestamp>;

    deliveredAt?: number;
    readAt?: number;
}

export default class PostTime extends React.PureComponent<Props> {
    static defaultProps: Partial<Props> = {
        eventTime: 0,
        location: Locations.CENTER,
    };

    handleClick = () => {
        if (this.props.isMobileView) {
            GlobalActions.emitCloseRightHandSide();
        }
    };

    render() {
        const {
            eventTime,
            isPermalink,
            location,
            postId,
            teamUrl,
            timestampProps = {},
            deliveredAt,
            readAt,
        } = this.props;

        let statusIcon = null;
        if (readAt && readAt > 0) {
            statusIcon = (
                <span className='post__status-read'>
                    <svg
                        width='16'
                        height='11'
                        viewBox='0 0 16 11'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            d='M15.0001 1.5L6.00012 10L1.50012 5.75L2.25012 5L6.00012 8.5L14.2501 0.75L15.0001 1.5Z'
                            fill='#34B7F1'
                        />
                        <path
                            d='M11.0001 1.5L6.00012 6L4.80012 4.8L4.05012 5.55L6.00012 7.5L12.0001 1.5H11.0001Z'
                            fill='#34B7F1'
                        />
                    </svg>
                </span>
            );
        } else if (deliveredAt && deliveredAt > 0) {
            statusIcon = (
                <span className='post__status-delivered'>
                    <svg
                        width='16'
                        height='11'
                        viewBox='0 0 16 11'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            d='M15.0001 1.5L6.00012 10L1.50012 5.75L2.25012 5L6.00012 8.5L14.2501 0.75L15.0001 1.5Z'
                            fill='currentColor'
                        />
                        <path
                            d='M11.0001 1.5L6.00012 6L4.80012 4.8L4.05012 5.55L6.00012 7.5L12.0001 1.5H11.0001Z'
                            fill='currentColor'
                        />
                    </svg>
                </span>
            );
        } else if (deliveredAt === 0 && readAt === 0 && eventTime > 0 && postId && !postId.startsWith('p')) {
            // Sent icon - only show if we have a valid real postId (not pending)
            // and receipts are explicitly requested (by passing 0) but not yet set.
            // If receipts are NOT requested (passed as undefined/null), don't show any icon.
            statusIcon = (
                <span className='post__status-sent'>
                    <svg
                        width='10'
                        height='10'
                        viewBox='0 0 10 10'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            d='M9 1.5L3.5 8L1 5.5L1.75 4.75L3.5 6.5L8.25 0.75L9 1.5Z'
                            fill='currentColor'
                        />
                    </svg>
                </span>
            );
        }

        const postTime = (
            <div className='post__time-wrapper'>
                <Timestamp
                    value={eventTime}
                    className='post__time'
                    useDate={false}
                    {...timestampProps}
                />
                {statusIcon}
            </div>
        );

        const content = isMobile() || !isPermalink ? (
            <div
                role='presentation'
                className='post__permalink post_permalink_mobile_view'
            >
                {postTime}
            </div>
        ) : (
            <Link
                id={`${location}_time_${postId}`}
                to={`${teamUrl}/pl/${postId}`}
                className='post__permalink'
                onClick={this.handleClick}
                aria-labelledby={eventTime.toString()}
            >
                {postTime}
            </Link>
        );

        return (
            <WithTooltip
                title={
                    <Timestamp
                        value={eventTime}
                        useSemanticOutput={false}
                        useDate={getDateFormat}
                        useTime={getTimeFormat}
                    />
                }
            >
                {content}
            </WithTooltip>
        );
    }
}
