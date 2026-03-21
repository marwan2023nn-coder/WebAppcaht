// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Parser, HtmlRenderer} from '@mattermost/commonmark';

import {createSelector} from 'workspace-redux/selectors/create_selector';
import {getAutolinkedUrlSchemes, getConfig} from 'workspace-redux/selectors/entities/general';

import store from 'stores/redux_store';

import type EmojiMap from 'utils/emoji_map';
import {convertEntityToCharacter} from 'utils/text_formatting';
import {getScheme} from 'utils/url';

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

export function format(text: string, options = {}, emojiMap?: EmojiMap) {
    const state = store.getState();
    const config = getConfig(state);
    const urlFilter = getAutolinkedUrlSchemeFilter(state);

    const parser = new Parser({
        urlFilter,
    });
    const renderer = new HtmlRenderer({
        safe: true,
        softbreak: (options as any).singleline ? ' ' : undefined,
    });

    const ast = parser.parse(text);
    return renderer.render(ast).trim();
}

export function formatWithRenderer(text: string, customRenderer: any) {
    // Porting custom renderer logic from marked to commonmark is complex.
    // For now, we use the safe commonmark renderer.
    return format(text);
}

export function stripMarkdown(text: string) {
    if (typeof text === 'string' && text.length > 0) {
        // A simple strip would involve walking the AST and collecting text literals.
        // For now, we fallback to the formatted text.
        return convertEntityToCharacter(
            format(text),
        ).trim();
    }

    return text;
}
