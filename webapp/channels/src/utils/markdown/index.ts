// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import DOMPurify from 'dompurify';
import marked from 'marked';

import {createSelector} from 'workspace-redux/selectors/create_selector';
import {getAutolinkedUrlSchemes, getConfig} from 'workspace-redux/selectors/entities/general';

import store from 'stores/redux_store';

import type EmojiMap from 'utils/emoji_map';
import RemoveMarkdown from 'utils/markdown/remove_markdown';
import {convertEntityToCharacter} from 'utils/text_formatting';
import {getScheme} from 'utils/url';

import Renderer from './renderer';

const removeMarkdown = new RemoveMarkdown();

export function format(text: string, options = {}, emojiMap?: EmojiMap) {
    return formatWithRenderer(text, new Renderer({}, options, emojiMap));
}

export function formatWithRenderer(text: string, renderer: marked.Renderer) {
    const state = store.getState();
    const config = getConfig(state);
    const urlFilter = getAutolinkedUrlSchemeFilter(state);

    const markdownOptions = {
        renderer,
        sanitize: false,
        gfm: true,
        tables: true,
        mangle: false,
        inlinelatex: config.EnableLatex === 'true' && config.EnableInlineLatex === 'true',
        urlFilter,
    };

    const html = marked(text, markdownOptions).trim();

    return DOMPurify.sanitize(html, {
        ADD_ATTR: [
            'data-mention',
            'data-hashtag',
            'data-emoticon',
            'data-channel-mention',
            'data-channel-mention-team',
            'data-sum-of-members-mention',
            'data-plan-mention',
            'data-latex',
            'data-inline-latex',
            'data-codeblock-code',
            'data-codeblock-language',
            'data-codeblock-searchedcontent',
            'data-link',
            'data-edited-post-id',
            'target',
        ],
        ADD_TAGS: ['span', 'div', 'p', 'br', 'img', 'a', 'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'del', 'strong', 'em', 'ins', 'hr'],
        FORBID_TAGS: ['style', 'script', 'iframe', 'frame', 'object', 'embed', 'form', 'input', 'textarea', 'button', 'select', 'option', 'meta', 'link', 'base'],
        FORBID_ATTR: ['onerror', 'onload', 'onmouseover', 'onfocus', 'onclick'],
    });
}

const getAutolinkedUrlSchemeFilter = createSelector(
    'getAutolinkedUrlSchemeFilter',
    getAutolinkedUrlSchemes,
    (autolinkedUrlSchemes: string[]) => {
        return (url: string) => {
            const scheme = getScheme(url);

            return !scheme || autolinkedUrlSchemes.includes(scheme);
        };
    },
);

export function stripMarkdown(text: string) {
    if (typeof text === 'string' && text.length > 0) {
        return convertEntityToCharacter(
            formatWithRenderer(text, removeMarkdown),
        ).trim();
    }

    return text;
}
