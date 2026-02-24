// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {Link} from 'react-router-dom';

type Props = {

    /**
     * URL to return to
     */
    url?: string;

    className?: string;

    /**
     * onClick handler when user clicks back button
     */
    onClick?: React.EventHandler<React.MouseEvent>;

    iconOnly?: boolean;
}

const BackButton = ({url = '/', className, onClick, iconOnly}: Props): JSX.Element => {
    const {formatMessage} = useIntl();

    return (
        <div className={classNames('signup-header', className)}>
            <Link
                style={{color: 'white'}}
                data-testid='back_button'
                onClick={onClick}
                to={url}
            >
                <button
                    id='teamNameNextButton'
                    type='submit'
                    className={classNames('btn btn-primary mt-8', {'BackButton--iconOnly': iconOnly})}
                    onClick={onClick}
                >

                    <span
                        id='back_button_icon'
                        className='fa  fa-angle-left'
                        title={formatMessage({id: 'generic_icons.back', defaultMessage: 'Back Icon'})}
                    />
                    {!iconOnly && (
                        <FormattedMessage
                            id='web.header.back'
                            defaultMessage='Back'
                        />
                    )}

                </button>
            </Link>
        </div>
    );
};

export default BackButton;
