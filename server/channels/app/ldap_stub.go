// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/request"
)

// ldapStub is a no-op implementation of einterfaces.LdapInterface.
// It prevents 501 errors when the enterprise LDAP module is missing by
// returning empty but valid data for LDAP-related requests.
type ldapStub struct {
}

func (l *ldapStub) DoLogin(rctx request.CTX, id string, password string) (*model.User, *model.AppError) {
	return nil, model.NewAppError("LdapStub.DoLogin", "ent.ldap.app_error", nil, "ldap interface was nil.", 501)
}

func (l *ldapStub) GetUser(rctx request.CTX, id string) (*model.User, *model.AppError) {
	return nil, nil
}

func (l *ldapStub) GetLDAPUserForMMUser(rctx request.CTX, mmUser *model.User) (*model.User, string, *model.AppError) {
	return nil, "", nil
}

func (l *ldapStub) GetUserAttributes(rctx request.CTX, id string, attributes []string) (map[string]string, *model.AppError) {
	return map[string]string{}, nil
}

func (l *ldapStub) CheckProviderAttributes(rctx request.CTX, LS *model.LdapSettings, ouser *model.User, patch *model.UserPatch) string {
	return ""
}

func (l *ldapStub) SwitchToLdap(rctx request.CTX, userID, ldapID, ldapPassword string) *model.AppError {
	return model.NewAppError("LdapStub.SwitchToLdap", "ent.ldap.app_error", nil, "ldap interface was nil.", 501)
}

func (l *ldapStub) StartSynchronizeJob(rctx request.CTX, waitForJobToFinish bool) (*model.Job, *model.AppError) {
	return nil, model.NewAppError("LdapStub.StartSynchronizeJob", "ent.ldap.app_error", nil, "ldap interface was nil.", 501)
}

func (l *ldapStub) GetAllLdapUsers(rctx request.CTX) ([]*model.User, *model.AppError) {
	return []*model.User{}, nil
}

func (l *ldapStub) MigrateIDAttribute(rctx request.CTX, toAttribute string) error {
	return nil
}

func (l *ldapStub) GetGroup(rctx request.CTX, groupUID string) (*model.Group, *model.AppError) {
	return nil, nil
}

func (l *ldapStub) GetAllGroupsPage(rctx request.CTX, page int, perPage int, opts model.LdapGroupSearchOpts) ([]*model.Group, int, *model.AppError) {
	return []*model.Group{}, 0, nil
}

func (l *ldapStub) FirstLoginSync(rctx request.CTX, user *model.User) *model.AppError {
	return nil
}

func (l *ldapStub) UpdateProfilePictureIfNecessary(rctx request.CTX, user model.User, session model.Session) {
}
