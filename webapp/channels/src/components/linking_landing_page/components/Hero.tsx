// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// const Hero = () => {
//   return (
//     <div className="hero">
//       <div className="containerHome">
//       <div className="hero-content">
//         <p className="subtitle">تقديم منصة مساحة عمل سوفا</p>
//         <h1 className="title">
//           اكتشف سوفا، منصة التراسل الذكي والأكثر أماناً، تواصل بلا حدود مع إدارة
//           عمليات متكاملة لضمان الخصوصية والكفاءة
//         </h1>
//         <p className="description">
//           اجعل تواصلك سهلاً وآمناً عبر منصتنا المتوفرة على جميع الأجهزة: موبايل،
//           ديسك توب، وويب. استمتع بتجربة تواصل حديثة تحافظ على خصوصيتك وأمان
//           بياناتك.
//         </p>
//         <div className="buttons">
//           <button className="btn-secondary">استكشاف المزايا</button>
//           <Link to={"/login"} className="btn-secondary">
//             <button
//               className="login-button"
//               style={{ background: "transparent", border: "none" }}
//             >
//               تسجيل الدخول
//             </button>
//           </Link>
//           <button className="btn-primary">عرض الخطط</button>
//         </div>
//         <img src={img} alt="Header Image" className="heroImage" />
//       </div>
//       </div>

//     </div>
//   );
// };

// export default Hero;
// eslint-disable-next-line import/order
import React from 'react';

import '../styles/main.scss';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Link} from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import img from '../../../images/ML/heroImage.png';

const Hero = () => {
    return (
        <div className='hero'>
            <div className='containerHome'>
                <div className='hero-content'>
                    {/* <p className='subtitle'>تقديم منصة مساحة عمل سوفا</p> */}
                    <h1
                        className='title'
                        style={{color: 'white'}}
                    >
                        {'  اكتشف مساحة عمل سوفا, منصة التراسل الذكي والأكثر أماناً، تواصل بلا حدود مع إدارة عمليات متكاملة لضمان الخصوصية والكفاءة'}
                    </h1>
                    <p className='description'>
                        {'  اجعل تواصلك سهلاً وآمناً عبر منصتنا المتوفرة على جميع الأجهزة:موبايل، ديسك توب، وويب. استمتع بتجربة تواصل حديثة تحافظ على خصوصيتك وأمان بياناتك.'}
                    </p>
                    {/* <div className='buttons'>
                        <button className='btn-secondary'>استكشاف المزايا</button>
                        <Link
                            to={'/login'}
                            className='btn-secondary'
                        >
                            <button
                                className='login-button'
                                style={{background: 'transparent', border: 'none'}}
                            >
                                تسجيل الدخول
                            </button>
                        </Link>
                        <button className='btn-primary'>عرض الخطط</button>
                    </div> */}
                    <div className='heroImage'>
                        {/* <img src={img} alt="Header Image"  width={"100%"} height={"100%"}/> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
