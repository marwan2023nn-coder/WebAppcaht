// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// eslint-disable-next-line import/order
import React, {useState} from 'react';

import '../styles/main.scss';

// "import {FaFacebook, FaTwitter, FaWhatsapp} from 'react-icons/fa';"

import img1 from '../../../images/Group 4095.png';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import img from '../../../images/icon50x50.png';

const Footer = () => {
    const [isOpen, setIsOpen] = useState(false); // State to manage menu visibility

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const toggleMenu = () => {
        setIsOpen(!isOpen); // Toggle the menu open/close state
    };
    return (
        <div className='footer-section'>
            <div className='footer-section-content'>
                <div className='divider'/>
                <img
                    src={img1}
                    width={70}
                    height={70}
                    alt='Logo'
                />
                <p className='description'>
                    {'  ســــــوفـــــا'}
                </p>
                {'   للـحـلـول الـرقـمـيـة'}
                <div>
                    <div className='divider'/>

                    <div className='.footer-section1'> <h4> {'تواصل بسهولة وأمان عبر منصتنا المتاحة على جميع الأجهزة: موبايل،'} </h4>
                        <h4> {'ديسك توب، وويب. استمتع بتجربة حديثة تحافظ على خصوصيتك. '}</h4> </div>
                    <div className='divider'/>

                </div>
                <div className={`nav-links1 ${isOpen ? 'active' : ''}`}>
                    <a
                        href='#about'
                        className='nav-link'
                    >
                        {'  الرئيسية'}
                    </a>
                    <a
                        href='#whyUs'
                        className='nav-link'
                    >
                        {' المطورون'}
                    </a>
                    <a
                        href='#ourTrainingPrograms'
                        className='nav-link'
                    >
                        {'     نبذة عن الهوية الرقمية'}
                    </a>
                    <a
                        href='#prices'
                        className='nav-link'
                    >
                        {'   الاسئلة المتكررة'}
                    </a>
                    <a
                        href='#prices'
                        className='nav-link'
                    >
                        {' تواصل معنا'}
                    </a>
                </div>
                <div className='footer-bottom'>

                    <div className='footer-bottom-content'/>

                    {/* <div className="social-links">
            <FaWhatsapp />
            <FaTwitter />
            <FaFacebook />
          </div> */}
                </div>
            </div>
        </div>
    );
};

export default Footer;
