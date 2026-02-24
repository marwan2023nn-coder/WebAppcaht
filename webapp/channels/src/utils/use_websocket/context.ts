// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {WebSocketClient} from '@workspace/client';

export const WebSocketContext = React.createContext<WebSocketClient>(null!);
