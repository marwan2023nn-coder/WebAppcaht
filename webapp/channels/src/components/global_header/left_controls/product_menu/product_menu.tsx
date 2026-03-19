// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PanelRight} from 'lucide-react';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import {getLicense} from 'workspace-redux/selectors/entities/general';
import {getMyTeamsCount} from 'workspace-redux/selectors/entities/teams';

import HeaderIconButton from 'components/global_header/header_icon_button';

import {LicenseSkus, AudioTypes} from 'utils/constants';

import type {GlobalState} from 'types/store';

import ProductBranding from './product_branding';
import ProductBrandingFreeEdition from './product_branding_team_edition';

export const ProductMenuContainer = styled.nav<{ $teamsNamesVisible?: boolean }>`
    display: flex;
    align-items: center;
    cursor: default;
    gap: ${({$teamsNamesVisible}) => ($teamsNamesVisible ? '13rem' : '1.5rem')};
`;

const AudioPlayerContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 8px;
`;

const AudioButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(var(--center-channel-color-rgb), 0.56);

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
        color: rgba(var(--center-channel-color-rgb), 0.72);
    }

    &:active {
        background: rgba(var(--center-channel-color-rgb), 0.16);
    }

    & + & {
        margin-inline-start: 4px;
    }
`;

export const ProductMenuButton = styled.button.attrs(() => ({
    id: 'product_switch_menu',
    type: 'button',
}))`
    display: flex;
    align-items: center;
    background: transparent;
    border: none;
    border-radius: 4px;

    > * + * {
       margin-inline-start: 8px;
    }
`;

export const ProductMenuButton1 = styled(HeaderIconButton).attrs(() => ({
    id: 'product_switch_menu',
    type: 'button' as const,
}))<React.ComponentProps<typeof HeaderIconButton>>`
    margin-inline-start: 7px;
    width: 30px;
    height: 30px;
`;

const ProductMenu = (): JSX.Element => {
    const dispatch = useDispatch();
    const menuRef = useRef<HTMLDivElement>(null);
    const license = useSelector(getLicense);
    const myTeamsCount = useSelector(getMyTeamsCount);

    const [teamsNamesVisible, setTeamsNamesVisible] = useState(false);

    useEffect(() => {
        if (myTeamsCount <= 1 && teamsNamesVisible) {
            setTeamsNamesVisible(false);
        }
    }, [myTeamsCount, teamsNamesVisible]);

    useEffect(() => {
        const root = document.querySelector('#root');
        if (!root) {
            return undefined;
        }

        root.classList.toggle('team-sidebar--show-names', teamsNamesVisible);

        return () => {
            root.classList.remove('team-sidebar--show-names');
        };
    }, [teamsNamesVisible]);

    const showTeamsNames = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setTeamsNamesVisible((prev) => !prev);
    };

    const {audioUrl, isPlaying, currentTime, playbackRate, isBackground} = useSelector((state: GlobalState) => state.audio);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) {
            return;
        }

        if (audioUrl && audio.src !== audioUrl) {
            audio.src = audioUrl;
            audio.load();
            audio.currentTime = currentTime;
        }

        audio.playbackRate = playbackRate;

        if (isPlaying && isBackground) {
            audio.play();
        } else {
            audio.pause();
        }

        const handleEnded = () => {
            dispatch({
                type: AudioTypes.RESET_AUDIO,
            });
        };

        audio.addEventListener('ended', handleEnded);

        // eslint-disable-next-line consistent-return
        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl, isPlaying, isBackground, currentTime, playbackRate, dispatch]);

    const togglePlay = () => {
        dispatch({type: isPlaying ? AudioTypes.PAUSE_AUDIO : AudioTypes.PLAY_AUDIO});
    };

    const handleCancel = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = '';
        }
        dispatch({
            type: AudioTypes.RESET_AUDIO,
        });
    };

    const isFreeEdition = license.IsLicensed === 'false' || license.SkuShortName === LicenseSkus.Entry;

    return (
        <div ref={menuRef}>
            <ProductMenuContainer $teamsNamesVisible={teamsNamesVisible}>
                {myTeamsCount > 1 && (
                    <ProductMenuButton1
                        onClick={showTeamsNames}
                        aria-pressed={teamsNamesVisible}
                        toggled={teamsNamesVisible}
                    >
                        <PanelRight
                            fontSize={'1.8rem'}
                            color='currentColor'
                        />
                    </ProductMenuButton1>
                )}
                <ProductMenuButton
                    type='button'
                    aria-disabled='true'
                    onClick={(e) => e.preventDefault()}
                >
                    {isFreeEdition ? (
                        <ProductBrandingFreeEdition/>
                    ) : (
                        <ProductBranding/>
                    )}
                </ProductMenuButton>

                {audioUrl && isBackground && (
                    <AudioPlayerContainer>
                        <AudioButton
                            onClick={togglePlay}
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            <i className={`icon icon-${isPlaying ? 'pause' : 'play'}`}/>
                        </AudioButton>
                        <AudioButton
                            onClick={handleCancel}
                            title='Cancel'
                        >
                            <i className='icon icon-close'/>
                        </AudioButton>
                        <audio
                            ref={audioRef}
                        >
                            <track kind='captions'/>
                        </audio>
                    </AudioPlayerContainer>
                )}
            </ProductMenuContainer>
        </div>
    );
};

export default ProductMenu;
