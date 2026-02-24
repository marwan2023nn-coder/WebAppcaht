// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// eslint-disable-next-line consistent-return
export const dateStringValidator = (props, propName, componentName) => {
    const value = props[propName];

    if (value && isNaN(Date.parse(value))) {
        return new Error(
            `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Expected a valid date string (ISO 8601) but received \`${value}\`.`,
        );
    }
};

// eslint-disable-next-line consistent-return
export const urlValidator = (props, propName, componentName) => {
    const url = props[propName];

    try {
        // eslint-disable-next-line no-new
        new URL(url);
    } catch (error) {
        return new Error(
            `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Expected a valid URL but received \`${url}\`.`,
        );
    }
};
