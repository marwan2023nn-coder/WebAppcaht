// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
)

type SofaFeature string

const (
	PaidFeatureGuestAccounts                = SofaFeature("sofa.feature.guest_accounts")
	PaidFeatureCustomUsergroups             = SofaFeature("sofa.feature.custom_user_groups")
	PaidFeatureCreateMultipleTeams          = SofaFeature("sofa.feature.create_multiple_teams")
	PaidFeatureStartcall                    = SofaFeature("sofa.feature.start_call")
	PaidFeaturePlaybooksRetrospective       = SofaFeature("sofa.feature.playbooks_retro")
	PaidFeatureUnlimitedMessages            = SofaFeature("sofa.feature.unlimited_messages")
	PaidFeatureUnlimitedFileStorage         = SofaFeature("sofa.feature.unlimited_file_storage")
	PaidFeatureAllProfessionalfeatures      = SofaFeature("sofa.feature.all_professional")
	PaidFeatureAllEnterprisefeatures        = SofaFeature("sofa.feature.all_enterprise")
	UpgradeDowngradedWorkspace              = SofaFeature("sofa.feature.upgrade_downgraded_workspace")
	PluginFeature                           = SofaFeature("sofa.feature.plugin")
	PaidFeatureHighlightWithoutNotification = SofaFeature("sofa.feature.highlight_without_notification")
)

var validSKUs = map[string]struct{}{
	LicenseShortSkuProfessional: {},
	LicenseShortSkuEnterprise:   {},
}

// These are the features a non admin would typically ping an admin about
var paidFeatures = map[SofaFeature]struct{}{
	PaidFeatureGuestAccounts:                {},
	PaidFeatureCustomUsergroups:             {},
	PaidFeatureCreateMultipleTeams:          {},
	PaidFeatureStartcall:                    {},
	PaidFeaturePlaybooksRetrospective:       {},
	PaidFeatureUnlimitedMessages:            {},
	PaidFeatureUnlimitedFileStorage:         {},
	PaidFeatureAllProfessionalfeatures:      {},
	PaidFeatureAllEnterprisefeatures:        {},
	UpgradeDowngradedWorkspace:              {},
	PaidFeatureHighlightWithoutNotification: {},
}

type NotifyAdminToUpgradeRequest struct {
	TrialNotification bool              `json:"trial_notification"`
	RequiredPlan      string            `json:"required_plan"`
	RequiredFeature   SofaFeature `json:"required_feature"`
}

type NotifyAdminData struct {
	CreateAt        int64             `json:"create_at,omitempty"`
	UserId          string            `json:"user_id"`
	RequiredPlan    string            `json:"required_plan"`
	RequiredFeature SofaFeature `json:"required_feature"`
	Trial           bool              `json:"trial"`
	SentAt          sql.NullInt64     `json:"sent_at"`
}

func (nad *NotifyAdminData) IsValid() *AppError {
	if strings.HasPrefix(string(nad.RequiredFeature), string(PluginFeature)) {
		return nil
	}
	if _, planOk := validSKUs[nad.RequiredPlan]; !planOk {
		return NewAppError("NotifyAdmin.IsValid", fmt.Sprintf("Invalid plan, %s provided", nad.RequiredPlan), nil, "", http.StatusBadRequest)
	}

	if _, featureOk := paidFeatures[nad.RequiredFeature]; !featureOk {
		return NewAppError("NotifyAdmin.IsValid", fmt.Sprintf("Invalid feature, %s provided", nad.RequiredFeature), nil, "", http.StatusBadRequest)
	}

	return nil
}

func (nad *NotifyAdminData) PreSave() {
	nad.CreateAt = GetMillis()
}
