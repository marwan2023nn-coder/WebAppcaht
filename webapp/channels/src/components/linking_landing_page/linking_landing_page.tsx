// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

// eslint-disable-next-line import/order
import Navbar from './components/Navbar';
// eslint-disable-next-line import/order
import Hero from './components/Hero';
import './styles/main.scss';

// import PricingSection from "./components/PricingSection";
import About from './components/About';
import Faq from './components/Faq';
import Features from './components/Features';
import Footer from './components/FooterSection';
import Slider from './components/Slider';
function App() {
    return (
        <div className='app'>
            <div className='headerHome'>
                <Navbar/>
                <Hero/>
            </div>
            <About/>
            <Features/>
            <Slider/>
            {/* <PricingSection /> */}
            <Faq/>
            <Footer/>
        </div>
    );
}

export default App;
