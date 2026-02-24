// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import ImageEditor from '@toast-ui/react-image-editor';
import React, {forwardRef, useEffect, useMemo, useRef} from 'react';
import 'tui-image-editor/dist/tui-image-editor.css';
import {FormattedMessage} from 'react-intl';

type StatusImageEditorProps = {
    file: File;
    onSave: (file?: File) => void;
    onCancel: () => void;
};

const StatusImageEditor = forwardRef<HTMLDivElement, StatusImageEditorProps>(({file, onSave, onCancel}, ref) => {
    const imageEditorRef = useRef<ImageEditor>(null);
    const containerRef = useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;
    const removeActiveObjectOriginalRef = useRef<((...args: unknown[]) => unknown) | null>(null);

    const setRefs = useMemo(() => {
        return (node: HTMLDivElement | null) => {
            containerRef.current = node;
            if (typeof ref === 'function') {
                ref(node);
            }
        };
    }, [ref]);

    useEffect(() => {
        const patchRemoveActiveObject = () => {
            const actualImageEditor = imageEditorRef.current?.getInstance?.() as unknown as {
                removeActiveObject?: (...args: unknown[]) => unknown;
            } | undefined;

            if (!actualImageEditor || typeof actualImageEditor.removeActiveObject !== 'function') {
                return false;
            }

            if (removeActiveObjectOriginalRef.current) {
                return true;
            }

            const original = actualImageEditor.removeActiveObject.bind(actualImageEditor);
            removeActiveObjectOriginalRef.current = original;

            actualImageEditor.removeActiveObject = (...args: unknown[]) => {
                try {
                    return original(...args);
                } catch (err) {
                    return undefined;
                }
            };

            return true;
        };

        const restoreRemoveActiveObject = () => {
            const original = removeActiveObjectOriginalRef.current;
            if (!original) {
                return;
            }

            const actualImageEditor = imageEditorRef.current?.getInstance?.() as unknown as {
                removeActiveObject?: (...args: unknown[]) => unknown;
            } | undefined;

            if (actualImageEditor && typeof actualImageEditor.removeActiveObject === 'function') {
                actualImageEditor.removeActiveObject = original;
            }

            removeActiveObjectOriginalRef.current = null;
        };

        // The editor instance may not be ready on first render
        const tryPatchTimer = window.setInterval(() => {
            const done = patchRemoveActiveObject();
            if (done) {
                window.clearInterval(tryPatchTimer);
            }
        }, 100);

        const handler = (e: KeyboardEvent) => {
            if (e.key !== 'Delete' && e.key !== 'Backspace') {
                return;
            }

            const container = containerRef.current;
            if (!container) {
                return;
            }

            const targetNode = e.target as Node | null;
            if (!targetNode || !container.contains(targetNode)) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            try {
                const actualImageEditor = imageEditorRef.current?.getInstance?.() as unknown as {
                    removeActiveObject?: () => unknown;
                } | undefined;
                actualImageEditor?.removeActiveObject?.();
            } catch (err) {
                // swallow to prevent tui-image-editor internal crash
            }
        };

        document.addEventListener('keydown', handler, true);
        return () => {
            window.clearInterval(tryPatchTimer);
            restoreRemoveActiveObject();
            document.removeEventListener('keydown', handler, true);
        };
    }, []);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const locale_ar = {
        Download: 'تحميل',
        Load: 'رفع',
        DeleteAll: 'حذف الكل',
        Delete: 'حذف',
        Reset: 'إعادة الضبط',
        Redo: 'تقدم',
        Undo: 'تراجع',
        History: 'السجل',
        Hand: 'اليد',
        ZoomOut: 'تصغير',
        ZoomIn: 'تكبير',
        Draw: 'رسم',
        Text: 'نص',
        Filter: 'فلتر',
        Shape: 'الأشكال',
        Crop: 'قص',
        Apply: 'تطبيق',
        Cancel: 'الغاء',
        Color: 'اللون',
        Straight: 'مستقيم',
        Free: 'حُر',
        Range: 'الحجم',
        Right: 'يمين',
        Center: 'المركز',
        Left: 'يسار',
        Underline: 'خط سُفلي',
        Italic: 'مائل',
        Bold: 'عريض',
        'Text size': 'حجم النص',
    };

    const theme = {
        'downloadButton.backgroundColor': 'rgb(var(--button-bg-rgb))',
        'downloadButton.borderColor': 'rgb(var(--button-bg-rgb))',
        'common.fontFamily': 'GraphikArabic',
    };

    return (
        <div
            id='image-editor'
            ref={setRefs}
        >
            <div className='px-6 image-editor__header'>
                <h1 className='image-editor__header__title'>
                    <FormattedMessage
                        id='media_editor.image.header'
                        defaultMessage='Editing Image'
                    />
                </h1>
                <div>
                    <button
                        className='btn btn-secondary'
                        onClick={onCancel}
                    >
                        <FormattedMessage
                            id='media_editor.image.cancel_btn'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        className='btn btn-primary'
                        onClick={async () => {
                            // الحصول على الصورة المُعدلة من ImageEditor
                            if (imageEditorRef.current) {
                                try {
                                    // الوصول للـ ImageEditor الفعلي عبر getInstance
                                    const actualImageEditor = imageEditorRef.current.getInstance();

                                    if (!actualImageEditor) {
                                        // eslint-disable-next-line no-console
                                        console.error('getInstance غير متوفر');
                                        onSave();
                                        return;
                                    }
                                    if (typeof actualImageEditor.toDataURL !== 'function') {
                                        // eslint-disable-next-line no-console
                                        console.error('toDataURL ليس دالة متوفرة في actualImageEditor');
                                        onSave();
                                        return;
                                    }
                                    const dataURL = actualImageEditor.toDataURL();

                                    if (!dataURL || dataURL.length === 0) {
                                        // eslint-disable-next-line no-console
                                        console.error('dataURL فارغ أو null');
                                        onSave();
                                        return;
                                    }

                                    // تحويل dataURL إلى File
                                    const res = await fetch(dataURL);
                                    const blob = await res.blob();

                                    const editedFile = new File([blob], file.name, {
                                        type: file.type,
                                        lastModified: Date.now(),
                                    });

                                    // تحميل الصورة المحررة مباشرة
                                    const link = document.createElement('a');
                                    link.download = editedFile.name.replace(/(\.[^.]+)$/, '_edited$1');
                                    link.href = URL.createObjectURL(editedFile);
                                    document.body.appendChild(link);
                                    document.body.removeChild(link);
                                    URL.revokeObjectURL(link.href);
                                    onSave(editedFile);
                                } catch (error) {
                                    // eslint-disable-next-line no-console
                                    console.error('تفاصيل الخطأ:', (error as Error).message);
                                    onSave();
                                }
                            } else {
                                // eslint-disable-next-line no-console
                                console.error('imageEditorRef.current غير متوفر');
                                onSave();
                            }
                        }}
                    >
                        <FormattedMessage
                            id='media_editor.image.save_btn'
                            defaultMessage='Save'
                        />
                    </button>
                </div>
            </div>
            <ImageEditor
                ref={imageEditorRef}
                includeUI={{
                    loadImage: {
                        path: URL.createObjectURL(file),
                        name: 'SampleImage',
                    },
                    locale: locale_ar,
                    theme,
                    menu: ['crop', 'shape', 'text', 'draw'],
                    initMenu: 'draw',
                    uiSize: {
                        width: '100%',
                        height: '500px',
                    },
                    menuBarPosition: 'bottom',
                }}
                cssMaxHeight={500}
                cssMaxWidth={700}
                selectionStyle={{
                    cornerSize: 20,
                    rotatingPointOffset: 70,
                }}
                usageStatistics={true}
            />
        </div>
    );
});

export default StatusImageEditor;
