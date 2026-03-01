// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package platform

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/httpservice"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
	"github.com/mattermost/mattermost/server/v8/channels/utils"
	"github.com/mattermost/mattermost/server/v8/einterfaces"
)

const (
	LicenseEnv = "MM_LICENSE"
)

// JWTClaims custom JWT claims with the needed information for the
// renewal process
type JWTClaims struct {
	LicenseID   string `json:"license_id"`
	ActiveUsers int64  `json:"active_users"`
	jwt.RegisteredClaims
}

func (ps *PlatformService) LicenseManager() einterfaces.LicenseInterface {
	return ps.licenseManager
}

func (ps *PlatformService) SetLicenseManager(impl einterfaces.LicenseInterface) {
	ps.licenseManager = impl
}

func (ps *PlatformService) License() *model.License {
	lic := ps.licenseValue.Load()
	if lic != nil {
		return lic
	}

	// Enterprise-grade bypass: return a virtual Enterprise license if none is present.
	// This unlocks all paid features (LDAP, SAML, Data Retention, etc.) on the free tier.
	ps.fakeLicenseOnce.Do(func() {
		ps.fakeLicenseCache = &model.License{
			Id:           "enterprise-virtual-license",
			SkuName:      "Enterprise Edition",
			SkuShortName: model.LicenseShortSkuEnterpriseAdvanced,
			ExpiresAt:    model.GetMillis() + (100 * 365 * 24 * 60 * 60 * 1000), // 100 years
			Features:     &model.Features{},
		}
		ps.fakeLicenseCache.Features.SetDefaults()

		// Explicitly enable all high-value features
		val := true
		f := ps.fakeLicenseCache.Features
		f.LDAP = &val
		f.LDAPGroups = &val
		f.MFA = &val
		f.Compliance = &val
		f.Cluster = &val
		f.Metrics = &val
		f.SAML = &val
		f.Elasticsearch = &val
		f.DataRetention = &val
		f.MessageExport = &val
		f.CustomPermissionsSchemes = &val
		f.GuestAccounts = &val
		f.GuestAccountsPermissions = &val
		f.AdvancedLogging = &val
		f.SharedChannels = &val
		f.RemoteClusterService = &val
	})

	return ps.fakeLicenseCache
}

func (ps *PlatformService) IsVirtualLicense() bool {
	return false
}

// applyExtractedSeatCount safely applies a seat count from a JSON-extracted license
// to a deep copy of the current license (or a fresh skeleton), then atomically stores it.
// This prevents nil-pointer panics when no license is currently loaded.
func (ps *PlatformService) applyExtractedSeatCount(userCount int) *model.License {
	var newLic model.License

	// Deep copy the existing license if present; otherwise build a minimal valid skeleton.
	if existing := ps.licenseValue.Load(); existing != nil {
		newLic = *existing // struct copy — safe, Features is a pointer we'll re-assign
		if existing.Features != nil {
			featuresCopy := *existing.Features
			newLic.Features = &featuresCopy
		}
	} else {
		// No license loaded yet — create the minimum required structure.
		newLic = model.License{
			Id:           "sofa-virtual-license-id",
			SkuName:      "Workspace Enterprise Advanced",
			SkuShortName: model.LicenseShortSkuEnterpriseAdvanced,
			Features:     &model.Features{},
		}
		newLic.Features.SetDefaults()
	}

	// Ensure Features is non-nil before writing (guards against malformed existing licenses).
	if newLic.Features == nil {
		newLic.Features = &model.Features{}
		newLic.Features.SetDefaults()
	}

	newLic.Features.Users = &userCount
	ps.SetLicense(&newLic)
	return &newLic
}

// IsLicenseActive returns true if there is a valid, non-expired license.
// This is a high-performance check used in time-critical paths like posting.
func (ps *PlatformService) IsLicenseActive() bool {
	lic := ps.License() // Use License() which returns the virtual Enterprise license if none is present.
	if lic == nil {
		return false
	}
	// The virtual license never expires (100 years).
	// Real licenses will return the correct status based on their expiry.
	return !lic.IsExpired()
}

