// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package slashcommands

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/i18n"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/app"
)

type OpenProvider struct {
	JoinProvider
}

const (
	CmdOpen = "open"
)

func init() {
	app.RegisterCommandProvider(&OpenProvider{})
}

func (open *OpenProvider) GetTrigger() string {
	return CmdOpen
}

func (open *OpenProvider) GetCommand(a *app.App, T i18n.TranslateFunc) *model.Command {
	cmd := open.JoinProvider.GetCommand(a, T)
	cmd.Trigger = CmdOpen
	cmd.DisplayName = T("api.command_open.name")
	return cmd
}
