// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import plugins from './plugins';
import storage from './storage';
import views from './views';
import audio from './audio_reducer';
import replyBox from './reply_box';
// import selectedPostsIds from './views/selected_posts_ids';
import focusPost from './focus_post';

export default {
    views,
    plugins,
    storage,
    audio,
    replyBox,
    // selectedPostsIds,
    focusPost,
};
