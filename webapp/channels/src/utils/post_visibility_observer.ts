// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const callbacks: Map<Element, () => void> = new Map();

/**
 * Shared IntersectionObserver for efficient post visibility tracking.
 * Using a single observer instance reduces memory overhead and improves performance
 * compared to creating an observer for every single unread post.
 */
const observer = (typeof window !== 'undefined' && 'IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const callback = callbacks.get(entry.target);
            if (callback) {
                callback();
                unobserve(entry.target);
            }
        }
    });
}, {threshold: 0.5}) : null;

export function observe(element: Element, callback: () => void) {
    if (!observer) {
        return;
    }
    callbacks.set(element, callback);
    observer.observe(element);
}

export function unobserve(element: Element) {
    if (!observer) {
        return;
    }
    callbacks.delete(element);
    observer.unobserve(element);
}
