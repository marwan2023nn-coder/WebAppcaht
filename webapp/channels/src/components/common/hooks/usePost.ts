// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Post} from '@workspace/types/posts';

import {getPostsByIdsBatched} from 'workspace-redux/actions/posts';
import {getPost} from 'workspace-redux/selectors/entities/posts';

import {makeUseEntity} from './useEntity';

export const usePost = makeUseEntity<Post>({
    name: 'usePost',
    fetch: (postId: string) => getPostsByIdsBatched([postId]),
    selector: getPost,
});
