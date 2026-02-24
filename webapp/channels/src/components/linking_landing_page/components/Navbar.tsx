// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import '../styles/main.scss';
import {Link} from 'react-router-dom';

import img from '../../../images/icon50x50.png';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false); // State to manage menu visibility

    const toggleMenu = () => {
        setIsOpen(!isOpen); // Toggle the menu open/close state
    };

    return (
        <nav className='menu'>
            <div className='nav-container'>
                <div className='brand'>
                    <img
                        src={img}
                        width={37}
                        height={37}
                        alt='Logo'
                    />
                    <div className='brand-card'><span> {'ســــــــوفـــــا '}</span>

                        <div><span style={{fontSize: '10px'}} > {'للحلول الرقمية '}</span></div> </div>

                </div>

            </div>
            <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                <a
                    href='#about'
                    className='nav-link'
                >
                    {' حول المنصة'}
                </a>
                <a
                    href='#whyUs'
                    className='nav-link'
                >
                    {'  لماذا تختار منصتنا'}
                </a>
                <a
                    href='#ourTrainingPrograms'
                    className='nav-link'
                >
                    {'    برامجنا التدريبية'}
                </a>
                <a
                    href='#prices'
                    className='nav-link'
                >
                    {'    الأسعار'}
                </a>
            </div>
            <div className='login-section'>
                <Link
                    to={'/login'}
                    className='nav-login'
                >
                    <button className='login-button'> {'تسجيل الدخول '}</button>
                </Link>
            </div>
            <div
                className='menu-icon'
                onClick={toggleMenu}
            >
                {isOpen ? '✖' : '☰'} {/* Toggle between X and menu icon */}
            </div>
        </nav>
    );
};

export default Navbar;
