// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';

import './header_icon_button.scss';

type HeaderIconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: string;

    active?: boolean;
    toggled?: boolean;
};

const HeaderIconButton = React.forwardRef<HTMLButtonElement, HeaderIconButtonProps>(({
    icon = 'workspace',
    active,
    toggled,
    className,
    children,
    ...otherProps
}, ref) => {
    return (
        <button
            ref={ref}
            className={classNames('HeaderIconButton', className, {
                'HeaderIconButton--toggled': toggled,
                'HeaderIconButton--active': active,
            })}
            {...otherProps}
        >
            {children || <i className={`icon-${icon}`}/>}
        </button>
    );
});
HeaderIconButton.displayName = 'HeaderIconButton';
export default HeaderIconButton;
