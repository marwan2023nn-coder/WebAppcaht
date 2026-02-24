// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import '../styles/main.scss';

const About = () => {
    return (
        <section
            id='about'
            className='about'
        >
            <div className='containerHome'>
                <div className='about-description'>
                    <div className='about-us'>{' من نحن '}</div>
                    {' منصتنا للتراسل تمنحك تجربة تواصل عالمية شاملة وآمنة عبر جميع الأجهزة. تم تصميمها لتلبية احتياجات الأفراد والشركات، حيث تجمع بين التشفير المتقدم لحماية بياناتك، مكالمات صوتية ومرئية عالية الجودة، ومشاركة الملفات بسهولة. انضم إلينا لتجربة تراسل مريحة، موثوقة، ومتكاملة تجمع بين الأمان والمرونة.'}
                </div>
            </div>
        </section>
    );
};

export default About;
