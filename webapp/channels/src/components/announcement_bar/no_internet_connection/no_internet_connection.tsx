// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {GenericModal} from '@workspace/components';

import './no_internet_connection.scss';
import ExternalLink from 'components/external_link';

import NoInternetConnectionSvg from './no-internet-connection-svg';

type NoInternetConnectionProps = {
    onExited: () => void;
};
const NoInternetConnection: React.FC<NoInternetConnectionProps> = (props: NoInternetConnectionProps) => {
    return (
        <GenericModal
            compassDesign={true}
            onExited={props.onExited}
            modalHeaderText=''
        >
            <div className='noInternetConnection__container'>
                <div className='noInternetConnection__image'>
                    <NoInternetConnectionSvg/>
                </div>
                <span className='noInternetConnection__noAccessToInternet'>
                    <FormattedMessage
                        id='announcement_bar.warn.no_internet_connection'
                        defaultMessage='Looks like you do not have access to the internet.'
                    />
                </span>
                <span className='noInternetConnection__contactSupport'>
                    <FormattedMessage
                        id='announcement_bar.warn.contact_support_text'
                        defaultMessage='To renew your license, contact support at support@workspace.com.'
                    />
                </span>
                <span className='noInternetConnection__emailUs'>
                    <FormattedMessage
                        id='announcement_bar.warn.contact_support_email'
                        defaultMessage='<a>Contact support</a>.'
                        values={{
                            a: (chunks) => (
                                <ExternalLink
                                    href='mailto:support@workspace.com'
                                    location='announcement_bar'
                                >
                                    {chunks}
                                </ExternalLink>
                            ),
                        }}
                    />
                </span>
            </div>
        </GenericModal>
    );
};

export default NoInternetConnection;
