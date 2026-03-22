// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package platform

import (
	"time"

	"github.com/marwan2023nn-coder/sofa/server/v8/platform/services/cache"
)

const LinkCacheSize = 10000
const LinkCacheDuration = 1 * time.Hour

var linkCache = cache.NewLRU(&cache.CacheOptions{
	Size: LinkCacheSize,
})

func PurgeLinkCache() error {
	return linkCache.Purge()
}

func LinkCache() cache.Cache {
	return linkCache
}
