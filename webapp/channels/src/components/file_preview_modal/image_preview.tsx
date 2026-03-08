// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useState, useContext } from 'react';

import type { FileInfo } from '@workspace/types/files';

import { getFilePreviewUrl, getFileDownloadUrl } from 'workspace-redux/utils/file_utils';

import PostContext from 'components/post_view/post_context';
import { FileTypes } from 'utils/constants';
import { getFileType } from 'utils/utils';

import './image_preview.scss';

interface Props {
    fileInfo: FileInfo;
    canDownloadFiles: boolean;
}

export default function ImagePreview({ fileInfo, canDownloadFiles }: Props) {
    const { overrideGenerateFilePreviewUrl, overrideGenerateFileDownloadUrl } = useContext(PostContext);
    const isExternalFile = !fileInfo.id;

    let fileUrl;
    let previewUrl;
    if (isExternalFile) {
        fileUrl = fileInfo.link;
        previewUrl = fileInfo.link;
    } else {
        fileUrl = overrideGenerateFileDownloadUrl ? overrideGenerateFileDownloadUrl(fileInfo.id) : getFileDownloadUrl(fileInfo.id);
        previewUrl = fileInfo.has_preview_image ? (overrideGenerateFilePreviewUrl ? overrideGenerateFilePreviewUrl(fileInfo.id) : getFilePreviewUrl(fileInfo.id)) : fileUrl;
    }

    if (!canDownloadFiles) {
        return <img src={previewUrl} />;
    }

    let conditionalSVGStyleAttribute;
    if (getFileType(fileInfo.extension) === FileTypes.SVG) {
        conditionalSVGStyleAttribute = {
            width: fileInfo.width,
            height: 'auto',
        };
    }

    // Zoom State
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const containerRef = React.useRef<HTMLDivElement>(null);
    const naturalDimensions = React.useRef({ width: 0, height: 0 });
    const isDragging = React.useRef(false);
    const startPan = React.useRef({ x: 0, y: 0 });
    const initialTransform = React.useRef({ x: 0, y: 0 });

    // Helper to clamp position
    const clampPosition = (x: number, y: number, scale: number, container: DOMRect) => {
        const renderedW = naturalDimensions.current.width * scale;
        const renderedH = naturalDimensions.current.height * scale;

        let fixedX = x;
        let fixedY = y;

        // With the image centered in the container, x/y represent offsets from the center.
        // If the image is smaller than the container, keep it centered (x/y = 0).
        // If larger, clamp so that the image always covers the container.
        if (renderedW <= container.width) {
            fixedX = 0;
        } else {
            const maxOffsetX = (renderedW - container.width) / 2;
            fixedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, x));
        }

        if (renderedH <= container.height) {
            fixedY = 0;
        } else {
            const maxOffsetY = (renderedH - container.height) / 2;
            fixedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, y));
        }

        return { x: fixedX, y: fixedY };
    };

    // Handle initial centering when image loads
    const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        if (!containerRef.current) {
            return;
        }

        const img = event.currentTarget;
        const container = containerRef.current.getBoundingClientRect();

        naturalDimensions.current = { width: img.naturalWidth, height: img.naturalHeight };

        // Calculate scale to fit
        const scaleX = container.width / img.naturalWidth;
        const scaleY = container.height / img.naturalHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Fit to screen, max 1x initial

        setTransform({ x: 0, y: 0, scale });
    };

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        event.preventDefault();

        // Calculate scale change
        const scaleChange = event.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(Math.max(0.1, transform.scale * scaleChange), 10);

        if (newScale === transform.scale) {
            return;
        }

        // Get mouse position relative to container center
        const container = event.currentTarget.getBoundingClientRect();
        const centerX = container.width / 2;
        const centerY = container.height / 2;
        const mouseX = (event.clientX - container.left) - centerX;
        const mouseY = (event.clientY - container.top) - centerY;

        // Calculate new position (center-based)
        const newX = mouseX - ((mouseX - transform.x) * (newScale / transform.scale));
        const newY = mouseY - ((mouseY - transform.y) * (newScale / transform.scale));

        // Apply clamping
        const clamped = clampPosition(newX, newY, newScale, container);

        setTransform({
            x: clamped.x,
            y: clamped.y,
            scale: newScale,
        });
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        isDragging.current = true;
        startPan.current = { x: event.clientX, y: event.clientY };
        initialTransform.current = { x: transform.x, y: transform.y };
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging.current || !containerRef.current) {
            return;
        }
        event.preventDefault();
        const dx = event.clientX - startPan.current.x;
        const dy = event.clientY - startPan.current.y;

        const potentialX = initialTransform.current.x + dx;
        const potentialY = initialTransform.current.y + dy;

        const container = containerRef.current.getBoundingClientRect();
        const clamped = clampPosition(potentialX, potentialY, transform.scale, container);

        setTransform({
            x: clamped.x,
            y: clamped.y,
            scale: transform.scale,
        });
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        isDragging.current = false;
    };

    return (
        <div
            className='image_preview'
            ref={containerRef}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <img
                className='image_preview__image'
                draggable={false}
                loading='lazy'
                data-testid='imagePreview'
                alt={'preview url image'}
                src={previewUrl}
                onLoad={handleImageLoad}
                style={{
                    ...conditionalSVGStyleAttribute,
                    transform: `translate(-50%, -50%) translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                }}
            />
        </div>
    );
}
