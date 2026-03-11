// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"net/http"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
)

const (
	maxUsersLimit     = 200
	maxUsersHardLimit = 250
)

func (a *App) GetServerLimits() (*model.ServerLimits, *model.AppError) {
	limits := &model.ServerLimits{}
	license := a.License()

	if license == nil && maxUsersLimit > 0 {
		// Enforce hard-coded limits for unlicensed servers (no grace period).
		limits.MaxUsersLimit = maxUsersLimit
		limits.MaxUsersHardLimit = maxUsersHardLimit
	} else if license != nil {
		sku := license.SkuName
		usersFeat := 0
		if license.Features != nil {
			usersFeat = model.SafeDereference(license.Features.Users)
		}

		a.Log().Debug("GetServerLimits: license found",
			mlog.String("sku", sku),
			mlog.Int("features_users", usersFeat),
		)

		if usersFeat > 0 {
			// Enforce license seat count regardless of IsSeatCountEnforced flag.
			licenseUserLimit := int64(usersFeat)
			limits.MaxUsersLimit = licenseUserLimit
			limits.MaxUsersHardLimit = licenseUserLimit
		}
	}

	// Check if license has post history limits and get the calculated timestamp
	if license != nil && license.Limits != nil && license.Limits.PostHistory > 0 {
		limits.PostHistoryLimit = license.Limits.PostHistory
		// Get the calculated timestamp of the last accessible post
		lastAccessibleTime, appErr := a.GetLastAccessiblePostTime()
		if appErr != nil {
			return nil, appErr
		}
		limits.LastAccessiblePostTime = lastAccessibleTime
	}

	activeUserCount, appErr := a.Srv().Store().User().Count(model.UserCountOptions{})
	if appErr != nil {
		return nil, model.NewAppError("GetServerLimits", "app.limits.get_app_limits.user_count.store_error", nil, "", http.StatusInternalServerError).Wrap(appErr)
	}
	limits.ActiveUserCount = activeUserCount

	return limits, nil
}
func (a *App) GetPostHistoryLimit() int64 {
	license := a.License()
	if license == nil || license.Limits == nil || license.Limits.PostHistory == 0 {
		// No limits applicable
		return 0
	}

	return license.Limits.PostHistory
}

func (a *App) isAtUserLimit() (bool, *model.AppError) {
	userLimits, appErr := a.GetServerLimits()
	if appErr != nil {
		return false, appErr
	}

	// If no limit is configured, allow creation.
	if userLimits.MaxUsersLimit == 0 {
		return false, nil
	}

	atLimit := userLimits.ActiveUserCount >= userLimits.MaxUsersLimit
	if atLimit {
		a.Log().Info("Seat limit reached or exceeded",
			mlog.Int("active_users", userLimits.ActiveUserCount),
			mlog.Int("max_users", userLimits.MaxUsersLimit),
		)
	}

	// Block exactly at the licensed seat count — no grace buffer.
	return atLimit, nil
}
