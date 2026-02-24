// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';

import FileManager from './FileManager/FileManager';
import './App.scss';
// eslint-disable-next-line import/order
import PasswordPopup from './components/PasswordPopup.jsx';

const BaseURL = `${window.location.origin}/plugins/ye.sofachat.archive.browser.fid/`;
const DefaultPassword = ''; // كلمة المرور الافتراضية (إذا لم يتم إدخال كلمة مرور)

// eslint-disable-next-line react/prop-types
function App({fileId, fileType}) {
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState('');
    const [popupState, setPopupState] = useState({visible: false, error: ''});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [passwordRequired, setPasswordRequired] = useState(false); // حالة لمعرفة إذا كان الملف يحتاج كلمة مرور
    const [urlParams, setUrlParams] = useState({
        file_id: fileId,
        file_type: fileType,
    });

    // تحديث المعلمات عند تغيير fileId أو fileType
    useEffect(() => {
        setUrlParams({
            file_id: fileId,
            file_type: fileType,
        });
    }, [fileId, fileType]);

    // دالة لجلب الملفات
    const fetchFiles = async (customPassword = DefaultPassword) => {
        try {
            setError('');
            setFiles([]);
            setIsLoading(true);

            const queryParts = [`file_id=${urlParams.file_id}`];
            if (urlParams.file_type === 'rar') {
                // فقط إذا كان الملف من نوع RAR نستخدم كلمة المرور
                if (customPassword) {
                    queryParts.push(`password=${customPassword}`);
                } else {
                    queryParts.push(`password=${DefaultPassword}`);
                }
            }

            const query = `?${queryParts.join('&')}`;
            const response = await fetch(`${BaseURL}${urlParams.file_type}${query}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'فشل في جلب الملفات');
            }

            const data = await response.json();

            // تحقق من إذا كان الملف يحتاج كلمة مرور
            if (data.requiresPassword) {
                setPasswordRequired(true); // عرض نافذة كلمة المرور
                setPopupState({visible: true, error: 'هذا الملف يتطلب كلمة مرور'}); // رسالة ملائمة
                return;
            }

            setFiles(data); // إذا لم يكن الملف يحتاج كلمة مرور
            setPopupState({visible: false, error: ''});
        } catch (err) {
            const errorMessage = err.message;

            if (
                errorMessage === 'file requires a password' ||
                errorMessage.includes('rardecode: incorrect password')
            ) {
                setPopupState({
                    visible: true,
                    error: errorMessage.includes('rardecode: incorrect password') ? 'كلمة مرور غير صحيحة' : 'هذا الملف يتطلب كلمة مرور',
                });
            } else {
                setError(errorMessage); // أخطاء عامة
            }
        } finally {
            setIsLoading(false);
        }
    };

    // دالة لإعادة محاولة إدخال كلمة مرور
    const handlePasswordRetry = (newPassword) => {
        setPopupState({visible: false, error: ''});
        fetchFiles(newPassword); // إعادة المحاولة باستخدام كلمة المرور الجديدة
    };

    useEffect(() => {
        if (urlParams.file_id) {
            fetchFiles(); // جلب الملفات عندما يتغير ID أو type
        } else {
            setError('معرف الملف مفقود في معلمات URL');
        }
    }, [urlParams.file_id, urlParams.file_type]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleFileOpen = (file) => {
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleError = (error, file) => {
    };

    const handleRefresh = () => {
        fetchFiles(); // إعادة تحميل الملفات
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleLayoutChange = (newLayout) => {
    };

    return (
        <div className='file-manager-container'>
            <FileManager
                files={files}
                isLoading={isLoading}
                onFileOpen={handleFileOpen}
                onError={handleError}
                layout='grid'
                enableFilePreview={false}
                onRefresh={handleRefresh}
                onLayoutChange={handleLayoutChange}
            />
            {popupState.visible && (

            // eslint-disable-next-line react/react-in-jsx-scope
                <PasswordPopup
                    onSubmit={handlePasswordRetry}
                    onCancel={() => setPopupState({visible: false, error: ''})}
                    error={popupState.error}
                />

            )}
        </div>
    );
}

export default App;
