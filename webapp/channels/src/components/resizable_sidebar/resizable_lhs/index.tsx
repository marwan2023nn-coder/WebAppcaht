// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {HTMLAttributes} from 'react';
import React, {useRef} from 'react';

import {DEFAULT_LHS_WIDTH, CssVarKeyForResizable, ResizeDirection} from '../constants';
import ResizableDivider from '../resizable_divider';

interface Props extends HTMLAttributes<'div'> {
    children: React.ReactNode;
    resizeHandleName?: string;
    globalCssVar?: CssVarKeyForResizable;
    defaultWidth?: number;
}

function ResizableLhs({
    children,
    id,
    className,
    resizeHandleName,
    globalCssVar,
    defaultWidth,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            id={id}
            className={className}
            ref={containerRef}
        >
            {children}
            <ResizableDivider
                name={resizeHandleName || 'lhsResizeHandle'}
                globalCssVar={globalCssVar || CssVarKeyForResizable.LHS}
                defaultWidth={defaultWidth ?? DEFAULT_LHS_WIDTH}
                dir={ResizeDirection.LEFT}
                containerRef={containerRef}
            />
        </div>
    );
}

export default ResizableLhs;
