// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Play, Pause} from 'lucide-react';
import './AudioPlayer.scss';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import {Client4} from 'workspace-redux/client';

import store from 'stores/redux_store';

import {AudioTypes} from 'utils/constants';

import type {GlobalState} from 'types/store';

import WaveformVisualizer from '../components/WaveformVisualizer';

let activeAudioRef: HTMLAudioElement | null = null;

const SenderProfileImage = styled.div `
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
`;

const CurrentAudioSpeedDiv = styled.div `
    width: 40px;
    padding: 3px 0;
    border: var(--border-default);
    display: flex;
    justify-content: center;
    background: #fff;
    color: #000;
    border-radius: 20px;
    font-size: 13px;
`;

interface AudioPlayerProps {
    audioUrl: string;
    mimeType: string;
    senderId?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({audioUrl, mimeType, senderId}) => {
    const reduxAudio = useSelector((state: GlobalState) => state.audio);
    const isThisAudioInRedux = reduxAudio?.audioUrl === audioUrl;

    const [isPlaying, setIsPlaying] = useState(isThisAudioInRedux && reduxAudio.isPlaying);
    const [currentTime, setCurrentTime] = useState(isThisAudioInRedux ? reduxAudio.currentTime : 0);
    const [duration, setDuration] = useState(isThisAudioInRedux ? reduxAudio.duration : 0);
    const [showMenu, setShowMenu] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(isThisAudioInRedux ? reduxAudio.playbackRate : 1);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isDragging, setIsDragging] = useState(false);
    const [hasPlayed, setHasPlayed] = useState(isThisAudioInRedux && reduxAudio.currentTime > 0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    const speeds = [1.0, 1.5, 2.0];
    const dispatch = useDispatch();

    const handleSpeedChange = () => {
        if (!audioRef.current) {
            return;
        }

        const audio = audioRef.current;
        setPlaybackRate((prev) => {
            const currentIndex = speeds.indexOf(prev);
            const nextIndex = (currentIndex + 1) % speeds.length;
            const newSpeed = speeds[nextIndex];
            audio.playbackRate = newSpeed;

            if (isThisAudioInRedux) {
                dispatch({
                    type: AudioTypes.UPDATE_PLAYBACK_RATE,
                    payload: {playbackRate: newSpeed},
                });
            }
            return newSpeed;
        });
    };

    const audioSenderProfilePic = (
        senderId ? (<SenderProfileImage>
            <img
                src={Client4.getProfilePictureUrl(senderId, 0)}
                alt=''
            />
        </SenderProfileImage>) : (
            <div className='playback-rate'>
                <svg
                    width='100%'
                    height='100%'
                    version='1.1'
                    fill='#2f987e'
                    viewBox='0 0 1200 1200'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <path d='m600 788.44c103.66 0 187.71-84.023 187.71-187.7v-377.03c-0.011719-103.64-84.07-187.7-187.71-187.7-103.68 0-187.7 84.059-187.7 187.7v377.03c-0.011719 103.68 84.012 187.71 187.7 187.71z'/>
                    <path d='m875.21 524.43v76.559c0 151.78-123.45 275.22-275.22 275.22-151.78 0-275.22-123.45-275.22-275.22v-76.559h-75.242v76.559c0 180.54 137.22 329.58 312.84 348.42v139.34l-206.99-0.003906v75.254h489.24v-75.254h-207v-139.34c175.62-18.828 312.84-167.87 312.84-348.42v-76.559z'/>
                </svg>
                <div className='audio-icon'>
                    <svg
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <mask
                            id='path-1-outside-1_1809_12935'
                            maskUnits='userSpaceOnUse'
                            x='4.30005'
                            y='1'
                            width='15'
                            height='22'
                            fill='black'
                        >
                            <rect
                                fill='white'
                                x='4.30005'
                                y='1'
                                width='15'
                                height='22'
                            />
                            <path
                                fillRule='evenodd'
                                clipRule='evenodd'
                                d='M9.00005 6C9.00005 4.34315 10.3432 3 12 3C13.6569 3 15 4.34315 15 6V12C15 13.6569 13.6569 15 12 15C10.3432 15 9.00005 13.6569 9.00005 12V6ZM7.00005 10.8C7.38665 10.8 7.70005 11.1134 7.70005 11.5V12C7.70005 14.3748 9.62522 16.3 12 16.3C14.3749 16.3 16.3 14.3748 16.3 12V11.5C16.3 11.1134 16.6134 10.8 17 10.8C17.3866 10.8 17.7 11.1134 17.7 11.5V12C17.7 14.911 15.5178 17.3124 12.7 17.6574V20.5C12.7 20.8866 12.3866 21.2 12 21.2C11.6134 21.2 11.3 20.8866 11.3 20.5V17.6574C8.48225 17.3124 6.30005 14.911 6.30005 12V11.5C6.30005 11.1134 6.61345 10.8 7.00005 10.8Z'
                            />
                        </mask>
                        <path
                            fillRule='evenodd'
                            clipRule='evenodd'
                            d='M9.00005 6C9.00005 4.34315 10.3432 3 12 3C13.6569 3 15 4.34315 15 6V12C15 13.6569 13.6569 15 12 15C10.3432 15 9.00005 13.6569 9.00005 12V6ZM7.00005 10.8C7.38665 10.8 7.70005 11.1134 7.70005 11.5V12C7.70005 14.3748 9.62522 16.3 12 16.3C14.3749 16.3 16.3 14.3748 16.3 12V11.5C16.3 11.1134 16.6134 10.8 17 10.8C17.3866 10.8 17.7 11.1134 17.7 11.5V12C17.7 14.911 15.5178 17.3124 12.7 17.6574V20.5C12.7 20.8866 12.3866 21.2 12 21.2C11.6134 21.2 11.3 20.8866 11.3 20.5V17.6574C8.48225 17.3124 6.30005 14.911 6.30005 12V11.5C6.30005 11.1134 6.61345 10.8 7.00005 10.8Z'
                            fill='white'
                        />
                        <path
                            d='M12.7 17.6574L12.5177 16.1686L11.2 16.3299V17.6574H12.7ZM11.3 17.6574H12.8V16.3299L11.4824 16.1686L11.3 17.6574ZM12 1.5C9.51477 1.5 7.50005 3.51472 7.50005 6H10.5C10.5 5.17157 11.1716 4.5 12 4.5V1.5ZM16.5 6C16.5 3.51472 14.4853 1.5 12 1.5V4.5C12.8285 4.5 13.5 5.17157 13.5 6H16.5ZM16.5 12V6H13.5V12H16.5ZM12 16.5C14.4853 16.5 16.5 14.4853 16.5 12H13.5C13.5 12.8284 12.8285 13.5 12 13.5V16.5ZM7.50005 12C7.50005 14.4853 9.51477 16.5 12 16.5V13.5C11.1716 13.5 10.5 12.8284 10.5 12H7.50005ZM7.50005 6V12H10.5V6H7.50005ZM9.20005 11.5C9.20005 10.285 8.21507 9.3 7.00005 9.3V12.3C6.55822 12.3 6.20005 11.9418 6.20005 11.5H9.20005ZM9.20005 12V11.5H6.20005V12H9.20005ZM12 14.8C10.4537 14.8 9.20005 13.5464 9.20005 12H6.20005C6.20005 15.2033 8.7968 17.8 12 17.8V14.8ZM14.8 12C14.8 13.5464 13.5464 14.8 12 14.8V17.8C15.2033 17.8 17.8 15.2033 17.8 12H14.8ZM14.8 11.5V12H17.8V11.5H14.8ZM17 9.3C15.785 9.3 14.8 10.285 14.8 11.5H17.8C17.8 11.9418 17.4419 12.3 17 12.3V9.3ZM19.2 11.5C19.2 10.285 18.2151 9.3 17 9.3V12.3C16.5582 12.3 16.2 11.9418 16.2 11.5H19.2ZM19.2 12V11.5H16.2V12H19.2ZM12.8824 19.1463C16.4432 18.7103 19.2 15.6782 19.2 12H16.2C16.2 14.1439 14.5924 15.9145 12.5177 16.1686L12.8824 19.1463ZM11.2 17.6574V20.5H14.2V17.6574H11.2ZM11.2 20.5C11.2 20.0582 11.5582 19.7 12 19.7V22.7C13.2151 22.7 14.2 21.715 14.2 20.5H11.2ZM12 19.7C12.4419 19.7 12.8 20.0582 12.8 20.5H9.80005C9.80005 21.715 10.785 22.7 12 22.7V19.7ZM12.8 20.5V17.6574H9.80005V20.5H12.8ZM4.80005 12C4.80005 15.6782 7.55686 18.7103 11.1177 19.1463L11.4824 16.1686C9.40765 15.9145 7.80005 14.1439 7.80005 12H4.80005ZM4.80005 11.5V12H7.80005V11.5H4.80005ZM7.00005 9.3C5.78502 9.3 4.80005 10.285 4.80005 11.5H7.80005C7.80005 11.9418 7.44188 12.3 7.00005 12.3V9.3Z'
                            fill='#00987E'
                            mask='url(#path-1-outside-1_1809_12935)'
                        />
                    </svg>
                </div>
            </div>
        )
    );

    const currentAudioSpeed = (
        <CurrentAudioSpeedDiv
            onClick={handleSpeedChange}
        >
            {playbackRate}{'x'}
        </CurrentAudioSpeedDiv>
    );

    // Sync with Redux on mount if this audio was playing in background
    useEffect(() => {
        if (isThisAudioInRedux && audioRef.current) {
            audioRef.current.currentTime = reduxAudio.currentTime;
            audioRef.current.playbackRate = reduxAudio.playbackRate;
            if (reduxAudio.isPlaying) {
                audioRef.current.play();
                setIsPlaying(true);
                setHasPlayed(true);
                activeAudioRef = audioRef.current;

                // Take over from background
                dispatch({
                    type: AudioTypes.SET_AUDIO,
                    payload: {
                        isBackground: false,
                    },
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // تعديل: useEffect منفصل لإضافة أحداث الصوت مع تنظيفها عند إزالة المكون
    useEffect(() => {
        const audioEl = audioRef.current;
        if (!audioEl) {
            return;
        }

        const handleLoadedMetadata = () => {
            setDuration(audioEl.duration || 0);
        };

        let lastSyncTime = 0;
        const handleTimeUpdate = () => {
            const time = audioEl.currentTime || 0;
            if (!isDragging) {
                setCurrentTime(time);
            }

            // Sync with Redux periodically when playing
            if (audioEl === activeAudioRef && isPlaying && Math.abs(time - lastSyncTime) > 1) {
                lastSyncTime = time;
                dispatch({
                    type: AudioTypes.UPDATE_AUDIO_TIME,
                    payload: {currentTime: time},
                });
            }
        };

        const handleEnded = () => {
            // إعادة تعيين الحالة عند انتهاء تشغيل الصوت طبيعياً (وصل للنهاية)
            setCurrentTime(0);
            setHasPlayed(false);
            if (activeAudioRef === audioEl) {
                activeAudioRef = null;
                setIsPlaying(false);
                dispatch({type: AudioTypes.PAUSE_AUDIO});
            }
        };

        const unsubscribe = store.subscribe(() => {
            const state = store.getState() as GlobalState;

            // If global audio is cleared, stop whichever audio is currently active
            if (!state.audio || !state.audio.audioUrl) {
                if (audioEl === activeAudioRef) {
                    audioEl.pause();
                    setIsPlaying(false);
                    activeAudioRef = null;
                }
                return;
            }

            // If another audio is now the active one, ensure this instance doesn't react to its play/pause state
            if (state.audio.audioUrl !== audioUrl) {
                if (audioEl === activeAudioRef) {
                    audioEl.pause();
                    setIsPlaying(false);
                    activeAudioRef = null;
                }
                return;
            }

            // Sync playback rate from Redux
            if (audioEl === activeAudioRef && audioEl.playbackRate !== state.audio.playbackRate) {
                audioEl.playbackRate = state.audio.playbackRate;
                setPlaybackRate(state.audio.playbackRate);
            }

            // From here: state.audio refers to THIS audio instance
            if (!state.audio.isPlaying && audioEl === activeAudioRef) {
                audioEl.pause();
                setIsPlaying(false);
            } else if (state.audio.isPlaying && audioEl === activeAudioRef && audioEl.paused) {
                audioEl.play();
                setIsPlaying(true);
            }
        });

        audioEl.addEventListener('loadedmetadata', handleLoadedMetadata);
        audioEl.addEventListener('timeupdate', handleTimeUpdate);
        audioEl.addEventListener('ended', handleEnded);

        // eslint-disable-next-line consistent-return
        return () => {
            if (audioEl === activeAudioRef) {
                // Moving to background
                dispatch({
                    type: AudioTypes.SET_AUDIO,
                    payload: {
                        currentTime: audioEl.currentTime,
                        playbackRate: audioEl.playbackRate,
                        isBackground: true,
                    },
                });
            }

            audioEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audioEl.removeEventListener('timeupdate', handleTimeUpdate);
            audioEl.removeEventListener('ended', handleEnded);
            unsubscribe();
        };
    }, [isDragging, isPlaying, audioUrl, dispatch]);

    // تعديل: useEffect منفصل للتعامل مع النقر خارج القائمة (menu)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showMenu && !(event.target as HTMLElement).closest('.menu-container')) {
                setShowMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showMenu]);

    // تعديل: دالة togglePlay مع منطق أوضح وتعليقات توضيحية
    const togglePlay = () => {
        if (!audioRef.current) {
            return;
        }

        // ✅ إذا كان هناك صوت آخر يعمل، يتم إيقافه وإزالته من Redux
        if (activeAudioRef && activeAudioRef !== audioRef.current) {
            activeAudioRef.pause();
            activeAudioRef.currentTime = 0; // إعادة تعيين وقت الصوت القديم
            activeAudioRef = null; // إزالة الصوت النشط القديم من المرجع
            dispatch({type: AudioTypes.RESET_AUDIO}); // ✅ حذف الصوت القديم من Redux
        }

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            dispatch({type: AudioTypes.PAUSE_AUDIO});
        } else {
            // استئناف التشغيل من النقطة الحالية بدون إعادة تعيين الوقت
            audioRef.current.play();
            setIsPlaying(true);
            setHasPlayed(true);
            activeAudioRef = audioRef.current; // تعيين الصوت النشط الجديد
            dispatch({
                type: AudioTypes.SET_AUDIO,

                payload: {
                    audioUrl,
                    currentTime: audioRef.current.currentTime,
                    mimeType,
                    isPlaying: true,
                    duration: audioRef.current?.duration || 0,
                    playbackRate,
                },
            });
        }
    };

    // دالة لتحويل الوقت إلى صيغة دقائق:ثواني
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // تعديل: دالة handleSeek تقوم بتحديث الوقت الحالي بناءً على نسبة التقدم (من 0 إلى 1)
    const handleSeek = (progress: number) => {
        if (audioRef.current) {
            const newTime = progress * duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
            setHasPlayed(true);

            // Only update Redux time for the currently active audio.
            // Otherwise seeking a non-active audio would move the currently playing one.
            if (audioRef.current === activeAudioRef) {
                dispatch({
                    type: AudioTypes.UPDATE_AUDIO_TIME,
                    payload: {currentTime: newTime},
                });
            }
        }
    };

    return (
        <div className='audio-player1 audio-player-container'>
            <div className='controls'>
                {isPlaying ? currentAudioSpeed : audioSenderProfilePic}

                {/* <div className='menu-container'>
                    {showMenu && (
                        <div className='menus'>
                            <button onClick={() => handleSpeedChange(0.5)}>{'0.5x'}</button>
                            <button onClick={() => handleSpeedChange(1.0)}>{'1.0x'}</button>
                            <button onClick={() => handleSpeedChange(1.5)}>{'1.5x'}</button>
                            <button onClick={() => handleSpeedChange(2.0)}>{'2.0x'}</button>
                            <button
                                onClick={handleDownload}
                                className='download-button'
                            >
                                <Download size={16}/> {'تنزيل'}
                            </button>
                        </div>
                    )}
                    <button
                        className='menu-button'
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                    >
                        <MoreVertical size={18}/>
                    </button>

                </div> */}
            </div>
            <audio
                ref={audioRef}
            >
                <track kind='captions'/>
                <source
                    src={audioUrl}
                    type={mimeType}
                />
            </audio>
            <button
                className='play-button1'
                onClick={togglePlay}
            >
                {isPlaying ? (
                    <Pause size={20}/>
                ) : (
                    <Play
                        className='play'
                        size={20}
                    />
                )}
            </button>
            <div className='progress-container1 audio-player-element'>
                <div
                    ref={progressRef}
                    className='progress-container1'
                >
                    <WaveformVisualizer
                        progress={currentTime / duration}
                        onSeek={handleSeek}
                    />
                    <div className='time-display'>
                        <span className='time'>
                            {hasPlayed ? formatTime(currentTime) : formatTime(duration)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