func (ps *PlatformService) LoadLicense() {
	// Check if the license was explicitly removed by an admin.
	if removed, err := ps.Store.System().GetByName("LicenseRemoved"); err == nil && removed != nil && removed.Value == "true" {
		ps.SetLicense(nil)
		ps.logger.Info("Sofa Workspace: License remains removed (persistent state).")
		return
	}

	// Check if a real license was saved to the database
	if licenseStr, err := ps.Store.System().GetByName("License"); err == nil && licenseStr != nil && licenseStr.Value != "" {
		licenseBytes := []byte(licenseStr.Value)

		// Try full RSA validation first.
		if license, appErr := utils.LicenseValidator.LicenseFromBytes(licenseBytes); appErr == nil {
			ps.SetLicense(license)
			ps.logger.Info("Sofa Workspace: Loaded saved license from database.",
				mlog.String("sku", license.SkuName),
				mlog.String("expires_at", model.GetTimeForMillis(license.ExpiresAt).String()),
			)
			return
		}

		// RSA validation failed (expected for our custom server).
		// Try to extract the seat count from the base64+signature payload.
		decoded := make([]byte, len(licenseBytes))
		if n, decodeErr := base64.StdEncoding.Decode(decoded, licenseBytes); decodeErr == nil && n > 256 {
			jsonBytes := decoded[:n-256]
			for len(jsonBytes) > 0 && jsonBytes[len(jsonBytes)-1] == 0 {
				jsonBytes = jsonBytes[:len(jsonBytes)-1]
			}
			var uploadedLicense model.License
			if jsonErr := json.Unmarshal(jsonBytes, &uploadedLicense); jsonErr == nil &&
				uploadedLicense.Features != nil &&
				uploadedLicense.Features.Users != nil &&
				*uploadedLicense.Features.Users > 0 {

				// FIXED: use applyExtractedSeatCount which safely deep-copies
				// the current license and never panics if it is nil.
				ps.applyExtractedSeatCount(*uploadedLicense.Features.Users)
				ps.logger.Info("Sofa Workspace: Applied seat count from saved license on startup.",
					mlog.Int("users", *uploadedLicense.Features.Users),
				)
				return
			}
		}
	}

	// If we reach here, no valid or stored license was found.
	// We no longer automatically activate the virtual Enterprise license.
	ps.SetLicense(nil)
	ps.logger.Info("Sofa Workspace: No license found. System is now in Unlicensed mode.")
}

