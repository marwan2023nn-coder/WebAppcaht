// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {injectIntl} from 'react-intl';
import type {WrappedComponentProps} from 'react-intl';

import QuickInput from 'components/quick_input';

import Constants from 'utils/constants';
import * as Keyboard from 'utils/keyboard';
import * as Utils from 'utils/utils';

import ChannelFilter from '../channel_filter';

export type Props = WrappedComponentProps & {
    showUnreadsCategory: boolean;
    searchTerm: string;
    onSearchTermChange: (searchTerm: string) => void;
    onClearSearchTerm: () => void;
};

type State = {
    focused: boolean;
};

class ChannelNavigator extends React.PureComponent<Props, State> {
    private textboxRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;

    constructor(props: Props) {
        super(props);

        this.textboxRef = React.createRef();

        this.state = {
            focused: false,
        };
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleQuickSwitchKeyPress);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleQuickSwitchKeyPress);
    }

    private focusTextbox = (): void => {
        const textbox = this.textboxRef.current;
        if (!textbox) {
            return;
        }

        if (document.activeElement !== textbox) {
            textbox.focus();
            Utils.placeCaretAtEnd(textbox);
        }
    };

    handleQuickSwitchKeyPress = (e: KeyboardEvent) => {
        if (Keyboard.cmdOrCtrlPressed(e) && !e.shiftKey && Keyboard.isKeyPressed(e, Constants.KeyCodes.K)) {
            if (!e.altKey && !Utils.isTextSelectedInPostOrReply(e)) {
                e.preventDefault();
                this.focusTextbox();
            }
        }
    };

    private onInput = (e?: React.FormEvent<HTMLInputElement>): void => {
        if (!e) {
            return;
        }
        this.props.onSearchTermChange(e.currentTarget.value);
    };

    private handleFocus = (): void => {
        if (!this.state.focused) {
            this.setState({focused: true});
        }
    };

    private handleBlur = (e: React.FocusEvent): void => {
        const relatedTarget = e.relatedTarget as Node | null;
        if (relatedTarget && e.currentTarget instanceof HTMLElement && e.currentTarget.contains(relatedTarget)) {
            return;
        }

        if (this.state.focused) {
            this.setState({focused: false});
        }
    };

    private handleClear = (): void => {
        this.props.onClearSearchTerm();
    };

    private handleKeyDown = (e: React.KeyboardEvent): void => {
        if (Keyboard.isKeyPressed(e.nativeEvent, Constants.KeyCodes.ESCAPE)) {
            e.preventDefault();
            this.handleClear();
        }
    };

    render() {
        return (
            <div className={'SidebarChannelNavigator webapp'}>
                {!this.props.showUnreadsCategory && <ChannelFilter/>}
                <div
                    className='search-form__container'
                    style={{flex: 1}}
                    data-testid='SidebarChannelNavigatorButton'
                    id='SidebarChannelNavigatorButton'
                >
                    <form
                        role='search'
                        className={classNames(['search__form', {'search__form--focused': this.state.focused}])}
                        onSubmit={(e) => e.preventDefault()}
                        style={{overflow: 'visible'}}
                        autoComplete='off'
                        aria-labelledby='SidebarChannelNavigatorInput'
                        onFocusCapture={this.handleFocus}
                        onBlurCapture={this.handleBlur}
                    >
                        <div className='search__font-icon'>
                            <i
                                className='icon icon-magnify'
                                style={{fontSize: '18px'}}
                            />
                        </div>
                        <div className='w-full'>
                            <QuickInput
                                ref={this.textboxRef}
                                id='SidebarChannelNavigatorInput'
                                tabIndex={0}
                                className={'search-bar form-control a11y__region'}
                                {...({
                                    'data-a11y-sort-order': '9',
                                    'aria-describedby': 'searchbar-help-popup',
                                    'aria-controls': 'suggestionList',
                                    'aria-autocomplete': 'list',
                                    'aria-expanded': this.state.focused,
                                    'aria-label': this.props.intl.formatMessage({id: 'sidebar_left.channel_navigator.jumpTo', defaultMessage: 'Find channel'}),
                                } as any)}
                                role='combobox'
                                placeholder={this.props.intl.formatMessage({id: 'sidebar_left.channel_navigator.jumpTo', defaultMessage: 'Find channel'})}
                                value={this.props.searchTerm}
                                onInput={this.onInput}
                                maxLength={64}
                                type='search'
                                onKeyDown={this.handleKeyDown}
                                delayInputUpdate={true}
                                clearable={true}
                                onClear={this.handleClear}
                            />
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default injectIntl(ChannelNavigator);
