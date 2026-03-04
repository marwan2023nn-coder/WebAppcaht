// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    isLoading: boolean;
    successMessage: string;
    fileError: React.ReactNode;
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const ExcelAccountForm = ({
    isLoading,
    successMessage,
    fileError,
    handleFileUpload,
}: Props) => {
    return (
        <div
            style={{
                backgroundColor: '#f9f9f9',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                maxWidth: '500px',
                width: '80%',
                margin: '20px auto',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    fontSize: '20px',
                    fontFamily: 'Effra_Trial_Bd',
                    color: '#333',
                    marginBottom: '20px',
                }}
            >
                <p style={{fontFamily: 'Effra_Trial_Rg'}}>{'أنشئ حساباتك بسهولة باستخدام ملف إكسل'}</p>
            </div>
            <span style={{width: 'fit-content', marginTop: '0'}}>
                <label
                    htmlFor='create-account-excel-upload'
                    style={{
                        display: 'inline-block',
                        padding: '12px 25%',
                        fontSize: '16px',
                        color: 'white',
                        backgroundColor: 'var(--button-bg)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease, transform 0.2s ease',
                        width: '100%',
                        maxWidth: '350px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                    }}
                >
                    {'تحميل ملف إكسل  '}
                    <input
                        id='create-account-excel-upload'
                        name='excel-upload'
                        type='file'
                        accept='.xls,.xlsx'
                        onChange={handleFileUpload}
                        style={{display: 'none'}}
                    />
                </label>

                <div className='signup-body-card-form'>
                    {isLoading && (
                        <div
                            style={{
                                marginTop: '20px',
                                textAlign: 'center',
                                fontSize: '18px',
                                color: 'var(--button-bg)',
                            }}
                        >
                            <p style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>{'جاري إنشاء الحسابات'}<div className='loading-animation'/></p>
                        </div>
                    )}
                    {successMessage && (
                        <p
                            style={{
                                color: '#28a745',
                                fontSize: '16px',
                                fontFamily: 'Effra_Trial_Bd',
                                marginTop: '20px',
                            }}
                        >
                            {'✔️'} {successMessage}
                        </p>
                    )}
                </div>
                {fileError && (
                    <p
                        style={{
                            color: '#d9534f',
                            fontSize: '14px',
                            marginTop: '10px',
                            fontFamily: 'Effra_Trial_Bd.',
                        }}
                    >
                        {fileError}
                    </p>
                )}
            </span>
        </div>
    );
};

export default ExcelAccountForm;
