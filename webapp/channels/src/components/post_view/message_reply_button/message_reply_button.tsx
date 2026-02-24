import React from 'react';

import {FormattedMessage} from 'react-intl';
import {BsReplyAll} from 'react-icons/bs';

import type {Post} from '@workspace/types/posts';

import WithTooltip from 'components/with_tooltip';

type Props = {
    post: Post;
    onClick: (method: 'open' | 'close', post?: Post) => void;
}

const MessageReplyButton = ({post, onClick}: Props) => {
    return (
        <div>
            <WithTooltip
                title={
                    <FormattedMessage
                        id='reply.label'
                        defaultMessage='Reply'
                    />
                }
            >
                <button
                    id={`reply-icon_${post.id}`}
                    className='style--none post-menu__item'
                    onClick={() => onClick('open', post)}
                    type='button'
                >
                    <BsReplyAll
                        size={18}
                        aria-label={'Reply Icon'}
                        style={{transform: 'scaleX(-1)'}}
                    />
                </button>
            </WithTooltip>
        </div>
    );
};

export default MessageReplyButton;
