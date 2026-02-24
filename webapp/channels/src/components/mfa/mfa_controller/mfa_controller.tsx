// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Route, Switch} from 'react-router-dom';
import type {RouteComponentProps} from 'react-router-dom';

import {Client4} from 'workspace-redux/client';

import {emitUserLoggedOutEvent} from 'actions/global_actions';

import BackButton from 'components/common/back_button';
import LogoutIcon from 'components/widgets/icons/fa_logout_icon';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import logoImage from 'images/logo.png';

// eslint-disable-next-line import/order
import img from '../../login/imagelogin/Pattern.png';
import '../../login/login.scss';

import Confirm from '../confirm';
import Setup from '../setup';

type Location = {
    search: string;
}

type Props = {
    location: Location;
    children?: React.ReactNode;
    mfa: boolean;
    enableMultifactorAuthentication: boolean;
    enforceMultifactorAuthentication: boolean;
    siteName?: string;
    customBrandText?: string;

    /*
     * Object from react-router
     */
    match: {
        url: string;
    };
}

type State = {
    enforceMultifactorAuthentication: boolean;
    brandImageError: boolean;
}

export default class MFAController extends React.PureComponent<Props & RouteComponentProps, State> {
    public constructor(props: Props & RouteComponentProps) {
        super(props);

        this.state = {
            enforceMultifactorAuthentication: props.enableMultifactorAuthentication,
            brandImageError: false,
        };
    }

    public componentDidMount(): void {
        document.body.classList.add('sticky');
        document.getElementById('root')!.classList.add('container-fluid');

        if (!this.props.enableMultifactorAuthentication) {
            this.props.history.push('/');
        }
    }

    public componentWillUnmount(): void {
        document.body.classList.remove('sticky');
        document.getElementById('root')!.classList.remove('container-fluid');
    }

    public handleOnClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
        e.preventDefault();
        emitUserLoggedOutEvent('/login');
    };

    public handleBrandImageError = (): void => {
        this.setState({brandImageError: true});
    };

    public updateParent = (state: Partial<State>): void => {
        this.setState(state as State);
    };

    public render(): JSX.Element {
        let backButton;
        if (this.props.mfa && this.props.enforceMultifactorAuthentication) {
            backButton = (
                <div
                    className='btn btn-primary'
                    style={{position: 'absolute', top: '20px', right: '20px', zIndex: 1000}}
                >
                    <button
                        className='style--none'
                        onClick={this.handleOnClick}
                    >
                        <LogoutIcon/>
                        <FormattedMessage
                            id='web.header.logout'
                            defaultMessage='Logout'
                        />
                    </button>
                </div>
            );
        } else {
            backButton = (
                <div style={{position: 'absolute', top: '20px', left: '20px', zIndex: 1000}}>
                    <BackButton/>
                </div>
            );
        }

        return (
            <div className='login-body'>
                <div className='login-body-content'>
                    {backButton}
                    <div
                        className={classNames(
                            'login-body-message login-body-content custom-branding with-brand-image',
                            {
                                'custom-branding': true,
                                'with-brand-image': !this.state.brandImageError,
                            },
                        )}
                    >
                        <div className='login-body-custom-branding-image'>
                            <div className='login-body-custom-branding-text'>
                                <img
                                    className={classNames('login-body-custom-branding-image-logo')}
                                    alt='brand image'
                                    src={Client4.getBrandImageUrl('0')}
                                    onError={this.handleBrandImageError}
                                />
                                <p>{this.props.siteName || 'مـنصة عمـل ســـوفـا'}</p>
                                <p className='custom-text'>{this.props.customBrandText || 'Sofa Workspace'}</p>
                            </div>

                            <img
                                className={classNames('login-body-custom-branding-image')}
                                alt='brand image'
                                src={img}
                                onError={this.handleBrandImageError}
                            />
                        </div>
                    </div>
                    <div className='login-body-action'>
                        <div
                            className={classNames('login-body-card', {
                                'custom-branding': true,
                            })}
                        >
                            <div
                                className='login-body-card-content text-center'
                                tabIndex={0}
                            >
                                <p className='login-body-card-title'>
                                    <FormattedMessage
                                        id='mfa.setupTitle'
                                        defaultMessage='Multi-factor Authentication Setup'
                                    />
                                </p>
                                <div
                                    id='mfa'
                                    style={{width: '100%'}}
                                >
                                    <Switch>
                                        <Route
                                            path={`${this.props.match.url}/setup`}
                                            render={(props) => (
                                                <Setup
                                                    state={this.state}
                                                    updateParent={this.updateParent}
                                                    {...props}
                                                />
                                            )}
                                        />
                                        <Route
                                            path={`${this.props.match.url}/confirm`}
                                            render={() => (
                                                <Confirm/>
                                            )}
                                        />
                                    </Switch>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
