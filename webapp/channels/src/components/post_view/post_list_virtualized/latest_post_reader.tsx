// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';

import type {Post} from '@workspace/types/posts';

import {getPost} from 'workspace-redux/selectors/entities/posts';

import {getLatestPostId, usePostAriaLabel} from 'utils/post_utils';

import type {GlobalState} from 'types/store';

interface Props {
    postIds?: string[];
}

const LatestPostReader = (props: Props): JSX.Element => {
    const {postIds} = props;
    const latestPostId = useMemo(() => getLatestPostId(postIds || []), [postIds]);
    const latestPost = useSelector<GlobalState, Post>((state) => getPost(state, latestPostId));

    const ariaLabel = usePostAriaLabel(latestPost);

    return (
        <span
            className='sr-only'
            aria-live='polite'
        >
            {ariaLabel}
        </span>
    );
};

export default LatestPostReader;
