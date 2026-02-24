// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

jest.mock('@tippyjs/react', () => ({
    __esModule: true,
    default: () => (<div id='tippyMock'/>),
}));
