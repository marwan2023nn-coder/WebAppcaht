// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {ViewGridPlusOutlineIcon} from '@workspace/compass-icons/components';

import {openModal} from 'actions/views/modals';

import MarketplaceModal from 'components/plugin_marketplace/marketplace_modal';
import WithTooltip from 'components/with_tooltip';

import {ModalIdentifiers} from 'utils/constants';

const AppBarMarketplace = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const handleOpenMarketplace = useCallback(() => {
        dispatch(
            openModal({
                modalId: ModalIdentifiers.PLUGIN_MARKETPLACE,
                dialogType: MarketplaceModal,
                dialogProps: {},
            }),
        );
    }, [dispatch]);

    const label = formatMessage({id: 'app_bar.marketplace', defaultMessage: 'App Marketplace'});

    return (
        <WithTooltip
            title={label}
            isVertical={false}
        >
            <button
                key='app_bar_marketplace'
                className='app-bar__icon'
                aria-label={label}
                onClick={handleOpenMarketplace}
            >
                <div className='app-bar__icon-inner app-bar__icon-inner--centered'>
                    <ViewGridPlusOutlineIcon size={18}/>
                </div>
            </button>
        </WithTooltip>
    );
};

export default AppBarMarketplace;
