import type {Post} from '@workspace/types/posts';

export type ReplyBoxState = {
    isReplyBoxOpen: boolean;
    repliedToPost: Post | null;
};

const initialState: ReplyBoxState = {
    isReplyBoxOpen: false,
    repliedToPost: null,
};

export default function replyBox(state = initialState, action: any): ReplyBoxState {
    switch (action.type) {
        case 'TOGGLE_REPLY_BOX': {
            const {method, post} = action;
            if (method === 'close' && state.isReplyBoxOpen) {
                return {isReplyBoxOpen: false, repliedToPost: null};
            } else if (method === 'open' && post) {
                if (state.isReplyBoxOpen && state.repliedToPost === post) return state;
                return {isReplyBoxOpen: true, repliedToPost: post};
            }
            return state;
        }
        default:
            return state;
    }
}
