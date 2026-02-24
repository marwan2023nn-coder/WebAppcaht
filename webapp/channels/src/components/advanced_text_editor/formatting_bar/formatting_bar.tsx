// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useFloating, offset, useClick, useDismiss, useInteractions} from '@floating-ui/react';
import classNames from 'classnames';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import {CSSTransition} from 'react-transition-group';
import styled from 'styled-components';

import {DotsHorizontalIcon} from '@workspace/compass-icons/components';

import VideoIcon from 'components/app_bar/video_icon';
import VoiceIcon from 'components/app_bar/voice_icon';
import WithTooltip from 'components/with_tooltip';

import CallButton from 'plugins/call_button';
import type {ApplyMarkdownOptions, MarkdownMode} from 'utils/markdown/apply_markdown';

import FormattingIcon, {IconContainer} from './formatting_icon';
import {useFormattingBarControls} from './hooks';

export const Separator = styled.div`
    display: block;
    position: relative;
    width: 1px;
    height: 24px;
    background: rgba(var(--center-channel-color-rgb), 0.16);
`;

export const FormattingBarSpacer = styled.div`
    display: flex;
    height: 48px;
    transition: height 0.25s ease;
    align-items: end;
    background: var(--center-channel-bg);
`;

const FormattingBarContainer = styled.div`
    display: flex;
    height: 48px;
    padding-inline-start: 7px;
    background: transparent;
    align-items: center;
    gap: 2px;
    position: relative;
    transform-origin: top;
    transition: height 0.25s ease;
    &::before {
        position: absolute;
        top: 0;
        right: 10px;
        left: 10px;
        border-top: var(--border-default);
        content: '';
        pointer-events: none;
    }
`;

const HiddenControlsContainer = styled.div`
    padding: 5px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    background: var(--center-channel-bg);
    z-index: -1;

    transition: transform 250ms ease, opacity 250ms ease;
    transform: scale(0);
    opacity: 0;
    display: flex;

    &.scale-enter {
        transform: scale(0);
        opacity: 0;
        z-index: 20;
    }

    &.scale-enter-active {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-enter-done {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-exit {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-exit-active {
        transform: scale(0);
        opacity: 0;
        z-index: 20;
    }

    &.scale-exit-done {
        transform: scale(0);
        opacity: 0;
        z-index: -1;
    }
`;

interface FormattingBarProps {

    /**
     * the current inputValue
     * This is needed to apply the markdown to the correct place
     */
    getCurrentMessage: () => string;

    /**
     * The textbox element tied to the advanced texteditor
     * NOTE: Since the only thing we need from that is the current selection
     *       range we should probably refactor this and only pass down the
     *       selectionStart and selectionEnd values
     */
    getCurrentSelection: () => {start: number; end: number};

    /**
     * the handler function that applies the markdown to the value
     */
    applyMarkdown: (options: ApplyMarkdownOptions) => void;

    /**
     * disable formatting controls when the texteditor is in preview state
     */
    disableControls: boolean;

    /**
     * location of the advanced text editor in the UI (center channel / RHS)
     */
    location: string;

    /**
     * controls that enhance the message,
     * e.g: message priority picker
     */
    additionalControls?: React.ReactNodeArray;

    /**
     * whether the formatting bar is in edit mode
     */
    isInEditMode?: boolean;

    /**
     * whether to show call controls
     */
    showCallControls?: boolean;
}

const DEFAULT_MIN_MODE_X_COORD = 55;

