// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {useIntl} from 'react-intl';
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
    const {formatMessage} = useIntl();
    const COOLDOWN_TIME_MS = 180000; // 3 minutes
    const [isCooldown, setIsCooldown] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const currentUser = useSelector(getCurrentUser);
    const isAdmin = currentUser ? isSystemAdmin(currentUser.roles) : false;

    useEffect(() => {
        const checkCooldown = () => {
            // If the user is an admin, we don't apply the cooldown
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

        // If the user is an admin, send directly without time check
        if (isAdmin) {
            handleSubmit();
            return;
        }

        const lastTime = parseInt(localStorage.getItem(`lastSentTime_${channelId}`) || '0', 10);
        if (now - lastTime < COOLDOWN_TIME_MS) {
            return;
        }

        localStorage.setItem(`lastSentTime_${channelId}`, now.toString());
        handleSubmit(); // Sends the message
    };

    let tooltipTitle;
    if (isAdmin) {
        tooltipTitle = formatMessage({id: 'advanced_text_editor.buzz.admin_tooltip', defaultMessage: 'Click to send buzz (Admin - no cooldown)'});
    } else if (isCooldown && timeLeft !== null) {
        tooltipTitle = formatMessage({id: 'advanced_text_editor.buzz.cooldown_tooltip', defaultMessage: 'Time remaining: {seconds} seconds'}, {seconds: timeLeft});
    } else {
        tooltipTitle = formatMessage({id: 'advanced_text_editor.buzz.tooltip', defaultMessage: 'Click to send buzz'});
    }

    const ariaLabel = formatMessage({id: 'advanced_text_editor.buzz.aria_label', defaultMessage: 'Send buzz'});

    return (
        <WithTooltip
            title={tooltipTitle}
        >
            <button
                onClick={onClick}
                disabled={isCooldown}
                className={`style--none AdvancedTextEditor__action-button ${isCooldown ? 'cooldown' : ''}`}
                aria-label={ariaLabel}
            >
                <BuzzSvg/>
            </button>
        </WithTooltip>
    );
};

export default CooldownButton;
