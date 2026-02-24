// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import './Popup.scss';
// eslint-disable-next-line react/prop-types
const PasswordPopup = ({onSubmit, onCancel, error}) => {
    const [password, setPassword] = React.useState('');

    const handleSubmit = () => {
        onSubmit(password);
    };

    return (
        <div
            className='popups'
        >
            <div className='popup-content'>
                <h2> {'كلمة السر مطلوبة'}</h2>
                <p> {'يتطلب الملف كلمة مرور للمتابعة. الرجاء إدخالها أدناه'}
                </p>
                {error && <p style={{color: 'red'}}>{error}</p>}
                <input
                    type='password'
                    placeholder='كلمة السر'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    className='styled-button'
                    onClick={handleSubmit}
                >
                    {' موافق'}
                </button>
                <button
                    className='styled-button'
                    onClick={onCancel}
                >
                    {' الغاء'}
                </button>
            </div>
        </div>
    );
};

export default PasswordPopup;
