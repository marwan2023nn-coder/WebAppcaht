// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import deepEqual from 'fast-deep-equal';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import type {Post} from '@workspace/types/posts';

import {ensureString} from 'workspace-redux/utils/post_utils';

import {emitCloseRightHandSide} from 'actions/global_actions';

import Scrollbars from 'components/common/scrollbars';
import Markdown from 'components/markdown';
import PostProfilePicture from 'components/post_profile_picture';
import RhsCardHeader from 'components/rhs_card_header';
import UserProfile from 'components/user_profile';

import Constants from 'utils/constants';
import DelayedAction from 'utils/delayed_action';

import type {PostPluginComponent} from 'types/store/plugins';
import type {RhsState} from 'types/store/rhs';

type Props = {
    isMobileView: boolean;
    selected?: Post;
    pluginPostCardTypes?: Record<string, PostPluginComponent>;
    previousRhsState?: RhsState;
    enablePostUsernameOverride?: boolean;
    teamUrl?: string;
};

const RhsCard = ({
    isMobileView,
    selected,
    pluginPostCardTypes = {},
    previousRhsState,
    enablePostUsernameOverride,
    teamUrl,
}: Props) => {
    const [isScrolling, setIsScrolling] = useState(false);

    const handleScrollStop = useCallback(() => {
        setIsScrolling(false);
    }, []);

    const scrollStopAction = useMemo(() => new DelayedAction(handleScrollStop), [handleScrollStop]);

    useEffect(() => {
        return () => {
            scrollStopAction.cancel();
        };
    }, [scrollStopAction]);

    const handleScroll = useCallback(() => {
        if (!isScrolling) {
            setIsScrolling(true);
        }

        scrollStopAction.fireAfter(Constants.SCROLL_DELAY);
    }, [isScrolling, scrollStopAction]);

    const handleClick = useCallback(() => {
        if (isMobileView) {
            emitCloseRightHandSide();
        }
    }, [isMobileView]);

    if (selected == null) {
        return (<div/>);
    }

    const postType = selected.type;
    let content: ReactNode = null;
    if (pluginPostCardTypes && Object.hasOwn(pluginPostCardTypes, postType)) {
        const PluginComponent = pluginPostCardTypes[postType].component;
        content = <PluginComponent post={selected}/>;
    }

    if (!content) {
        const message = ensureString(selected.props?.card);
        content = (
            <div className='info-card'>
                <Markdown message={message}/>
            </div>
        );
    }

    const overrideUsername = ensureString(selected.props.override_username);
    const overwriteName = (overrideUsername && enablePostUsernameOverride) ? overrideUsername : undefined;

    const user = (
        <UserProfile
            userId={selected.user_id}
            hideStatus={true}
            disablePopover={true}
            overwriteName={overwriteName}
        />
    );

    const avatar = (
        <PostProfilePicture
            compactDisplay={false}
            post={selected}
            userId={selected.user_id}
        />
    );

    return (
        <div className='sidebar-right__body sidebar-right__card'>
            <RhsCardHeader previousRhsState={previousRhsState}/>
            <Scrollbars onScroll={handleScroll}>
                <div className='post-right__scroll'>
                    {content}
                    <div className='d-flex post-card--info'>
                        <div className='post-card--post-by overflow--ellipsis'>
                            <FormattedMessage
                                id='rhs_card.message_by'
                                defaultMessage='Message by {avatar} {user}'
                                values={{user, avatar}}
                            />
                        </div>
                        <div className='post-card--view-post'>
                            <Link
                                to={`${teamUrl}/pl/${selected.id}`}
                                className='post__permalink'
                                onClick={handleClick}
                            >
                                <FormattedMessage
                                    id='rhs_card.jump'
                                    defaultMessage='Jump'
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </Scrollbars>
        </div>
    );
};

export default memo(RhsCard, (prevProps, nextProps) => {
    return deepEqual(prevProps.selected?.props?.card, nextProps.selected?.props?.card) &&
           prevProps.isMobileView === nextProps.isMobileView &&
           prevProps.enablePostUsernameOverride === nextProps.enablePostUsernameOverride &&
           prevProps.teamUrl === nextProps.teamUrl &&
           prevProps.previousRhsState === nextProps.previousRhsState &&
           prevProps.pluginPostCardTypes === nextProps.pluginPostCardTypes;
});
