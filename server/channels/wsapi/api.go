// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package wsapi

import (
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/app"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/app/platform"
)

type API struct {
	App    *app.App
	Router *platform.WebSocketRouter
}

func Init(s *app.Server) {
	a := app.New(app.ServerConnector(s.Channels()))
	router := s.Platform().WebSocketRouter
	api := &API{
		App:    a,
		Router: router,
	}

	api.InitUser()
	api.InitSystem()
	api.InitStatus()
}
