// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import '../styles/main.scss';

const PricingSection = () => {
    return (
        <section
            id='prices'
            className='pricing'
        >
            <div className='containerHome'>
                <div className='titleCard'>
                    <div className='titleBox'> {'الأسعار '}</div>
                </div>{' '}
                <h2 className='title'> {'استمتع بخدمات تراسل مجانية وآمنة '}</h2>
                <p className='subtitle'>
                    {' منصتنا هي خدمة عالمية للتواصل الآمن تتيح للمستخدمين والشركات تبادل الرسائل وإجراء المكالمات ومشاركة الملفات عبر الإنترنت. نوفر تجربة تواصل شاملة ومتاحة على الموبايل، الديسك توب، والويب، مع حماية تامة للخصوصية وأمان البيانات. .'}
                </p>
                <div className='pricing-cards'>
                    <div className='pricing-card'>
                        <h3> {'مجانية تماماً '}</h3>
                        <p className='card-description'>
                            {' مناسب للأفراد والشركات الصغيرة التي تحتاج إلى خدمات تراسل أساسية'}
                        </p>
                        <div className='price'>
                            <span className='amount'>{' $0 '}</span>
                            <span className='period'> {'/ شهر لكل مستخدم '}</span>
                        </div>
                        <div className='features'>
                            <h4> {'مميزات الخطة: '}</h4>
                            <ul>
                                <li> {'إرسال واستقبال الرسائل غير محدود'}</li>
                                <li>{' مكالمات صوتية وفيديو عالية الجودة'}</li>
                                <li> {'مشاركة الملفات والصور'}</li>
                                <li>{' مجموعات دردشة تصل إلى 20 مستخدم'}</li>
                                <li> {'$50 سعر كل برنامج'}</li>
                            </ul>
                        </div>
                        <button className='cta-button'> {'إبدأ الآن'}</button>
                    </div>

                    <div className='pricing-card'>
                        <h3> {'الخطة المخصصة للشركات'}</h3>
                        <p className='card-description'>
                            {'      مثالي للشركات المتوسطة والكبيرة التي تتطلب حماية متقدمة في التواصلوإدارة الفريق'}
                        </p>
                        <div className='price'>
                            <span className='amount'>{'$20'}</span>
                            <span className='period'>{'/ شهر لكل مستخدم<'}</span>
                        </div>
                        <div className='features'>
                            <h4> {'مميزات الخطة:'}</h4>
                            <ul>
                                <li> {'تكامل مع أنظمة الشركة الداخلية'}</li>
                                <li> {'دعم فني على مدار الساعة'}</li>
                                <li> {'إدارة وتحليل بيانات الاستخدام'}</li>
                                <li> {'تخصيص واجهة المنصة بما يتناسب مع هوية الشركة'}</li>
                                <li> {'أمان وحماية بيانات محسنة وفق متطلبات الشركات الكبرى'}</li>
                            </ul>
                        </div>
                        <button className='cta-button'> {'إبدأ الآن'}</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
