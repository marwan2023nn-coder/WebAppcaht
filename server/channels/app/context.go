// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"github.com/marwan2023nn-coder/sofa/server/public/plugin"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/request"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/store/sqlstore"
)

// RequestContextWithMaster adds the context value that master DB should be selected for this request.
func RequestContextWithMaster(rctx request.CTX) request.CTX {
	return sqlstore.RequestContextWithMaster(rctx)
}

func pluginContext(rctx request.CTX) *plugin.Context {
	context := &plugin.Context{
		RequestId:      rctx.RequestId(),
		SessionId:      rctx.Session().Id,
		IPAddress:      rctx.IPAddress(),
		AcceptLanguage: rctx.AcceptLanguage(),
		UserAgent:      rctx.UserAgent(),
	}
	return context
}
