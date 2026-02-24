// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useMemo, useRef} from 'react';

// تعديل دالة normalizeKey لتضمن أنها لا تقوم باستدعاء toLowerCase على قيمة غير صالحة
const normalizeKey = (key) => {
    if (key && typeof key === 'string') {
        return key.toLowerCase();
    }
    return ''; // أو يمكنك اختيار قيمة افتراضية أخرى
};

// دالة لفحص إذا كانت مجموعة keysSet هي subset من lastKeyPressed
const isSubset = (subset, set) => {
    return [...subset].every((key) => set.has(key));
};

export const useKeyPress = (keys, callback, disable = false) => {
    const lastKeyPressed = useRef(new Set([]));

    // استخدام useMemo لتحويل المفاتيح إلى مجموعة Set
    const keysSet = useMemo(() => {
        return new Set(keys.map((key) => normalizeKey(key)));
    }, [keys]);

    const handleKeyDown = (e) => {
        if (e.repeat) {
            return;
        } // منع تفعيل الوظيفة عند الضغط المطول على المفتاح

        lastKeyPressed.current.add(normalizeKey(e.key));

        // التحقق إذا كانت keysSet هي subset من المفاتيح المضغوطة حالياً
        if (isSubset(keysSet, lastKeyPressed.current) && !disable) {
            e.preventDefault();
            callback(e);
        }
    };

    const handleKeyUp = (e) => {
        lastKeyPressed.current.delete(normalizeKey(e.key));
    };

    const handleBlur = () => {
        lastKeyPressed.current.clear();
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', handleBlur);
        };
    }, [keysSet, callback, disable]);
};
