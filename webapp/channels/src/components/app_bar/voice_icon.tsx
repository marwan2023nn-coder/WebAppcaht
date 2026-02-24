// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';

import WithTooltip from 'components/with_tooltip';

import type {GlobalState} from 'types/store';
import type {FileUploadMethodAction} from 'types/store/plugins';

export default function VoiceIcon() {
    const pluginFileUploadMethods = useSelector((state: GlobalState) => state.plugins.components.FileUploadMethod || []);

    const voiceMethod = (pluginFileUploadMethods as FileUploadMethodAction[]).find((item) => item.pluginId === 'voice');

    const handleClick = useCallback(async () => {
        if (!voiceMethod) {
            return;
        }

        const init = (voiceMethod as any).init;
        if (typeof init === 'function') {
            await init();
        }

        await voiceMethod.action(() => {});
    }, [voiceMethod]);

    if (!voiceMethod) {
        return null;
    }

    const icon = React.isValidElement(voiceMethod.icon) ? React.cloneElement(voiceMethod.icon as React.ReactElement, {
        style: {

            // Keep any existing styles from the plugin, but try to force the icon to inherit the button color.
            ...(voiceMethod.icon as any).props?.style,
            color: 'currentColor',
            fill: 'currentColor',
            stroke: 'currentColor',
            marginTop: '4px',
        },
    }) : voiceMethod.icon;

    return (
        <WithTooltip title='تسجيل صوت'>
            <div
                id='voice-join-button'
                className='app-bar__icon'
                role='button'
                tabIndex={0}
                style={{color: 'rgb(var(--button-bg-rgb))'}}
                onClick={handleClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClick();
                    }
                }}
            >
                <div
                    className='app-bar__old-icon app-bar__icon-inner--centered'
                >
                    {icon}
                </div>
            </div>
        </WithTooltip>
    );
}
