// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {resetReloadPostsInChannel} from 'workspace-redux/actions/posts';
import {isCollapsedThreadsEnabled} from 'workspace-redux/selectors/entities/preferences';

const PostsChannelResetWatcher = () => {
    const dispatch = useDispatch();
    const isCRTEnabled = useSelector(isCollapsedThreadsEnabled);
    const loaded = useRef(false);
    useEffect(() => {
        if (loaded.current) {
            dispatch(resetReloadPostsInChannel());
        } else {
            loaded.current = true;
        }
    }, [isCRTEnabled]);
    return null;
};

export default PostsChannelResetWatcher;
