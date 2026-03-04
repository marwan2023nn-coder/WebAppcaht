// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import WithTooltip from 'components/with_tooltip';

import {getCurrentUser} from 'workspace-redux/selectors/entities/common';
import {isSystemAdmin} from 'workspace-redux/utils/user_utils';

import BuzzSvg from './buzz_svg';

import './advanced_text_editor.scss';

type CooldownButtonProps = {
    handleSubmit: () => void;
    channelId: string;
};

const CooldownButton = ({handleSubmit, channelId}: CooldownButtonProps) => {
    const COOLDOWN_TIME_MS = 180000; // 3 دقائق
    const [isCooldown, setIsCooldown] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const currentUser = useSelector(getCurrentUser);
    const isAdmin = currentUser ? isSystemAdmin(currentUser.roles) : false;

    useEffect(() => {
        const checkCooldown = () => {
            // إذا كان المستخدم أدمن، لا نطبق الكولداون
            if (isAdmin) {
                setIsCooldown(false);
                setTimeLeft(null);
                return;
            }

            const lastTime = parseInt(localStorage.getItem(`lastSentTime_${channelId}`) || '0', 10);
            const now = Date.now();
            const remaining = COOLDOWN_TIME_MS - (now - lastTime);
            if (remaining > 0) {
                setIsCooldown(true);
                setTimeLeft(Math.ceil(remaining / 1000));
            } else {
                setIsCooldown(false);
                setTimeLeft(null);
            }
        };

        checkCooldown();
        const interval = setInterval(checkCooldown, 1000);
        return () => clearInterval(interval);
    }, [channelId, isAdmin]);

    const onClick = () => {
        const now = Date.now();

        // إذا كان المستخدم أدمن، يرسل مباشرة بدون فحص الوقت
        if (isAdmin) {
            handleSubmit();
            return;
        }

        const lastTime = parseInt(localStorage.getItem(`lastSentTime_${channelId}`) || '0', 10);
        if (now - lastTime < COOLDOWN_TIME_MS) {
            return;
        }

        localStorage.setItem(`lastSentTime_${channelId}`, now.toString());
        handleSubmit(); // ← ترسل الرسالة
    };

    return (
        <WithTooltip
            title={isAdmin ? 'أنقر لإرسال تنبيه (أدمن - بدون قيو )' : (isCooldown && timeLeft !== null ? `الوقت المتبقي: ${timeLeft} ثانية` : 'أنقر لإرسال تنبيه')}
        >
            <button
                onClick={onClick}
                disabled={isCooldown}
                className={`style--none AdvancedTextEditor__action-button ${isCooldown ? 'cooldown' : ''}`}
            >
                <BuzzSvg/>
            </button>
        </WithTooltip>
    );
};

export default CooldownButton;
