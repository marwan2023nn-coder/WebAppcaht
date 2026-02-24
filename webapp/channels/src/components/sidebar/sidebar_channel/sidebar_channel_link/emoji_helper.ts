// utils/emoji_helper.ts

import emojiData from '../../../textbox/emoji.json'; // ← غيّر هذا المسار حسب مكان ملف emoji.json

// خريطة لتحويل الرموز المختصرة إلى الإيموجي الفعلي
const emojiMap: Record<string, string> = {};

emojiData.forEach((emojiEntry) => {
    emojiEntry.aliases.forEach((alias) => {
        emojiMap[`:${alias}:`] = emojiEntry.emoji;
    });
});

/**
 * تستبدل جميع الرموز المختصرة (:smile:) بالإيموجي الفعلي 😄
 * @param text النص المُدخل
 * @returns النص بعد استبدال الرموز التعبيرية
 */
export function replaceEmojiCodes(text: string): string {
    if (!text) {
        return '';
    }

    return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match) => {
        return emojiMap[match] || match;
    });
}
