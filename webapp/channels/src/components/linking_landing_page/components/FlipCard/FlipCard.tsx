// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import type {FlipCardProps} from '../../types/carousel.types';
import './FlipCard.scss';

const FlipCard: React.FC<FlipCardProps> = ({data}) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped(true); // يقلب البطاقة عند الضغط على الزر
    };

    const handleMouseLeave = () => {
        setIsFlipped(false); // يرجع البطاقة عند مغادرة الماوس
    };

    return (
        <div
            className={`flip-card ${isFlipped ? 'flipped' : ''}`}
            onMouseLeave={handleMouseLeave}
        >
            <div className='card-inner'>
                <div className='card-side card-front'>
                    <div className='image-container'>
                        <div className='card-image'>
                            <img
                                src={data.image}
                                alt={data.title}
                            />
                        </div>
                    </div>
                    <div className='card-content'>
                        <p className='card-title'>{data.title}</p>
                        <button
                            className='login-button'
                            onClick={handleButtonClick}
                        >
                            {'      عرض التفاصيل'}
                        </button>
                    </div>
                </div>

                <div className='card-side card-back'>
                    <p className='card-title back-title'>{data.title}</p>
                    <div className='card-description1'>
                        {data.descriptions.map((desc: any, index: any) => (
                            <p key={index}>{desc}</p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlipCard;
