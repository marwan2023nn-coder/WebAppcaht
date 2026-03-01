// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import CopyButton from 'components/copy_button';

import {withIntl} from 'tests/helpers/intl-test-helper';
import {copyToClipboard} from 'utils/utils';

jest.mock('utils/utils', () => ({
    copyToClipboard: jest.fn(),
}));

describe('components/CopyButton', () => {
    const defaultProps = {
        content: 'test content',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render as a button', () => {
        render(withIntl(<CopyButton {...defaultProps}/>));

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe('BUTTON');
        expect(button).toHaveAttribute('type', 'button');
    });

    test('should call copyToClipboard when clicked', () => {
        render(withIntl(<CopyButton {...defaultProps}/>));

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(copyToClipboard).toHaveBeenCalledWith('test content');
    });

    test('should show check icon after clicking', () => {
        render(withIntl(<CopyButton {...defaultProps}/>));

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const checkIcon = button.querySelector('.icon-check');
        expect(checkIcon).toBeInTheDocument();
    });

    test('should have correct aria-label for code', () => {
        render(withIntl(<CopyButton {...defaultProps}/>));

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Copy code');
    });

    test('should have correct aria-label for text', () => {
        render(withIntl(
            <CopyButton
                {...defaultProps}
                isForText={true}
            />,
        ));

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Copy text');
    });
});
