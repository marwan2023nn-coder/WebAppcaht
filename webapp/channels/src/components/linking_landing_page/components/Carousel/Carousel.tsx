// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';

import type {CarouselProps} from '../../types/carousel.types';
import FlipCard from '../FlipCard/FlipCard';
import './Carousel.scss';

const Carousel: React.FC<CarouselProps> = ({cards}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const autoPlayInterval = 3000; // 5 seconds per slide

    const handleNextClick = useCallback(() => {
        setActiveIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
    }, [cards.length]);

    const handlePrevClick = () => {
        setActiveIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
    };

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isAutoPlaying) {
            intervalId = setInterval(handleNextClick, autoPlayInterval);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isAutoPlaying, handleNextClick]);

    const handleMouseEnter = () => {
        setIsAutoPlaying(false);
    };

    const handleMouseLeave = () => {
        setIsAutoPlaying(true);
    };

    const getVisibleCards = () => {
        const visibleIndexes = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
        return visibleIndexes.map((offset) => {
            let index = (activeIndex + offset) % cards.length;
            if (index < 0) {
                index += cards.length;
            }
            return {
                card: cards[index],
                offset,
            };
        });
    };
    return (
        <div
            className='carousel-container'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className='carousel-track'>
                {getVisibleCards().map(({card, offset}) => (
                    <div
                        key={card.id}
                        className={`card-wrapper ${offset === 0 ? 'active' : ''}`}
                        style={{
                            transform: `translate3d(${offset * 120}px, 0, ${
                                Math.abs(offset) * -20
                            }px)`,
                            filter: offset === 0 ? 'none' : 'blur(2px)', // Apply blur for inactive cards
                            pointerEvents: offset === 0 ? 'auto' : 'none',
                            zIndex: offset === 0 ? 10 : 9 - Math.abs(offset),
                            perspective: 1000,
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: 'none',
                                zIndex: 1,
                            }}
                        />
                        <FlipCard
                            data={card}
                            isActive={offset === 0}
                        />
                    </div>
                ))}
            </div>

            <button
                className='navigation-button prev'
                onClick={handlePrevClick}
            >
                {'>'}
            </button>
            <button
                className='navigation-button next'
                onClick={handleNextClick}
            >
                {'<'}
            </button>
        </div>
    );
};

export default Carousel;
