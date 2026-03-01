// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useRef, useState} from 'react';
import {FormattedMessage, defineMessages, useIntl} from 'react-intl';

import WithTooltip from 'components/with_tooltip';

import {copyToClipboard} from 'utils/utils';

type Props = {
    content: string;
    isForText?: boolean;
    className?: string;
};

const CopyButton: React.FC<Props> = (props: Props) => {
    const intl = useIntl();

    const [isCopied, setIsCopied] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const copyText = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setIsCopied(true);

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            setIsCopied(false);
        }, 2000);

        copyToClipboard(props.content);
    };

    let tooltipMessage;
    if (isCopied) {
        tooltipMessage = messages.copied;
    } else if (props.isForText) {
        tooltipMessage = messages.copyText;
    } else {
        tooltipMessage = messages.copyCode;
    }

    const tooltipText = (
        <FormattedMessage {...tooltipMessage}/>
    );

    const buttonClassName = classNames('post-code__clipboard style--none', props.className);

    return (
        <WithTooltip
            title={tooltipText}
        >
            <button
                type='button'
                className={buttonClassName}
                onClick={copyText}
                aria-label={intl.formatMessage(tooltipMessage)}
            >
                {!isCopied &&
                    <i
                        className='icon icon-content-copy'
                    />
                }
                {isCopied &&
                    <i
                        className='icon icon-check'
                    />
                }
            </button>
        </WithTooltip>
    );
};

const messages = defineMessages({
    copied: {
        id: 'copied.message',
        defaultMessage: 'Copied',
    },
    copyCode: {
        id: 'copy.code.message',
        defaultMessage: 'Copy code',
    },
    copyText: {
        id: 'copy.text.message',
        defaultMessage: 'Copy text',
    },
});

export default CopyButton;
