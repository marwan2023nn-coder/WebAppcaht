// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import { AudioTypes } from 'utils/constants';
export type AudioState = {
    audioUrl: string | null;
    mimeType: string | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    playbackRate: number;
    senderId?: string;
    isBackground: boolean; // ✅ يحدد ما إذا كان الصوت يعمل في الخلفية
};

const initialState: AudioState = {
    audioUrl: null,
    mimeType: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    senderId: undefined,
    isBackground: false, // ✅ افتراضيًا لا يعمل في الخلفية
};

type AudioAction = {
    type: string;
    payload?: Partial<AudioState>;
};

export default function audioReducer(state: AudioState = initialState, action: AudioAction): AudioState {
    switch (action.type) {
        case AudioTypes.SET_AUDIO:
            return {
                ...state,
                ...action.payload,
                isBackground: false, // عند تشغيل صوت جديد، يكون في المقدمة
            };
        case AudioTypes.PLAY_AUDIO:
            return {
                ...state,
                isPlaying: true,
            };
        case AudioTypes.PAUSE_AUDIO:
            return {
                ...state,
                isPlaying: false,
            };
        case AudioTypes.UPDATE_TIME:
        case AudioTypes.UPDATE_AUDIO_TIME:
            return {
                ...state,
                currentTime: action.payload?.currentTime || state.currentTime,
            };
        case AudioTypes.SET_BACKGROUND_AUDIO: // ✅ تشغيل الصوت في الخلفية
            return {
                ...state,
                isBackground: true,
            };
        case AudioTypes.RESET_AUDIO:
            return initialState;
        default:
            return state;
    }
}
