// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type EmojiMap from 'utils/emoji_map';
import * as Markdown from 'utils/markdown';
import messageHtmlToComponent from 'utils/message_html_to_component';
import {getSiteURL} from 'utils/url';

type Props = {
    id: string;
    value: string;
    emojiMap?: EmojiMap;
}

export default function DialogIntroductionText({id, value, emojiMap}: Props) {
    const formattedMessage = Markdown.format(
        value,
        {
            breaks: true,
            sanitize: true,
            gfm: true,
            siteURL: getSiteURL(),
        },
        emojiMap,
    );

    return (
        <span id={id}>
            {messageHtmlToComponent(formattedMessage)}
        </span>
    );
}
