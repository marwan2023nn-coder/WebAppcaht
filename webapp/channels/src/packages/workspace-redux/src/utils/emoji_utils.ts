// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Emoji, SystemEmoji} from '@workspace/types/emojis';

import {Client4} from 'workspace-redux/client';

export function isSystemEmoji(emoji: Emoji): emoji is SystemEmoji {
    if ('category' in emoji) {
        return emoji.category !== 'custom';
    }

    return !('id' in emoji);
}

export function getEmojiImageUrl(emoji: Emoji): string {
    // If its the workspace custom emoji
    if (!isSystemEmoji(emoji) && emoji.id === 'sofa') {
        return Client4.getSystemEmojiImageUrl('sofa');
    }

    if (isSystemEmoji(emoji)) {
        const emojiUnified = emoji?.unified?.toLowerCase() ?? '';
        const filename = emojiUnified || emoji.short_names[0];

        return Client4.getSystemEmojiImageUrl(filename);
    }

    return Client4.getEmojiRoute(emoji.id) + '/image';
}

export function getEmojiName(emoji: Emoji): string {
    return isSystemEmoji(emoji) ? emoji.short_name : emoji.name;
}

export function parseEmojiNamesFromText(text: string): string[] {
    if (!text.includes(':')) {
        return [];
    }

    const pattern = /:([A-Za-z0-9_-]+):/gi;
    const customEmojis = new Set<string>();
    let match;
    while ((match = pattern.exec(text)) !== null) {
        if (!match) {
            continue;
        }

        customEmojis.add(match[1]);
    }

    return Array.from(customEmojis);
}