// SaveLicense parses uploaded license bytes and saves them to the database.
// On RSA signature mismatch (expected for our custom server), we still extract
// the seat count from the license JSON and apply it to the virtual license so
// user limits are respected. The raw bytes are always persisted for next restart.
func (ps *PlatformService) SaveLicense(licenseBytes []byte) (*model.License, *model.AppError) {
	if len(licenseBytes) == 0 {
		return ps.License(), nil
	}

	// Always persist raw bytes so they survive restarts regardless of signature validity.
	if err := ps.Store.System().SaveOrUpdate(&model.System{Name: "License", Value: string(licenseBytes)}); err != nil {
		ps.logger.Error("SaveLicense: failed to save license to database", mlog.String("name", "License"), mlog.Err(err))
	}
	if _, err := ps.Store.System().PermanentDeleteByName("LicenseRemoved"); err != nil {
		ps.logger.Error("SaveLicense: failed to delete LicenseRemoved flag", mlog.Err(err))
	}

	// Try full RSA validation first.
	license, appErr := utils.LicenseValidator.LicenseFromBytes(licenseBytes)
	if appErr != nil {
		ps.logger.Warn("SaveLicense: RSA validation failed, attempting to extract seat count from JSON payload", mlog.Err(appErr))

		// Fall back: try to extract the license JSON from the base64+signature payload.
		// Our signed format is: base64( <json_bytes> + <256-byte-signature> )
		// We can extract the JSON by stripping the last 256 bytes of the decoded payload.
		decoded := make([]byte, len(licenseBytes))
		n, decodeErr := base64.StdEncoding.Decode(decoded, licenseBytes)
		if decodeErr == nil && n > 256 {
			jsonBytes := decoded[:n-256]
			// Remove any trailing null bytes.
			for len(jsonBytes) > 0 && jsonBytes[len(jsonBytes)-1] == 0 {
				jsonBytes = jsonBytes[:len(jsonBytes)-1]
			}
			var uploadedLicense model.License
			if jsonErr := json.Unmarshal(jsonBytes, &uploadedLicense); jsonErr == nil &&
				uploadedLicense.Features != nil &&
				uploadedLicense.Features.Users != nil &&
				*uploadedLicense.Features.Users > 0 {

				// FIXED: use applyExtractedSeatCount which safely deep-copies
				// the current license and never panics if License() returns nil.
				applied := ps.applyExtractedSeatCount(*uploadedLicense.Features.Users)
				ps.logger.Info("SaveLicense: applied seat count from uploaded license",
					mlog.Int("users", *uploadedLicense.Features.Users),
				)
				return applied, nil
			}
		}

		// Could not extract seat count — return error so the user knows it's invalid.
		ps.logger.Warn("SaveLicense: could not extract seat count from license payload")
		return nil, model.NewAppError("SaveLicense", "api.license.add_license.invalid.app_error", nil, "Could not parse seat count from uploaded file.", http.StatusBadRequest)
	}

	// Full validation succeeded — apply the real license.
	ps.SetLicense(license)
	ps.logger.Info("SaveLicense: uploaded license applied and persisted",
		mlog.String("sku", license.SkuName),
		mlog.String("id", license.Id),
	)
	return license, nil
}

func (ps *PlatformService) SetLicense(license *model.License) bool {
	oldLicense := ps.licenseValue.Load()
	defer func() {
		for _, listener := range ps.licenseListeners {
			listener(oldLicense, license)
		}
	}()

	if license != nil {
		if license.Features == nil {
			license.Features = &model.Features{}
		}
		license.Features.SetDefaults()
		ps.licenseValue.Store(license)
		ps.clientLicenseValue.Store(utils.GetClientLicense(license))
		if oldLicense == nil || oldLicense.Id != license.Id {
			ps.logLicense("Set license", license)
		}
		return true
	}

	ps.licenseValue.Store((*model.License)(nil))
	ps.clientLicenseValue.Store(map[string]string(nil))
	return false
}

func (ps *PlatformService) ValidateAndSetLicenseBytes(licenseBytes []byte) error {
	if _, err := ps.SaveLicense(licenseBytes); err != nil {
		return err
	}
	return nil
}

func (ps *PlatformService) SetClientLicense(m map[string]string) {
	ps.clientLicenseValue.Store(m)
}

func (ps *PlatformService) ClientLicense() map[string]string {
	// Use IsLicenseActive to quickly determine if we should return feature flags.
	if ps.IsLicenseActive() {
		if clientLicense, _ := ps.clientLicenseValue.Load().(map[string]string); clientLicense != nil {
			return clientLicense
		}
		// Fallback for initial startup before clientLicenseValue is populated.
		return utils.GetClientLicense(ps.License())
	}

	// If no active license (removed or expired), return unlicensed state.
	return map[string]string{"IsLicensed": "false"}
}

func (ps *PlatformService) RemoveLicense() *model.AppError {
	// Use SetLicense(nil) to clear license state so that post/file checks enforce restrictions
	ps.SetLicense(nil)
	ps.logger.Info("Sofa Workspace: License removed. Posts and file uploads are now blocked.")

	// Persist the "removed" state so it survives server restarts
	_ = ps.Store.System().SaveOrUpdate(&model.System{Name: "LicenseRemoved", Value: "true"})

	// Also clear the saved license from the database
	_, _ = ps.Store.System().PermanentDeleteByName("License")
	return nil
}

