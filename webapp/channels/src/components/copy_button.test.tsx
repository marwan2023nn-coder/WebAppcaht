// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import CopyButton from 'components/copy_button';

import {copyToClipboard} from 'utils/utils';

jest.mock('utils/utils', () => ({
    copyToClipboard: jest.fn(),
}));

jest.mock('react-intl', () => ({
    ...jest.requireActual('react-intl'),
    useIntl: () => ({
        formatMessage: jest.fn(({defaultMessage}) => defaultMessage),
    }),
}));

describe('components/CopyButton', () => {
    const baseProps = {
        content: 'test content',
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<CopyButton {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for text', () => {
        const props = {...baseProps, isForText: true};
        const wrapper = shallow(<CopyButton {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call copyToClipboard on click', () => {
        const wrapper = shallow(<CopyButton {...baseProps}/>);

        wrapper.find('span').simulate('click', {preventDefault: jest.fn()});

        expect(copyToClipboard).toHaveBeenCalledWith('test content');
    });

    test('should change icon and message after click', () => {
        jest.useFakeTimers();
        const wrapper = shallow(<CopyButton {...baseProps}/>);

        expect(wrapper.find('.icon-content-copy').exists()).toBe(true);
        expect(wrapper.find('.icon-check').exists()).toBe(false);

        wrapper.find('span').simulate('click', {preventDefault: jest.fn()});

        expect(wrapper.find('.icon-content-copy').exists()).toBe(false);
        expect(wrapper.find('.icon-check').exists()).toBe(true);

        jest.advanceTimersByTime(2000);

        expect(wrapper.find('.icon-content-copy').exists()).toBe(true);
        expect(wrapper.find('.icon-check').exists()).toBe(false);

        jest.useRealTimers();
    });
});
