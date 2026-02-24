// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {MarketplaceApp, MarketplacePlugin} from '@workspace/types/marketplace';

export function isPlugin(item: MarketplacePlugin | MarketplaceApp): item is MarketplacePlugin {
    return (item as MarketplacePlugin).manifest.id !== undefined;
}

export function getName(item: MarketplacePlugin | MarketplaceApp): string {
    if (isPlugin(item)) {
        return item.manifest.name;
    }
    return item.manifest.display_name;
}
