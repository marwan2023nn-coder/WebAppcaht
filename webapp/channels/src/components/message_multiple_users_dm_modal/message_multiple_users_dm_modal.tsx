import classNames from 'classnames';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {defineMessage, FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import type {UserProfile} from '@workspace/types/users';

import {Client4} from 'workspace-redux/client';
import {getProfiles, getProfilesInTeam, searchProfiles} from 'workspace-redux/actions/users';
import {getConfig, getFeatureFlagValue} from 'workspace-redux/selectors/entities/general';
import {getCurrentTeam, getCurrentTeamId} from 'workspace-redux/selectors/entities/teams';
import {getCurrentUserId, getProfiles as selectProfiles, getProfilesInCurrentTeam} from 'workspace-redux/selectors/entities/users';

import {openDirectChannelToUserId, openGroupChannelToUserIds} from 'actions/channel_actions';
import {uploadFile} from 'actions/file_actions';
import {createPost} from 'actions/post_actions';

import AdvancedTextEditor from 'components/advanced_text_editor/advanced_text_editor';
import MultiSelect from 'components/multiselect/multiselect';
import type {Value} from 'components/multiselect/multiselect';
import ProfilePicture from 'components/profile_picture';
import BotTag from 'components/widgets/tag/bot_tag';
import GuestTag from 'components/widgets/tag/guest_tag';

import {isGuest} from 'workspace-redux/utils/user_utils';

import {displayEntireNameForUser, generateId} from 'utils/utils';

import {getHistory} from 'utils/browser_history';

import {Locations} from 'utils/constants';

import type {GlobalState} from 'types/store';
import type {PostDraft} from 'types/store/draft';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = 20;

type UserProfileValue = Value & UserProfile;

type Props = {
    onExited?: () => void;
}

type State = {
    searchResults: UserProfile[];
    values: UserProfileValue[];
    show: boolean;
    search: boolean;
    page: number;
    saving: boolean;
    addError: string | null;
    loading: boolean;
    editorChannelId: string;
    editorChannelName: string;
    creatingChannel: boolean;
}

export default function MessageMultipleUsersDmModal(props: Props): JSX.Element {
    const intl = useIntl();
    const dispatch = useDispatch();

    const currentTeamId = useSelector(getCurrentTeamId);
    const currentTeam = useSelector(getCurrentTeam);
    const currentUserId = useSelector(getCurrentUserId);
    const teamUsers = useSelector((state: GlobalState) => getProfilesInCurrentTeam(state));
    const restrictDirectMessage = useSelector((state: GlobalState) => getConfig(state).RestrictDirectMessage);
    const enableSharedChannelsDMs = useSelector((state: GlobalState) => getFeatureFlagValue(state, 'EnableSharedChannelsDMs') === 'true');
    const globalUsers = useSelector((state: GlobalState) => {
        if (enableSharedChannelsDMs) {
            return selectProfiles(state);
        }
        return selectProfiles(state, {exclude_remote: true});
    });

    const [state, setState] = useState<State>({
        searchResults: [],
        values: [],
        show: true,
        search: false,
        page: 0,
        saving: false,
        addError: null,
        loading: true,
        editorChannelId: '',
        editorChannelName: '',
        creatingChannel: false,
    });

    const selectedItemRef = useRef<HTMLDivElement>(null);
    const lastEditorContextForUserIdRef = useRef<string>('');
    const isClosingRef = useRef(false);
    const isMountedRef = useRef(true);
    const latestUsersRequestIdRef = useRef(0);
    const searchDebounceTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (searchDebounceTimeoutRef.current) {
                window.clearTimeout(searchDebounceTimeoutRef.current);
                searchDebounceTimeoutRef.current = null;
            }
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const requestId = ++latestUsersRequestIdRef.current;

        (async () => {
            const isAny = restrictDirectMessage === 'any';

            if (!isAny && !currentTeamId) {
                setState((prev) => ({...prev, loading: false}));
                return;
            }

            if (isAny) {
                const options: Record<string, any> = {};
                if (!enableSharedChannelsDMs) {
                    options.exclude_remote = true;
                }
                await dispatch(getProfiles(0, USERS_PER_PAGE * 2, options) as any);
            } else {
                await dispatch(getProfilesInTeam(currentTeamId!, 0, USERS_PER_PAGE * 2) as any);
            }

            if (!isMountedRef.current || isClosingRef.current || requestId !== latestUsersRequestIdRef.current) {
                return;
            }

            setState((prev) => ({...prev, loading: false, search: false, page: 0, searchResults: []}));
        })();
    }, [currentTeamId, dispatch, enableSharedChannelsDMs, restrictDirectMessage]);

    const handleHide = () => {
        isClosingRef.current = true;
        latestUsersRequestIdRef.current++;

        if (searchDebounceTimeoutRef.current) {
            window.clearTimeout(searchDebounceTimeoutRef.current);
            searchDebounceTimeoutRef.current = null;
        }

        setState((prev) => {
            if (prev.show === false) {
                return prev;
            }
            return {...prev, show: false};
        });
    };

    const handleExit = () => {
        props.onExited?.();
    };

    const selectedUserIds = useMemo(() => {
        return state.values.map((v) => v.id).filter((id) => id !== currentUserId);
    }, [currentUserId, state.values]);

    const canCreateGroup = selectedUserIds.length > 1;

    const selectedUserIdsKey = useMemo(() => {
        return selectedUserIds.join('|');
    }, [selectedUserIds]);

    const search = async (term: string, requestId: number) => {
        const isAny = restrictDirectMessage === 'any';
        if (!isAny && !currentTeamId) {
            return;
        }

        let searchResults: UserProfile[] = [];
        const isSearching = term !== '';

        if (isSearching) {
            const options: Record<string, any> = {};
            const teamId = isAny ? '' : currentTeamId;
            if (teamId !== undefined) {
                options.team_id = teamId;
            }
            if (!enableSharedChannelsDMs) {
                options.exclude_remote = true;
            }

            const result = await dispatch(searchProfiles(term, options) as any);
            searchResults = result.data || [];
        } else {
            if (isAny) {
                const options: Record<string, any> = {};
                if (!enableSharedChannelsDMs) {
                    options.exclude_remote = true;
                }
                await dispatch(getProfiles(0, USERS_PER_PAGE * 2, options) as any);
            } else {
                await dispatch(getProfilesInTeam(currentTeamId!, 0, USERS_PER_PAGE * 2) as any);
            }
        }

        if (!isMountedRef.current || isClosingRef.current || requestId !== latestUsersRequestIdRef.current) {
            return;
        }

        setState((prev) => ({
            ...prev,
            loading: false,
            searchResults,
            search: isSearching,
        }));
    };

    const handleInput = (term: string) => {
        if (searchDebounceTimeoutRef.current) {
            window.clearTimeout(searchDebounceTimeoutRef.current);
        }

        const requestId = ++latestUsersRequestIdRef.current;
        setState((prev) => ({...prev, loading: true, page: 0}));

        searchDebounceTimeoutRef.current = window.setTimeout(() => {
            if (!isMountedRef.current || isClosingRef.current || requestId !== latestUsersRequestIdRef.current) {
                return;
            }

            search(term, requestId);
        }, 200);
    };

    const handleAdd = (value: UserProfileValue) => {
        setState((prev) => {
            const values = [...prev.values];
            if (!values.includes(value)) {
                values.push(value);
            }
            return {...prev, values, addError: null};
        });
    };

    const handleDelete = (values: UserProfileValue[]) => {
        setState((prev) => ({...prev, values, addError: null}));
    };

    useEffect(() => {
        let cancelled = false;

        if (!state.show) {
            return () => {
                cancelled = true;
            };
        }

        if (selectedUserIds.length === 0) {
            lastEditorContextForUserIdRef.current = '';
            setState((prev) => {
                if (prev.editorChannelId === '' && prev.editorChannelName === '' && prev.creatingChannel === false) {
                    return prev;
                }
                return {...prev, editorChannelId: '', editorChannelName: '', creatingChannel: false};
            });
            return () => {
                cancelled = true;
            };
        }

        const firstUserId = selectedUserIds[0];
        if (firstUserId && lastEditorContextForUserIdRef.current === firstUserId) {
            return () => {
                cancelled = true;
            };
        }
        lastEditorContextForUserIdRef.current = firstUserId;

        (async () => {
            setState((prev) => {
                if (prev.creatingChannel === true && prev.addError === null) {
                    return prev;
                }
                return {...prev, creatingChannel: true, addError: null};
            });

            try {
                // Use the first selected user's DM as the editor context.
                // Sending to multiple users from the editor is handled in customSubmit (one DM per user).
                const result = await dispatch(openDirectChannelToUserId(firstUserId) as any);

                const channel = result?.data;
                if (!cancelled && !isClosingRef.current) {
                    const nextId = channel?.id || '';
                    const nextName = channel?.name || '';
                    setState((prev) => {
                        if (prev.editorChannelId === nextId && prev.editorChannelName === nextName && prev.creatingChannel === false) {
                            return prev;
                        }
                        return {
                            ...prev,
                            editorChannelId: nextId,
                            editorChannelName: nextName,
                            creatingChannel: false,
                        };
                    });
                }
            } catch {
                if (!cancelled && !isClosingRef.current) {
                    setState((prev) => ({
                        ...prev,
                        creatingChannel: false,
                        editorChannelId: '',
                        editorChannelName: '',
                        addError: intl.formatMessage({id: 'message_multiple_users_dm.channel_failed', defaultMessage: 'Could not start this conversation. Please try again.'}),
                    }));
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [dispatch, selectedUserIdsKey, state.show]);

    const handlePageChange = (page: number, prevPage: number) => {
        const isAny = restrictDirectMessage === 'any';
        if (!isAny && !currentTeamId) {
            return;
        }

        if (page > prevPage) {
            const requestId = ++latestUsersRequestIdRef.current;
            const baseUsers = isAny ? globalUsers : teamUsers;
            const needMoreUsers = (baseUsers.length / USERS_PER_PAGE) <= page + 1;
            if (needMoreUsers) {
                setState((prev) => ({...prev, loading: true}));
            }

            const promise = isAny ? (() => {
                const options: Record<string, any> = {};
                if (!enableSharedChannelsDMs) {
                    options.exclude_remote = true;
                }
                return dispatch(getProfiles(page, USERS_PER_PAGE * 2, options) as any);
            })() : dispatch(getProfilesInTeam(currentTeamId!, page, USERS_PER_PAGE * 2) as any);

            promise.then(() => {
                if (!isMountedRef.current || isClosingRef.current || requestId !== latestUsersRequestIdRef.current) {
                    return;
                }
                setState((prev) => ({...prev, loading: false}));
            });

            setState((prev) => ({...prev, page}));
        }
    };

    const handleSubmit = () => {
        // Sending is handled by AdvancedTextEditor.
    };

    const customSubmit = async (submittingDraft: PostDraft) => {
        if (state.saving) {
            return;
        }

        const userIds = selectedUserIds;
        if (userIds.length === 0) {
            setState((prev) => ({
                ...prev,
                addError: intl.formatMessage({id: 'message_multiple_users_dm.no_recipients', defaultMessage: 'Select at least one person.'}),
            }));
            return {error: new Error('no recipients')};
        }

        let message = submittingDraft.message;
        const isBuzzMessage = (submittingDraft as any).isBuzzMessage === true;
        if (!isBuzzMessage && message?.trim() === 'BUZZMESSAGE') {
            message = '𝗕𝗨𝗭𝗭𝗠𝗘𝗦𝗦𝗔𝗚𝗘';
        }

        if (!message?.trim() && !(submittingDraft.fileInfos?.length > 0)) {
            setState((prev) => ({
                ...prev,
                addError: intl.formatMessage({id: 'message_multiple_users_dm.no_message', defaultMessage: 'Write a message to send.'}),
            }));
            return {error: new Error('empty message')};
        }

        setState((prev) => ({...prev, saving: true, addError: null}));
        try {
            const reuploadFilesToChannel = async (targetChannelId: string) => {
                const sourceFileInfos = submittingDraft.fileInfos || [];
                if (sourceFileInfos.length === 0) {
                    return [];
                }

                if (targetChannelId === state.editorChannelId) {
                    return sourceFileInfos;
                }

                const uploadedFileInfos = [] as any[];
                for (const fileInfo of sourceFileInfos) {
                    const fileUrl = Client4.getFileUrl(fileInfo.id, 0);
                    const {headers} = Client4.getOptions({method: 'GET'});

                    const res = await fetch(fileUrl, {headers: headers as any});
                    if (!res.ok) {
                        throw new Error('Unable to download file');
                    }

                    const blob = await res.blob();
                    const filename = fileInfo.name || 'file';
                    const mimeType = fileInfo.mime_type || blob.type || 'application/octet-stream';
                    const file = new File([blob], filename, {type: mimeType});

                    const uploadResult = await new Promise<any>((resolve, reject) => {
                        const clientId = generateId();
                        dispatch(uploadFile({
                            file,
                            name: filename,
                            type: mimeType,
                            rootId: '',
                            channelId: targetChannelId,
                            clientId,
                            onProgress: () => null,
                            onSuccess: (data) => resolve(data),
                            onError: (err) => reject(err),
                        }) as any);
                    });

                    const newInfo = uploadResult?.file_infos?.[0];
                    if (!newInfo) {
                        throw new Error('Unable to upload file');
                    }
                    uploadedFileInfos.push(newInfo);
                }

                return uploadedFileInfos;
            };

            for (const userId of userIds) {
                const channelResult = await dispatch(openDirectChannelToUserId(userId) as any);
                const channel = channelResult?.data;
                if (!channel) {
                    throw new Error('Unable to create direct channel');
                }

                const fileInfos = await reuploadFilesToChannel(channel.id);
                const fileIds = fileInfos.map((f) => f.id);

                const post = {
                    channel_id: channel.id,
                    message,
                    file_ids: fileIds,
                    props: {
                        ...(submittingDraft.props || {}),
                        ack: true,
                    },
                    metadata: {
                        ...(submittingDraft.metadata || {}),
                        ...(submittingDraft.metadata?.priority ? {priority: submittingDraft.metadata.priority} : {}),
                    },
                } as any;

                const postResult = await dispatch(createPost(post, fileInfos) as any);
                if (postResult?.error) {
                    throw postResult.error;
                }
            }
        } catch (error) {
            setState((prev) => ({
                ...prev,
                saving: false,
                addError: intl.formatMessage({id: 'message_multiple_users_dm.send_failed', defaultMessage: 'Could not send your message. Please try again.'}),
            }));
            return {error};
        }

        setState((prev) => ({...prev, saving: false}));
        return;
    };

    const handleStart = async () => {
        if (selectedUserIds.length === 0) {
            setState((prev) => ({
                ...prev,
                addError: intl.formatMessage({id: 'message_multiple_users_dm.no_recipients', defaultMessage: 'Select at least one person.'}),
            }));
            return;
        }

        setState((prev) => ({...prev, saving: true, addError: null}));
        try {
            const result = selectedUserIds.length === 1 ?
                await dispatch(openDirectChannelToUserId(selectedUserIds[0]) as any) :
                await dispatch(openGroupChannelToUserIds(selectedUserIds) as any);

            const channel = result?.data;
            if (channel && currentTeam?.name) {
                getHistory().push('/' + currentTeam.name + '/channels/' + channel.name);
            }
            handleHide();
        } finally {
            setState((prev) => ({...prev, saving: false}));
        }
    };

    const renderOption = (option: UserProfileValue, isSelected: boolean, onAdd: (user: UserProfileValue) => void, onMouseMove: (user: UserProfileValue) => void) => {
        let rowSelected = '';
        if (isSelected) {
            rowSelected = 'more-modal__row--selected';
        }

        return (
            <div
                key={option.id}
                ref={isSelected ? selectedItemRef : undefined}
                className={'more-modal__row clickable ' + rowSelected}
                onClick={() => onAdd(option)}
                onMouseMove={() => onMouseMove(option)}
            >
                <ProfilePicture
                    src={Client4.getProfilePictureUrl(option.id, option.last_picture_update)}
                    size='md'
                />
                <div className='more-modal__details'>
                    <div className='more-modal__name'>
                        {displayEntireNameForUser(option)}
                        {option.is_bot && <BotTag/>}
                        {isGuest(option.roles) && <GuestTag className='popoverlist'/>}
                    </div>
                </div>
                <div className='more-modal__actions'>
                    <button
                        className='more-modal__actions--round'
                        aria-label='Add users to message'
                    >
                        <i
                            className='icon icon-plus'
                        />
                    </button>
                </div>
            </div>
        );
    };

    const renderValue = (value: {data: UserProfileValue}): string => {
        return value.data?.username || '';
    };

    const renderAriaLabel = (option: UserProfileValue): string => {
        return option?.username || '';
    };

    const usersToDisplay = useMemo(() => {
        const baseUsers = state.search ? state.searchResults : (restrictDirectMessage === 'any' ? globalUsers : teamUsers);
        const users = state.search ? baseUsers : baseUsers.slice(0, (state.page + 1) * USERS_PER_PAGE * 2);
        return users.filter((u) => u.id !== currentUserId);
    }, [currentUserId, globalUsers, restrictDirectMessage, state.page, state.search, state.searchResults, teamUsers]);

    const options = useMemo(() => {
        return usersToDisplay.map((user) => ({label: user.username, value: user.id, ...user}));
    }, [usersToDisplay]);

    const buttonSubmitText = defineMessage({id: 'message_multiple_users_dm.send', defaultMessage: 'Send'});
    const buttonSubmitLoadingText = defineMessage({id: 'message_multiple_users_dm.sending', defaultMessage: 'Sending...'});

    return (
        <Modal
            id='messageMultipleUsersDmModal'
            dialogClassName={'a11y__modal more-modal more-direct-channels filtered-users'}
            show={state.show}
            onHide={handleHide}
            onExited={handleExit}
        >
            <Modal.Header closeButton={true}>
                <Modal.Title componentClass='h1'>
                    <FormattedMessage
                        id='message_multiple_users_dm.title'
                        defaultMessage='Send a Direct Message'
                    />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {state.addError && (
                    <div className='has-error col-sm-12'>
                        <label className='control-label font-weight--normal'>{state.addError}</label>
                    </div>
                )}
                <MultiSelect<UserProfileValue>
                    key='messageMultipleUsersDmKey'
                    options={options}
                    optionRenderer={renderOption}
                    intl={intl}
                    selectedItemRef={selectedItemRef}
                    ariaLabelRenderer={renderAriaLabel}
                    values={state.values}
                    valueRenderer={renderValue}
                    perPage={USERS_PER_PAGE}
                    handlePageChange={handlePageChange}
                    handleInput={handleInput}
                    handleDelete={handleDelete}
                    handleAdd={handleAdd}
                    handleSubmit={handleStart}
                    maxValues={MAX_SELECTABLE_VALUES}
                    buttonSubmitText={canCreateGroup ? (
                        <FormattedMessage
                            id='message_multiple_users_dm.start_group'
                            defaultMessage='Start as group'
                        />
                    ) : (
                        <FormattedMessage
                            id='message_multiple_users_dm.start'
                            defaultMessage='Start'
                        />
                    )}
                    buttonSubmitLoadingText={buttonSubmitLoadingText}
                    saving={state.saving}
                    loading={state.loading}
                    saveButtonPosition='top'
                    showPaginationControls={false}
                    placeholderText={defineMessage({id: 'message_multiple_users_dm.placeholder', defaultMessage: 'Search and add people'})}
                />
                {state.values.length > 0 && state.editorChannelId && !state.creatingChannel && (
                    <div className='pt-4'>
                        <AdvancedTextEditor
                            location={Locations.MODAL}
                            channelId={state.editorChannelId}
                            rootId=''
                            storageKey={`message_multiple_users_dm_${state.editorChannelId}`}
                            customSubmit={customSubmit}
                            showBurnOnRead={false}
                            showPostBoxIndicator={false}
                            showCallControls={false}
                            showPluginControls={false}
                            afterSubmit={(result) => {
                                if (!result.error) {
                                    handleHide();
                                }
                            }}
                        />
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
}
