// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import DOMPurify from 'dompurify';
import marked from 'marked';
import PropTypes from 'prop-types';
import React from 'react';
import type {MessageDescriptor} from 'react-intl';
import {FormattedMessage} from 'react-intl';

import messageHtmlToComponent from 'utils/message_html_to_component';

import FormattedMarkdownMessage, {CustomRenderer} from 'components/formatted_markdown_message';

type Props = {
    isMarkdown?: boolean;
    text: string | MessageDescriptor | JSX.Element;
    textValues?: Record<string, React.ReactNode | ((chunks: React.ReactNode) => React.ReactNode)>;
}

const SchemaText = ({
    isMarkdown,
    text,
    textValues,
}: Props) => {
    if (typeof text === 'string') {
        if (isMarkdown) {
            const markedUpMessage = marked(text, {
                breaks: true,
                sanitize: false,
                renderer: new CustomRenderer(),
            });

            const sanitizedMessage = DOMPurify.sanitize(markedUpMessage, {
                ADD_ATTR: ['target', 'rel'],
                ADD_TAGS: ['span', 'div', 'p', 'br', 'img', 'a', 'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'del', 'strong', 'em', 'ins', 'hr'],
                FORBID_TAGS: ['style', 'script', 'iframe', 'frame', 'object', 'embed', 'form', 'input', 'textarea', 'button', 'select', 'option', 'meta', 'link', 'base'],
                FORBID_ATTR: ['onerror', 'onload', 'onmouseover', 'onfocus', 'onclick'],
            });

            return (
                <span>
                    {messageHtmlToComponent(sanitizedMessage)}
                </span>
            );
        }

        return <span>{text}</span>;
    }

    if ('id' in text) {
        if (isMarkdown) {
            return (
                <FormattedMarkdownMessage
                    {...text}
                    values={textValues}
                />
            );
        }

        return (
            <FormattedMessage
                {...text}
                values={textValues}
            />
        );
    }

    return text as JSX.Element;
};

SchemaText.propTypes = {
    isMarkdown: PropTypes.bool,
    text: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.element,
    ]).isRequired,
    textValues: PropTypes.objectOf(PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
        PropTypes.node,
        PropTypes.func,
    ])),
};

export default SchemaText;