const FormattingBar = (props: FormattingBarProps): JSX.Element => {
    const {
        applyMarkdown,
        getCurrentMessage,
        getCurrentSelection,
        disableControls,
        additionalControls,
        location,
        isInEditMode,
        showCallControls = true,
    } = props;
    const [showHiddenControls, setShowHiddenControls] = useState(false);
    const formattingBarRef = useRef<HTMLDivElement>(null);
    const {controls, hiddenControls, wideMode} = useFormattingBarControls(formattingBarRef);

    const {formatMessage} = useIntl();
    const HiddenControlsButtonAriaLabel = formatMessage({id: 'accessibility.button.hidden_controls_button', defaultMessage: 'show hidden formatting options'});

    const {x, y, strategy, update, context, refs: {setReference, setFloating}} = useFloating<HTMLButtonElement>({
        open: showHiddenControls,
        onOpenChange: setShowHiddenControls,
        placement: 'top',
        middleware: [offset({mainAxis: 4})],
    });

    const click = useClick(context);
    const {getReferenceProps: getClickReferenceProps, getFloatingProps: getClickFloatingProps} = useInteractions([
        click,
    ]);

    const dismiss = useDismiss(context);
    const {getReferenceProps: getDismissReferenceProps, getFloatingProps: getDismissFloatingProps} = useInteractions([
        dismiss,
    ]);

    useEffect(() => {
        update?.();
    }, [wideMode, update, showHiddenControls]);

    const hasHiddenControls = true;

    /**
     * wrapping this factory in useCallback prevents it from constantly getting a new
     * function signature as if we would define it directly in the props of
     * the FormattingIcon component. This should improve render-performance
     */
    const makeFormattingHandler = useCallback((mode: MarkdownMode) => () => {
        // if the formatting is disabled just return without doing anything
        if (disableControls) {
            return;
        }

        // get the current selection values and return early (doing nothing) when we don't get valid values
        const {start, end} = getCurrentSelection();

        if (start === null || end === null) {
            return;
        }

        const value = getCurrentMessage();

        applyMarkdown({
            markdownMode: mode,
            selectionStart: start,
            selectionEnd: end,
            message: value,
        });

        // if hidden controls are currently open close them
        if (showHiddenControls) {
            setShowHiddenControls(false);
        }
    }, [getCurrentSelection, getCurrentMessage, applyMarkdown, showHiddenControls, disableControls]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const leftPosition = wideMode === 'min' ? (x ?? 0) + DEFAULT_MIN_MODE_X_COORD : x ?? 0;

    const hiddenControlsContainerStyles: React.CSSProperties = {
        position: strategy,
        top: y ?? 0,

        // insetInlinee: leftPosition,
    };

    const showSeparators = wideMode === 'wide';

    const {priorityAdditionalControl, burnOnReadAdditionalControl, otherAdditionalControls} = useMemo(() => {
        if (!Array.isArray(additionalControls) || additionalControls.length === 0) {
            return {priorityAdditionalControl: null, burnOnReadAdditionalControl: null, otherAdditionalControls: null};
        }

        const priorityControl = additionalControls.find((control) => {
            return React.isValidElement(control) && control.key === 'post-priority-picker-key';
        }) || null;

        const burnOnReadControl = additionalControls.find((control) => {
            return React.isValidElement(control) && control.key === 'burn-on-read-control-key';
        }) || null;

        const remainingControls = additionalControls.filter((control) => {
            return !(React.isValidElement(control) && (control.key === 'post-priority-picker-key' || control.key === 'burn-on-read-control-key'));
        });

        return {
            priorityAdditionalControl: priorityControl,
            burnOnReadAdditionalControl: burnOnReadControl,
            otherAdditionalControls: remainingControls.length ? remainingControls : null,
        };
    }, [additionalControls]);

    return (
        <FormattingBarContainer
            ref={formattingBarRef}
            data-testid='formattingBarContainer'
        >


            {hasHiddenControls && (
                <>
                    <WithTooltip
                        title={formatMessage({
                            id: 'shortcuts.msgs.formatting_bar.more_formatting_options',
                            defaultMessage: 'More formatting options',
                        })}
                        disabled={showHiddenControls}
                    >
                        <IconContainer
                            id={'HiddenControlsButton' + location}
                            ref={setReference}
                            className={classNames({active: showHiddenControls})}
                            aria-label={HiddenControlsButtonAriaLabel}
                            type='button'
                            {...getClickReferenceProps()}
                            {...getDismissReferenceProps()}
                        >
                            <DotsHorizontalIcon
                                color={'currentColor'}
                                size={18}
                            />
                        </IconContainer>
                    </WithTooltip>
                </>
            )}
            {burnOnReadAdditionalControl}
            {(wideMode === 'wide' || wideMode === 'normal') && (
                <>
                    {priorityAdditionalControl}
                    {showSeparators && <Separator/>}
                    {!isInEditMode && showCallControls && (
                        <>
                            <VoiceIcon/>
                            <VideoIcon/>
                            <CallButton/>
                        </>
                    )}
                </>
            )}
            <CSSTransition
                timeout={250}
                classNames='scale'
                in={showHiddenControls}
                unmountOnExit={true}
            >
                <HiddenControlsContainer
                    ref={setFloating}
                    style={hiddenControlsContainerStyles}
                    {...getClickFloatingProps()}
                    {...getDismissFloatingProps()}
                >
                    {controls.map((mode) => {
                        return (
                            <React.Fragment key={mode}>
                                <FormattingIcon
                                    mode={mode}
                                    className='control'
                                    onClick={makeFormattingHandler(mode)}
                                    disabled={disableControls}
                                />
                                {mode === 'heading' && showSeparators && <Separator/>}
                            </React.Fragment>
                        );
                    })}

                    {Array.isArray(otherAdditionalControls) && otherAdditionalControls.length > 0 && (
                        <>
                            {showSeparators && <Separator/>}
                            {otherAdditionalControls}
                        </>
                    )}

                    {!isInEditMode && wideMode !== 'wide' && showCallControls && (
                        <>
                            {showSeparators && <Separator/>}
                            <VoiceIcon/>
                            <VideoIcon/>
                            <CallButton/>
                        </>
                    )}

                    {hiddenControls.map((mode) => {
                        return (
                            <FormattingIcon
                                key={mode}
                                mode={mode}
                                className='control'
                                onClick={makeFormattingHandler(mode)}
                                disabled={disableControls}
                            />
                        );
                    })}
                </HiddenControlsContainer>
            </CSSTransition>
        </FormattingBarContainer>
    );
};

export default memo(FormattingBar);
