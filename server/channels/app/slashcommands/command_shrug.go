// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package slashcommands

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/i18n"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/request"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/app"
)

type ShrugProvider struct {
}

const (
	CmdShrug = "shrug"
)

func init() {
	app.RegisterCommandProvider(&ShrugProvider{})
}

func (*ShrugProvider) GetTrigger() string {
	return CmdShrug
}

func (*ShrugProvider) GetCommand(a *app.App, T i18n.TranslateFunc) *model.Command {
	return &model.Command{
		Trigger:          CmdShrug,
		AutoComplete:     true,
		AutoCompleteDesc: T("api.command_shrug.desc"),
		AutoCompleteHint: T("api.command_shrug.hint"),
		DisplayName:      T("api.command_shrug.name"),
	}
}

func (*ShrugProvider) DoCommand(a *app.App, rctx request.CTX, args *model.CommandArgs, message string) *model.CommandResponse {
	rmsg := `¯\\\_(ツ)\_/¯`
	if message != "" {
		rmsg = message + " " + rmsg
	}

	return &model.CommandResponse{ResponseType: model.CommandResponseTypeInChannel, Text: rmsg}
}
