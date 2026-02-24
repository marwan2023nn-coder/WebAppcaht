// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {getAppBarPluginComponents} from 'selectors/plugins';
import {useCurrentProduct, useCurrentProductId, inScope} from 'utils/products';

import AppBarPluginComponent, {isAppBarComponent} from './app_bar_plugin_component';

export default function VideoIcon() {
    const appBarPluginComponents = useSelector(getAppBarPluginComponents);
    const currentProduct = useCurrentProduct();
    const currentProductId = useCurrentProductId();

    const jitsiComponents = appBarPluginComponents.filter(({pluginId}) => pluginId === 'jitsi');

    if (!jitsiComponents || jitsiComponents.length === 0) {
        return null;
    }

    const items = jitsiComponents.map((x) => {
        if (!x) {
            return null;
        }

        if (!isAppBarComponent(x)) {
            return null;
        }

        const supportedProductIds = 'supportedProductIds' in x ? x.supportedProductIds : undefined;
        if (!inScope(supportedProductIds ?? null, currentProductId, currentProduct?.pluginId)) {
            return null;
        }

        return (
            <AppBarPluginComponent
                key={x.id}
                component={x}
                tooltipIsVertical={true}
            />
        );
    });

    return (
        <>
            {items}
        </>
    );
}
