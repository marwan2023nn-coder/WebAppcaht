// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

import glyphMap, {ProductChannelsIcon} from '@workspace/compass-icons/components';

import {useCurrentProduct} from 'utils/products';

const ProductBrandingContainer = styled.div`
    display: flex;
    align-items: center;
    cursor: auto;
    > * + * {
        &:dir(ltr) {
            margin-left: 0;
            margin-right: 8px;
        }
        &:dir(rtl) {
            margin-right: 0;
            margin-left: 8px;
        }
    }
`;

const ProductBrandingHeading = styled.span`
    font-size: 1.6rem;
    line-height: 2;
    font-family: 'Effra_Trial_Bd';
    margin: 0;
    color: var(--sidebar-link-color);
`;

const ProductBranding = (): JSX.Element => {
    const intl = useIntl();
    const currentProduct = useCurrentProduct();
    const Icon = currentProduct?.switcherIcon ? glyphMap[currentProduct.switcherIcon] : ProductChannelsIcon;
    const headingText = currentProduct ? currentProduct.switcherText : intl.formatMessage({id: 'more_direct_channels.title', defaultMessage: 'Direct Messages'});

    return (
        <ProductBrandingContainer tabIndex={0}>
            <div style={{display: 'flex', alignItems: 'center', gap: '2px'}}>
                <Icon size={'1.9rem'}/>
                <ProductBrandingHeading>
                    {headingText}
                </ProductBrandingHeading>
            </div>
        </ProductBrandingContainer>
    );
};

export default ProductBranding;
