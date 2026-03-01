// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ChartOptions} from 'chart.js';
import Chart from 'chart.js/auto';
import React, {useEffect, useRef} from 'react';
import {FormattedMessage} from 'react-intl';

type Props = {
    title: React.ReactNode;
    width?: number;
    height?: number;
    data?: any;
    id: string;
    options?: ChartOptions;
}

const DEFAULT_CHART_OPTIONS: ChartOptions = {
    plugins: {
        legend: {
            display: false,
        },
    },
};

const LineChart = ({
    title,
    width,
    height,
    data,
    id,
    options,
}: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        const resizeChart = () => {
            if (chartRef.current && canvasRef.current && chartRef.current.options.responsive) {
                canvasRef.current.style.width = '100%';
            }
        };

        window.addEventListener('resize', resizeChart);
        return () => {
            window.removeEventListener('resize', resizeChart);
        };
    }, []);

    useEffect(() => {
        const currentData = data && data.labels.length > 0;

        if (!currentData) {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
            return;
        }

        if (!canvasRef.current) {
            return;
        }

        const ctx = canvasRef.current.getContext('2d') as CanvasRenderingContext2D;
        const dataCopy = JSON.parse(JSON.stringify(data));
        const mergedOptions = {...DEFAULT_CHART_OPTIONS, ...options};

        if (chartRef.current) {
            chartRef.current.data = dataCopy;
            chartRef.current.options = mergedOptions;
            chartRef.current.update();
        } else {
            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: dataCopy,
                options: mergedOptions,
            });
        }
    }, [data, options]);

    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, []);

    let content;
    if (data == null) {
        content = (
            <FormattedMessage
                id='analytics.chart.loading'
                defaultMessage='Loading...'
            />
        );
    } else if (data.labels.length === 0) {
        content = (
            <h5>
                <FormattedMessage
                    id='analytics.chart.meaningful'
                    defaultMessage='Not enough data for a meaningful representation.'
                />
            </h5>
        );
    } else {
        content = (
            <canvas
                data-testid={id}
                ref={canvasRef}
                width={width}
                height={height}
                data-labels={data.labels}
            />
        );
    }

    return (
        <div className='col-sm-12'>
            <div className='total-count by-day'>
                <div className='title'>
                    {title}
                </div>
                <div className='content'>
                    {content}
                </div>
            </div>
        </div>
    );
};

export default React.memo(LineChart);
