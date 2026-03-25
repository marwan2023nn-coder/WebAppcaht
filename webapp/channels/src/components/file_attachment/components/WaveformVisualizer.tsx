// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState, useEffect} from 'react';
import './_waveform.scss';

interface WaveformVisualizerProps {
    progress: number;
    onSeek: (progress: number) => void;
}

export default function WaveformVisualizer({
    progress,
    onSeek,
}: WaveformVisualizerProps) {
    const waveformRef = useRef<HTMLDivElement>(null);
    const totalBars = 35;
    const [bars, setBars] = useState<number[]>([]);

    // Generate random heights for the bars only once when the component mounts
    useEffect(() => {
        const initialBars = Array.from(
            {length: totalBars},
            () => Math.random() * 0.5 + 0.5,
        );
        setBars(initialBars);
    }, [totalBars]);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!waveformRef.current) {
            return;
        }

        const rect = waveformRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const isRtl = document.documentElement.dir === 'rtl';
        const newProgress = isRtl ? Math.max(0, Math.min(1, x / rect.width)) : Math.max(0, Math.min(1, 1 - x / rect.width));
        onSeek(newProgress);
    };

    return (
        <button style={{backgroundColor: 'transparent', border: 'none'  , width: '140px'}}>
            <div
                ref={waveformRef}
                className='waveform'
                onClick={handleClick}
            >
                {bars.map((height, index) => (
                    <div
                        key={index}
                        className={`${
                            (index / totalBars) * 100 <= progress * 100 ? 'bg-progress' : 'bg-default'
                        } waveform__bar`}
                        style={{
                            height: `${height * 100}%`,
                        }}
                    />
                ))}
            </div>
        </button>
    );
}
