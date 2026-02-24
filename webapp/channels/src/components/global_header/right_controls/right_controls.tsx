// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import type {ProductIdentifier} from '@workspace/types/products';

import {isCurrentUserGuestUser} from 'workspace-redux/selectors/entities/users';

import {OnboardingTourSteps, OnboardingTourStepsForGuestUsers} from 'components/tours';
import {
    CustomizeYourExperienceTour,
    useShowOnboardingTutorialStep,
} from 'components/tours/onboarding_tour';
import UserAccountMenu from 'components/user_account_menu';

import {setProductMenuSwitcherOpen} from 'actions/views/product_menu';
import {isSwitcherOpen} from 'selectors/views/product_menu';

import {
    OnboardingTaskCategory,
    OnboardingTasksName,
    TaskNameMapToSteps,
    useHandleOnBoardingTaskData,
} from 'components/onboarding_tasks';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import Pluggable from 'plugins/pluggable';
import {LicenseSkus} from 'utils/constants';
import {useCurrentProductId, useProducts, isChannels} from 'utils/products';

import {getLicense} from 'workspace-redux/selectors/entities/general';

import type {GlobalState} from 'types/store';

import HeaderIconButton from 'components/global_header/header_icon_button';

import AtMentionsButton from './at_mentions_button/at_mentions_button';
import PlanUpgradeButton from './plan_upgrade_button';
import SavedPostsButton from './saved_posts_button/saved_posts_button';
import SettingsButton from './settings_button';
import {ProductsIcon} from '@workspace/compass-icons/components';

import ProductMenuItem from '../left_controls/product_menu/product_menu_item';
import ProductMenuList from '../left_controls/product_menu/product_menu_list';

const RightControlsContainer = styled.div`
    display: flex;
    align-items: center;
    height: 40px;
    flex-shrink: 0;
    position: relative;
    flex-basis: 30%;
    justify-content: flex-end;
    margin:0;
    gap:4px;
`;

const StyledCustomizeYourExperienceTour = styled.div`
    display: flex;
    align-items: center;
    height: 100%
`;

export type Props = {
    productId?: ProductIdentifier;
}

const RightControls = ({productId = null}: Props): JSX.Element => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    // guest validation to see which point the messaging tour tip starts
    const isGuestUser = useSelector((state: GlobalState) => isCurrentUserGuestUser(state));
    const tourStep = isGuestUser ? OnboardingTourStepsForGuestUsers.CUSTOMIZE_EXPERIENCE : OnboardingTourSteps.CUSTOMIZE_EXPERIENCE;

    const switcherOpen = useSelector(isSwitcherOpen);
    const products = useProducts();
    const currentProductID = useCurrentProductId();
    const license = useSelector(getLicense);

    const showCustomizeTip = useShowOnboardingTutorialStep(tourStep);

    const handleOnBoardingTaskData = useHandleOnBoardingTaskData();
    const visitSystemConsoleTaskName = OnboardingTasksName.VISIT_SYSTEM_CONSOLE;
    const handleVisitConsoleClick = () => {
        const steps = TaskNameMapToSteps[visitSystemConsoleTaskName];
        handleOnBoardingTaskData(visitSystemConsoleTaskName, steps.FINISHED);
        localStorage.setItem(OnboardingTaskCategory, 'true');
    };

    const handleToggleSwitcher = (open: boolean) => {
        dispatch(setProductMenuSwitcherOpen(open));
    };

    const handleCloseSwitcher = () => {
        dispatch(setProductMenuSwitcherOpen(false));
    };

    const productItems = products?.map((product) => {
        return (
            <ProductMenuItem
                key={product.id}
                destination={product.switcherLinkURL}
                icon={product.switcherIcon}
                text={product.switcherText}
                active={product.id === currentProductID}
                onClick={handleCloseSwitcher}
                tourTip={undefined}
                id={`product-menu-item-${product.pluginId || product.id}`}
            />
        );
    });

    const isFreeEdition = license.IsLicensed === 'false' || license.SkuShortName === LicenseSkus.Entry;

    return (
        <RightControlsContainer
            id={'RightControlsContainer'}
        >
            {/* <PlanUpgradeButton/> */}
            <MenuWrapper
                open={switcherOpen}
                onToggle={handleToggleSwitcher}
            >
                <HeaderIconButton
                    type='button'
                    toggled={switcherOpen}
                    aria-label={formatMessage({id: 'global_header.productSwitchMenu', defaultMessage: 'Product switch menu'})}
                    aria-expanded={switcherOpen}
                    aria-controls='product-switcher-menu'
                >
                    <ProductsIcon
                        size={'1.8rem'}
                        color='currentColor'
                    />
                </HeaderIconButton>
                <Menu
                    listId={'product-switcher-menu-dropdown'}
                    className={'product-switcher-menu Productmeun'}
                    id={'product-switcher-menu'}
                    ariaLabel={'switcherOpen'}
                >
                    <ProductMenuItem
                        destination={'/'}
                        icon={'product-channels'}
                        text={formatMessage({id: 'sidebar.types.direct_messages', defaultMessage: 'Channels'})}
                        active={isChannels(currentProductID)}
                        onClick={handleCloseSwitcher}
                    />
                    {productItems}
                    <ProductMenuList
                        isMessaging={isChannels(currentProductID)}
                        onClick={handleCloseSwitcher}
                        handleVisitConsoleClick={handleVisitConsoleClick}
                    />
                    {isFreeEdition && (
                        <Menu.Group>
                            <Menu.StartTrial
                                id='startTrial'
                            />
                        </Menu.Group>
                    )}
                </Menu>
            </MenuWrapper>
            {isChannels(productId) ? (
                <>
                    <AtMentionsButton/>
                    <SavedPostsButton/>
                </>
            ) : (
                <Pluggable
                    pluggableName={'Product'}
                    subComponentName={'headerRightComponent'}
                    pluggableId={productId}
                />
            )}
            <StyledCustomizeYourExperienceTour id='CustomizeYourExperienceTour'>
                {
                    isChannels(productId) ? (
                        <>
                            <SettingsButton/>
                            {showCustomizeTip && <CustomizeYourExperienceTour/>}
                        </>
                    ) : null
                }
                <UserAccountMenu/>
            </StyledCustomizeYourExperienceTour>
        </RightControlsContainer>
    );
};

export default RightControls;
