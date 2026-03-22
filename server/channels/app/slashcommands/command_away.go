// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package slashcommands

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/i18n"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/request"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/app"
)

type AwayProvider struct {
}

const (
	CmdAway = "away"
)

func init() {
	app.RegisterCommandProvider(&AwayProvider{})
}

func (*AwayProvider) GetTrigger() string {
	return CmdAway
}

func (*AwayProvider) GetCommand(a *app.App, T i18n.TranslateFunc) *model.Command {
	return &model.Command{
		Trigger:          CmdAway,
		AutoComplete:     true,
		AutoCompleteDesc: T("api.command_away.desc"),
		DisplayName:      T("api.command_away.name"),
	}
}

func (*AwayProvider) DoCommand(a *app.App, rctx request.CTX, args *model.CommandArgs, message string) *model.CommandResponse {
	if !a.HasProfileEditPermission(rctx, args.UserId) {
		return &model.CommandResponse{ResponseType: model.CommandResponseTypeEphemeral, Text: args.T("api.user.update_user.perm_error")}
	}

	a.SetStatusAwayIfNeeded(args.UserId, true)

	return &model.CommandResponse{ResponseType: model.CommandResponseTypeEphemeral, Text: args.T("api.command_away.success")}
}
