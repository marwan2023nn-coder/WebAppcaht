// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqItems: FAQItem[] = [
        {
            question: 'ما هي وسائل التواصل المتاحة عبر المنصة؟',
            answer:
        'نوفر لك إمكانية إرسال الرسائل النصية، إجراء مكالمات الصوت والفيديو، بالإضافة إلى مشاركة الملفات والصور مع حماية متقدمة.',
        },
        {
            question: 'ما هي تكلفة استخدام المنصة؟',
            answer:
        'تتوفر خطط مختلفة لاستخدام المنصة تناسب الأفراد والشركات. يمكنك الاطلاع على التفاصيل والأسعار عبر موقعنا أو من خلال التواصل مع فريق الدعم.',
        },
        {
            question: 'هل يمكن تخصيص خدمات المنصة لتناسب احتياجات أعمالنا؟',
            answer:
        'نعم، نقدم خيارات مرنة لتخصيص خدمات التراسل لتلائم احتياجاتك الخاصة في العمل، سواء كان ذلك لتلبية متطلبات الأمان أو لتوفير وظائف محددة حسب احتياجاتك.',
        },
        {
            question: 'هل تقدمون تقارير الأمان أو شهادات الخصوصية؟',
            answer:
        'نعم، نلتزم بمعايير الأمان والخصوصية العالمية، ونوفر تقارير دورية وشهادات امتثال لضمان حماية بياناتك وتواصل آمن.',
        },
    ];

    const toggleQuestion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section
            id='faq'
            className='faq'
        >
            <div className='containerHome'>
                {/* <div className="titleCard">
          <div className="titleBox"> أسئلة شائعة </div>
        </div>{" "} */}
                <h3 className='subtitle'> {'الأسئلة المتكررة '} </h3>
                <div className='faq-list'>
                    {faqItems.map((item, index) => (
                        <div
                            key={index}
                            className={`faq-item ${openIndex === index ? 'active' : ''}`}
                            onClick={() => toggleQuestion(index)}
                        >
                            <div className='question'>
                                <p>{item.question}</p>
                                <span className='icon'>{openIndex === index ? '−' : '+'}</span>
                            </div>
                            <div className='answer'>
                                <p>{item.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
