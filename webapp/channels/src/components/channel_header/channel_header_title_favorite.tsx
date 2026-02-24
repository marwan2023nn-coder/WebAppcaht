// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {memo, useCallback, useRef, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';

import {TrashCanOutlineIcon} from '@workspace/compass-icons/components';

import {favoriteChannel, unfavoriteChannel} from 'workspace-redux/actions/channels';
import {Client4} from 'workspace-redux/client';
import {getCurrentChannel, isCurrentChannelFavorite} from 'workspace-redux/selectors/entities/channels';
import {getCurrentUserId} from 'workspace-redux/selectors/entities/common';
import {isCurrentUserSystemAdmin} from 'workspace-redux/selectors/entities/users';

import {deleteAndRemovePost} from 'actions/post_actions';
import {getIsPostMultiSelectModeEnabled, getMultiSelectedPostIds} from 'selectors/posts';
import store from 'stores/redux_store';

import WithTooltip from 'components/with_tooltip';

import type {A11yFocusEventDetail} from 'utils/constants';
import {A11yCustomEventTypes, ActionTypes} from 'utils/constants';
import * as PostUtils from 'utils/post_utils';

import type {GlobalState} from 'types/store';

const ChannelHeaderTitleFavorite = () => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const isFavorite = useSelector(isCurrentChannelFavorite);
    const channel = useSelector(getCurrentChannel);
    const channelIsArchived = (channel?.delete_at ?? 0) > 0;
    const favIconRef = useRef<HTMLButtonElement>(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [deleteForEveryone, setDeleteForEveryone] = useState(false);
    const [selectSpecificMessages, setSelectSpecificMessages] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const isAdmin = useSelector(isCurrentUserSystemAdmin);

    const isPostMultiSelectModeEnabled = useSelector(getIsPostMultiSelectModeEnabled);
    const multiSelectedPostIds = useSelector(getMultiSelectedPostIds);
    const multiSelectedPosts = useSelector((state: GlobalState) => {
        return multiSelectedPostIds.map((id) => state.entities.posts.posts[id]).filter(Boolean);
    });

    const toggleFavoriteCallback = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!channel) {
            return;
        }
        if (isFavorite) {
            dispatch(unfavoriteChannel(channel.id));
        } else {
            dispatch(favoriteChannel(channel.id));
        }
        requestAnimationFrame(() => {
            if (favIconRef.current) {
                document.dispatchEvent(
                    new CustomEvent<A11yFocusEventDetail>(A11yCustomEventTypes.FOCUS, {
                        detail: {
                            target: favIconRef.current,
                            keyboardOnly: false,
                        },
                    }),
                );
            }
        });
    }, [isFavorite, channel, dispatch]);

    if (!channel || channelIsArchived) {
        return null;
    }

    let ariaLabel = intl.formatMessage({id: 'channelHeader.addToFavorites'});
    if (isFavorite) {
        ariaLabel = intl.formatMessage({id: 'channelHeader.removeFromFavorites'});
    }
    ariaLabel = ariaLabel.toLowerCase();

    const deleteAllPosts = async () => {
        try {
            const channelId = channel.id;
            const userId = getCurrentUserId(store.getState());

            let hasMorePosts = true;
            let lastPostId = '';

            while (hasMorePosts) {
                // eslint-disable-next-line no-await-in-loop
                const postsResponse = await Client4.getPostsBefore(channelId, lastPostId, 0, 100);

                if (!postsResponse || !postsResponse.posts) {
                    setModalMessage(intl.formatMessage({id: 'channelHeader.deleteAll.failedToRetrieve'}));
                    setShowResultModal(true);
                    return;
                }

                const posts = Object.values(postsResponse.posts);
                lastPostId = posts.length > 0 ? posts[posts.length - 1].id : '';
                hasMorePosts = posts.length > 0;

                for (const post of posts) {
                    if (!deleteForEveryone && post.user_id === userId) {
                        try {
                            // eslint-disable-next-line no-await-in-loop
                            await Client4.deletePost(post.id);
                        } catch (error) {
                            // eslint-disable-next-line no-console
                            console.error('Failed to delete post', post.id, error);
                        }
                    } else if (deleteForEveryone) {
                        try {
                            // eslint-disable-next-line no-await-in-loop
                            await Client4.deletePost(post.id);
                        } catch (error) {
                            // eslint-disable-next-line no-console
                            console.error('Failed to delete post', post.id, error);
                        }
                    }
                }
            }

            setModalMessage(intl.formatMessage({id: 'channelHeader.deleteAll.success'}));
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error deleting posts:', error);
            setModalMessage(intl.formatMessage({id: 'channelHeader.delete.error'}));
        } finally {
            setShowResultModal(true);
        }
    };

    const deleteSelectedPosts = async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const userId = getCurrentUserId(store.getState());
            const candidates = multiSelectedPosts;
            if (!candidates.length) {
                setModalMessage(intl.formatMessage({id: 'channelHeader.delete.noSelection'}));
                return;
            }

            const state = store.getState() as GlobalState;
            const deletable = candidates.filter((p) => PostUtils.canDeletePost(state, p, channel));

            const notDeletableCount = candidates.length - deletable.length;

            if (!deletable.length) {
                setModalMessage(intl.formatMessage({id: 'channelHeader.delete.noDeletableSelection'}));
                return;
            }

            const results = await Promise.all(deletable.map((p) => dispatch(deleteAndRemovePost(p) as any)));
            const deletedCount = results.filter((r) => !r?.error).length;
            const failedCount = results.filter((r) => r?.error).length;
            const skipped = notDeletableCount + failedCount;

            if (deletedCount === 0) {
                setModalMessage(intl.formatMessage({id: 'channelHeader.delete.error'}));
                return;
            }

            if (skipped > 0 && !deleteForEveryone) {
                setModalMessage(intl.formatMessage({
                    id: 'channelHeader.delete.successWithSkipped',
                }, {
                    deleted: deletedCount,
                    skipped,
                }));
            } else {
                setModalMessage(intl.formatMessage({
                    id: 'channelHeader.delete.success',
                }, {
                    count: deletedCount,
                }));
            }

            dispatch({type: ActionTypes.CLEAR_MULTISELECT_POSTS});
            dispatch({type: ActionTypes.SET_POST_MULTISELECT_MODE, data: {enabled: false}});
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error deleting selected posts:', error);
            setModalMessage(intl.formatMessage({id: 'channelHeader.delete.error'}));
        }
    };

    const title = (
        <>
            {!isFavorite &&
                <FormattedMessage
                    id='channelHeader.addToFavorites'
                />}
            {isFavorite &&
                <FormattedMessage
                    id='channelHeader.removeFromFavorites'
                />}
        </>
    );

    const handleCloseResultModal = () => setShowResultModal(false);

    const handleConfirmDelete = () => {
        setShowConfirmationModal(false);

        if (!isPostMultiSelectModeEnabled && selectSpecificMessages) {
            setDeleteForEveryone(false);
            setSelectSpecificMessages(false);
            dispatch({type: ActionTypes.SET_POST_MULTISELECT_MODE, data: {enabled: true}});
            dispatch({type: ActionTypes.CLEAR_MULTISELECT_POSTS});
            setShowResultModal(false);
            return;
        }

        if (isPostMultiSelectModeEnabled) {
            setIsDeleting(true);
            deleteSelectedPosts().finally(() => {
                setIsDeleting(false);
                setShowResultModal(true);
            });
            return;
        }

        setIsDeleting(true);
        deleteAllPosts().finally(() => setIsDeleting(false));
    };

    const selectedCount = multiSelectedPostIds.length;
    const deleteTooltipTitle = isPostMultiSelectModeEnabled ? intl.formatMessage({
        id: 'channelHeader.deleteTooltipSelected',
    }, {
        count: selectedCount,
    }) : intl.formatMessage({id: 'channelHeader.deleteTooltipAll'});

    const confirmTitle = isPostMultiSelectModeEnabled ? intl.formatMessage({
        id: 'channelHeader.confirmDeleteSelected.title',
    }) : intl.formatMessage({
        id: 'channelHeader.confirmDeleteAll.title',
    });

    const confirmBody = isPostMultiSelectModeEnabled ? intl.formatMessage({
        id: 'channelHeader.confirmDeleteSelected.body',
    }, {
        count: selectedCount,
    }) : intl.formatMessage({
        id: 'channelHeader.confirmDeleteAll.body',
    });

    const resultTitle = isPostMultiSelectModeEnabled ? intl.formatMessage({
        id: 'channelHeader.resultDeleteSelected.title',
    }) : intl.formatMessage({
        id: 'channelHeader.resultDeleteAll.title',
    });

    const isStartCta = !isPostMultiSelectModeEnabled && selectSpecificMessages;

    // eslint-disable-next-line no-nested-ternary
    const confirmButtonLabelId = isPostMultiSelectModeEnabled ? (
        'channelHeader.delete.confirmSelectedMineOnly'
    ) : (
        // eslint-disable-next-line no-nested-ternary
        selectSpecificMessages ? 'channelHeader.multiselectMode.startCta' : deleteForEveryone ? 'channelHeader.delete.confirmForEveryone' : 'channelHeader.delete.confirmMineOnly'
    );
    const isConfirmDisabled = isDeleting || (isPostMultiSelectModeEnabled && selectedCount === 0);

    const onTrashClick = () => {
        if (isDeleting) {
            return;
        }

        if (!isPostMultiSelectModeEnabled) {
            setSelectSpecificMessages(false);
            setShowConfirmationModal(true);
            return;
        }

        if (selectedCount === 0) {
            setDeleteForEveryone(false);
            dispatch({type: ActionTypes.SET_POST_MULTISELECT_MODE, data: {enabled: false}});
            dispatch({type: ActionTypes.CLEAR_MULTISELECT_POSTS});
            setModalMessage(intl.formatMessage({id: 'channelHeader.delete.unselectMode'}));
            setShowResultModal(true);
            return;
        }

        setDeleteForEveryone(false);
        setShowConfirmationModal(true);
    };

    return (
        <div>
            <WithTooltip
                title={title}
            >
                <button
                    id='toggleFavorite'
                    onClick={toggleFavoriteCallback}
                    className={classNames('channel-header__favorites btn btn-icon btn-xs', {active: isFavorite, inactive: !isFavorite})}
                    aria-label={ariaLabel}
                    ref={favIconRef}
                >
                    <i className={classNames('icon', {'icon-star': isFavorite, 'icon-star-outline': !isFavorite})}/>
                </button>

            </WithTooltip>
            {isAdmin && (
                <WithTooltip
                    title={deleteTooltipTitle}
                >
                    <button
                        onClick={onTrashClick}
                        className={classNames('channel-header__favorites btn btn-icon btn-xs channel-header-title-favorite__trash', {active: isFavorite, inactive: !isFavorite})}
                        disabled={isDeleting}
                        aria-label={deleteTooltipTitle}
                    >
                        <span className='channel-header-title-favorite__trash-icon'>
                            <TrashCanOutlineIcon size={18}/>
                        </span>
                        {isPostMultiSelectModeEnabled && selectedCount > 0 && (
                            <span className='channel-header-title-favorite__trash-badge'>
                                {selectedCount}
                            </span>
                        )}
                    </button>
                </WithTooltip>

            )}

            {/* Confirmation Modal */}
            <Modal
                show={showConfirmationModal}
                onHide={() => setShowConfirmationModal(false)}
                dialogClassName='channel-header-title-favorite__modal'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <span className='channel-header-title-favorite__modal-title'>
                            {confirmTitle}
                        </span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='channel-header-title-favorite__modal-body'>
                        <div className='channel-header-title-favorite__modal-text'>
                            {confirmBody}
                        </div>

                        {isPostMultiSelectModeEnabled && (
                            <div className='channel-header-title-favorite__modal-meta'>
                                <FormattedMessage id='channelHeader.delete.selectedCountLabel'/>
                                <span className='channel-header-title-favorite__modal-count'>{selectedCount}</span>
                            </div>
                        )}

                        {!isPostMultiSelectModeEnabled && (
                            <label className='channel-header-title-favorite__modal-checkbox'>
                                <input
                                    type='checkbox'
                                    checked={selectSpecificMessages}
                                    onChange={() => {
                                        const next = !selectSpecificMessages;
                                        setSelectSpecificMessages(next);
                                        if (next) {
                                            setDeleteForEveryone(false);
                                        }
                                    }}
                                />
                                <span className='ml-2 fons'>
                                    <FormattedMessage id='channelHeader.multiselectMode.enableCta'/>
                                </span>
                            </label>
                        )}

                        {!isPostMultiSelectModeEnabled && !selectSpecificMessages && (
                            <label className='channel-header-title-favorite__modal-checkbox'>
                                <input
                                    type='checkbox'
                                    checked={deleteForEveryone}
                                    onChange={() => setDeleteForEveryone(!deleteForEveryone)}
                                />
                                <span className='ml-2 fons'>
                                    <FormattedMessage id='channelHeader.deleteForEveryoneLabel'/>
                                </span>
                            </label>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className='btn btn-secondary'
                        onClick={() => {
                            if (isPostMultiSelectModeEnabled) {
                                setDeleteForEveryone(false);
                                dispatch({type: ActionTypes.CLEAR_MULTISELECT_POSTS});
                                dispatch({type: ActionTypes.SET_POST_MULTISELECT_MODE, data: {enabled: false}});
                            }
                            setSelectSpecificMessages(false);
                            setShowConfirmationModal(false);
                        }}
                        disabled={isDeleting}
                    >
                        <FormattedMessage id={isPostMultiSelectModeEnabled ? 'channelHeader.delete.clearSelection' : 'channelHeader.delete.cancel'}/>
                    </button>
                    <button
                        className={classNames('btn', {
                            'btn-danger': !isStartCta,
                            'channel-header-title-favorite__start-cta': isStartCta,
                        })}
                        onClick={handleConfirmDelete}
                        disabled={isConfirmDisabled}
                    >
                        <FormattedMessage id={confirmButtonLabelId}/>
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Result Modal for Success or Error */}
            <Modal
                show={showResultModal}
                onHide={handleCloseResultModal}
                dialogClassName='channel-header-title-favorite__modal'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>{resultTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='channel-header-title-favorite__result-text'>
                        {modalMessage}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className='btn btn-primary'
                        onClick={handleCloseResultModal}
                    >
                        <FormattedMessage id='channelHeader.delete.close'/>
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default memo(ChannelHeaderTitleFavorite);
