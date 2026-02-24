// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

jest.mock('react-redux', () => {
    return {
        __esModule: true,
        ...jest.requireActual('react-redux'),
        useSelector: (selector: any) => selector({
            entities: {
                general: {
                    config: {
                        SiteName: '',
                        CustomBrandText: '',
                    },
                },
            },
        }),
    };
});

import LoginMfa from 'components/login/login_mfa';
import SaveButton from 'components/save_button';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

describe('components/login/LoginMfa', () => {
    const baseProps = {
        loginId: 'login_id',
        password: 'password',
        onSubmit: jest.fn(),
    };
    const token = '123456';

    const enterOtp = (wrapper: any, value: string) => {
        value.split('').forEach((digit: string, index: number) => {
            wrapper.find('input').at(index).simulate('change', {target: {value: digit}});
        });
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <LoginMfa {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should handle token entered', () => {
        const wrapper = mountWithIntl(
            <LoginMfa {...baseProps}/>,
        );

        expect(wrapper.find('input')).toHaveLength(6);
        let input = wrapper.find('input').first();
        expect(input.props().disabled).toEqual(false);

        let button = wrapper.find(SaveButton).first();
        expect(button.props().disabled).toEqual(true);

        enterOtp(wrapper, token);

        button = wrapper.find(SaveButton).first();
        expect(button.props().disabled).toEqual(false);

        input = wrapper.find('input').first();
        expect(input.props().value).toEqual('1');
    });

    test('should handle submit', () => {
        const wrapper = mountWithIntl(
            <LoginMfa {...baseProps}/>,
        );

        enterOtp(wrapper, token);

        wrapper.find(SaveButton).simulate('click');

        const saveButton = wrapper.find(SaveButton).first().props();
        expect(saveButton.disabled).toEqual(false);
        expect(saveButton.saving).toEqual(true);

        const input = wrapper.find('input').first();
        expect(input.props().disabled).toEqual(true);

        expect(baseProps.onSubmit).toHaveBeenCalledWith({loginId: baseProps.loginId, password: baseProps.password, token});
    });
});
