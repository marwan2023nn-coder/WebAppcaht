import type {Post} from '@workspace/types/posts';

export type FocusPostState = {
    focusedPost: Post | null;
    targetChannelId: string | null;
};

const initialState: FocusPostState = {
    focusedPost: null,
    targetChannelId: null,
};

export default function focusPost(state = initialState, action: any): FocusPostState {
    switch (action.type) {
        case 'SET_FOCUS_POST': {
            const {post, targetChannelId} = action;
            return {focusedPost: post, targetChannelId: targetChannelId ?? null};
        }
        case 'CLEAR_FOCUS_POST': {
            return {focusedPost: null, targetChannelId: null};
        }
        default:
            return state;
    }
}
