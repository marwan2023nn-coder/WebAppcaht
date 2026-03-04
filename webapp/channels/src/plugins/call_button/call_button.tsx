// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useState, useEffect, useLayoutEffect, useRef} from 'react';
import type {CSSProperties} from 'react';
import {useIntl} from 'react-intl';

import ChevronDownIcon from '@workspace/compass-icons/components/chevron-down';
import PhoneOutlineIcon from '@workspace/compass-icons/components/phone-outline';
import type {Channel, ChannelMembership} from '@workspace/types/channels';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import {Constants} from 'utils/constants';

import type {CallButtonAction} from 'types/store/plugins';

import './call_button.scss';
import WithTooltip from 'components/with_tooltip';

type Props = {
    currentChannel?: Channel;
    channelMember?: ChannelMembership;
    pluginCallComponents: CallButtonAction[];
    sidebarOpen: boolean;
}

export default function CallButton({pluginCallComponents, currentChannel, channelMember, sidebarOpen}: Props) {
    const [active, setActive] = useState(false);
    const [clickEnabled, setClickEnabled] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [singleButtonHasContent, setSingleButtonHasContent] = useState(true);
    const [singleButtonChecked, setSingleButtonChecked] = useState(false);
    const singleButtonContainerRef = useRef<HTMLDivElement>(null);
    const prevSidebarOpen = useRef(sidebarOpen);
    const {formatMessage} = useIntl();

    useEffect(() => {
        if (prevSidebarOpen.current && !sidebarOpen) {
            setClickEnabled(false);
            setTimeout(() => {
                setClickEnabled(true);
            }, Constants.CHANNEL_HEADER_BUTTON_DISABLE_TIMEOUT);
        }
        prevSidebarOpen.current = sidebarOpen;
    }, [sidebarOpen]);

    const visibleCallComponents = pluginCallComponents.filter((item) => Boolean(item.button || item.dropdownButton));
    const singleItemId = visibleCallComponents.length === 1 ? visibleCallComponents[0].id : '';

    useLayoutEffect(() => {
        if (visibleCallComponents.length !== 1) {
            if (singleButtonChecked) {
                setSingleButtonChecked(false);
            }
            if (!singleButtonHasContent) {
                setSingleButtonHasContent(true);
            }
            return;
        }

        const container = singleButtonContainerRef.current;
        if (!container) {
            return;
        }

        const updateHasContent = () => {
            const hasContent = Boolean(container.childNodes?.length);
            setSingleButtonHasContent((prev) => (prev === hasContent ? prev : hasContent));
        };

        updateHasContent();

        const observer = new MutationObserver(() => {
            updateHasContent();
        });

        observer.observe(container, {childList: true, subtree: true});

        if (!singleButtonChecked) {
            setSingleButtonChecked(true);
        }

        return () => {
            observer.disconnect();
        };
    }, [singleItemId, visibleCallComponents.length, singleButtonChecked, singleButtonHasContent]);

    if (visibleCallComponents.length === 0) {
        return null;
    }

    const disabled = !clickEnabled;
    const isActiveStyle = isPressed;
    const isHoverStyle = isHovered && !isActiveStyle;

    const style = {
        container: {
            display: 'flex',
            minWidth: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: isActiveStyle ? 'rgba(var(--button-bg-rgb), 0.08)' : (isHoverStyle ? 'rgba(var(--center-channel-color-rgb), 0.08)' : 'transparent'),
            padding: '0 7px',
            borderRadius: 4,
            color: disabled ? 'rgba(var(--center-channel-color-rgb), 0.32)' : (isActiveStyle ? 'var(--button-bg)' : (isHoverStyle ? 'rgba(var(--center-channel-color-rgb), var(--icon-opacity-hover))' : 'rgb(var(--button-bg-rgb))')),
            pointerEvents: disabled ? 'none' : 'auto',
            cursor: disabled ? 'not-allowed' : 'pointer',
        } as CSSProperties,
    };

    if (visibleCallComponents.length === 1) {
        const item = visibleCallComponents[0];

        const hidden = singleButtonChecked && !singleButtonHasContent;

        if (!item.button) {
            return null;
        }

        const clickHandler = () => item.action?.(currentChannel, channelMember);

        return (
             <WithTooltip
                title={formatMessage({id: 'call_button.voice_call', defaultMessage: 'Voice call'})}
                disabled={hidden}
            >
            <div
                ref={singleButtonContainerRef}
                style={{...style.container, display: hidden ? 'none' : style.container.display}}
                className='flex-child'
                onClick={clickEnabled ? clickHandler : undefined}
                onTouchEnd={clickEnabled ? clickHandler : undefined}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false);
                    setIsPressed(false);
                }}
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                onTouchStart={() => setIsPressed(true)}
            >
                {item.button}
            </div>
            </WithTooltip>
        );
    }

    const items = visibleCallComponents.map((item) => {
        return (
            <li
                className='MenuItem'
                key={item.id}
                onClick={(e) => {
                    e.preventDefault();
                    item.action?.(currentChannel, channelMember);
                }}
            >
                {item.dropdownButton || item.button}
            </li>
        );
    });

    return (
        <div
            style={style.container}
            className='flex-child'
        >
            <MenuWrapper onToggle={(toggle: boolean) => setActive(toggle)}>
                <button className={classNames('style--none call-button dropdown', {active})}>
                    <PhoneOutlineIcon
                        color='inherit'
                        aria-label={formatMessage({id: 'generic_icons.call', defaultMessage: 'Call icon'}).toLowerCase()}
                    />
                    <span className='call-button-label'>{'Call'}</span>
                    <ChevronDownIcon
                        color='inherit'
                        aria-label={formatMessage({id: 'generic_icons.dropdown', defaultMessage: 'Dropdown Icon'}).toLowerCase()}
                    />
                </button>
                <Menu
                    id='callOptions'
                    ariaLabel={formatMessage({id: 'call_button.menuAriaLabel', defaultMessage: 'Call type selector'})}
                    customStyles={{
                        top: 'auto',
                        left: 'auto',
                        right: 0,
                    }}
                >
                    {items}
                </Menu>
            </MenuWrapper>
        </div>
    );
}
