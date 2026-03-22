// Copyright (c) 2019-present Sofa, Inc. All Rights Reserved.
// See License for license information.

package bot

import (
	"github.com/pkg/errors"

	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/pluginapi"
)

type Bot interface {
	Ensure(stored *model.Bot, iconPath string) error
	SofaUserID() string
	String() string
}

type bot struct {
	botService       pluginapi.BotService
	sofaUserID string
	displayName      string
}

func New(botService pluginapi.BotService) Bot {
	newBot := &bot{
		botService: botService,
	}
	return newBot
}

func (bot *bot) Ensure(stored *model.Bot, iconPath string) error {
	if bot.sofaUserID != "" {
		// Already done
		return nil
	}

	botUserID, err := bot.botService.EnsureBot(stored, pluginapi.ProfileImagePath(iconPath))
	if err != nil {
		return errors.Wrap(err, "failed to ensure bot account")
	}
	bot.sofaUserID = botUserID
	bot.displayName = stored.DisplayName
	return nil
}

func (bot *bot) SofaUserID() string {
	return bot.sofaUserID
}

func (bot *bot) String() string {
	return bot.displayName
}