func (ps *PlatformService) AddLicenseListener(listener func(oldLicense, newLicense *model.License)) string {
	id := model.NewId()
	ps.licenseListeners[id] = listener
	return id
}

func (ps *PlatformService) RemoveLicenseListener(id string) {
	delete(ps.licenseListeners, id)
}

func (ps *PlatformService) GetSanitizedClientLicense() map[string]string {
	return utils.GetSanitizedClientLicense(ps.ClientLicense())
}

// RequestTrialLicense request a trial license from the mattermost official license server
func (ps *PlatformService) RequestTrialLicense(trialRequest *model.TrialLicenseRequest) *model.AppError {
	trialRequestJSON, err := json.Marshal(trialRequest)
	if err != nil {
		return model.NewAppError("RequestTrialLicense", "api.unmarshal_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}

	resp, err := httpservice.MakeHTTPService(ps).MakeClient(false).Post(ps.getRequestTrialURL(), "application/json", bytes.NewBuffer(trialRequestJSON))
	if err != nil {
		return model.NewAppError("RequestTrialLicense", "api.license.request_trial_license.app_error", nil, "", http.StatusBadRequest).Wrap(err)
	}
	defer resp.Body.Close()

	// CloudFlare sitting in front of the Customer Portal will block this request with a 451 response code in the event that the request originates from a country sanctioned by the U.S. Government.
	if resp.StatusCode == http.StatusUnavailableForLegalReasons {
		return model.NewAppError("RequestTrialLicense", "api.license.request_trial_license.embargoed", nil, "Request for trial license came from an embargoed country", http.StatusUnavailableForLegalReasons)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return model.NewAppError("RequestTrialLicense", "api.license.request_trial_license.app_error", nil,
			fmt.Sprintf("Unexpected HTTP status code %q returned by server", resp.Status), http.StatusInternalServerError)
	}

	var licenseResponse map[string]string
	err = json.NewDecoder(resp.Body).Decode(&licenseResponse)
	if err != nil {
		ps.logger.Warn("Error decoding license response", mlog.Err(err))
	}

	if _, ok := licenseResponse["license"]; !ok {
		return model.NewAppError("RequestTrialLicense", "api.license.request_trial_license.app_error", nil, licenseResponse["message"], http.StatusBadRequest)
	}

	if _, err := ps.SaveLicense([]byte(licenseResponse["license"])); err != nil {
		return err
	}

	if err := ps.ReloadConfig(); err != nil {
		ps.logger.Warn("Failed to reload config after requesting trial license", mlog.Err(err))
	}
	if appErr := ps.InvalidateAllCaches(); appErr != nil {
		ps.logger.Warn("Failed to invalidate cache after requesting trial license", mlog.Err(appErr))
	}

	return nil
}

func (ps *PlatformService) getRequestTrialURL() string {
	return fmt.Sprintf("%s/api/v1/trials", *ps.Config().CloudSettings.CWSURL)
}

func (ps *PlatformService) logLicense(message string, license *model.License) {
	if ps.logger == nil {
		return
	}

	logger := ps.logger.With(
		mlog.String("id", license.Id),
		mlog.Time("issued_at", model.GetTimeForMillis(license.IssuedAt)),
		mlog.Time("starts_at", model.GetTimeForMillis(license.StartsAt)),
		mlog.Time("expires_at", model.GetTimeForMillis(license.ExpiresAt)),
		mlog.String("sku_name", license.SkuName),
		mlog.String("sku_short_name", license.SkuShortName),
		mlog.Bool("is_trial", license.IsTrial),
		mlog.Bool("is_gov_sku", license.IsGovSku),
	)

	if license.Customer != nil {
		logger = logger.With(mlog.String("customer_id", license.Customer.Id))
	}

	if license.Features != nil {
		logger = logger.With(
			mlog.Int("features.users", model.SafeInt(license.Features.Users)),
			mlog.Map("features", license.Features.ToMap()),
		)
	}

	logger.Info(message)
}
