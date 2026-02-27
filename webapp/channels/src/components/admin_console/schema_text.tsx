// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

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
            const html = marked(text, {
                breaks: true,
                sanitize: false,
                renderer: new CustomRenderer(),
            });

            return (
                <span>
                    {messageHtmlToComponent(html)}
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
