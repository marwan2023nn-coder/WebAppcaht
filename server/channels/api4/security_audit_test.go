// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api4

import (
	"context"
	"testing"

	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/stretchr/testify/require"
)

func TestSecurityAuditUnauthorizedAccess(t *testing.T) {
	th := setupForSharedChannels(t).InitBasic(t)

	t.Run("SharedChannel: GetRemoteClusterInfo should fail for user not in any shared channel with that remote", func(t *testing.T) {
		// Create a remote cluster
		rc := &model.RemoteCluster{
			RemoteId:  model.NewId(),
			Name:      "Remote1",
			SiteURL:   "http://remote1.com",
			CreatorId: th.SystemAdminUser.Id,
		}
		_, appErr := th.App.AddRemoteCluster(rc)
		require.Nil(t, appErr)

		// Shared channel with User A (BasicUser)
		sc := &model.SharedChannel{
			ChannelId: th.BasicChannel.Id,
			TeamId:    th.BasicTeam.Id,
			Home:      true,
			ShareName: "shared_channel",
			CreatorId: th.BasicUser.Id,
			RemoteId:  rc.RemoteId,
		}
		_, err := th.App.ShareChannel(th.Context, sc)
		require.NoError(t, err)

		scr := &model.SharedChannelRemote{
			Id:                model.NewId(),
			ChannelId:         sc.ChannelId,
			CreatorId:         sc.CreatorId,
			IsInviteAccepted:  true,
			IsInviteConfirmed: true,
			RemoteId:          rc.RemoteId,
		}
		_, err = th.App.SaveSharedChannelRemote(scr)
		require.NoError(t, err)

		// Create User B who is NOT in BasicChannel
		userB := th.CreateUser(t)
		th.LinkUserToTeam(t, userB, th.BasicTeam)
		clientB := th.CreateClient()
		_, _, err = clientB.Login(context.Background(), userB.Email, userB.Password)
		require.NoError(t, err)

		// User B tries to get info about Remote1
		_, resp, err := clientB.GetRemoteClusterInfo(context.Background(), rc.RemoteId)
		require.Error(t, err)
		CheckNotFoundStatus(t, resp)
	})

	t.Run("SharedChannel: InviteRemoteToChannel requires ManageSecureConnections permission", func(t *testing.T) {
		newRC := &model.RemoteCluster{
			RemoteId:  model.NewId(),
			Name:      "Remote2",
			SiteURL:   "http://remote2.com",
			CreatorId: th.SystemAdminUser.Id,
		}
		_, appErr := th.App.AddRemoteCluster(newRC)
		require.Nil(t, appErr)

		// th.Client is logged in as BasicUser, who doesn't have the permission
		resp, err := th.Client.InviteRemoteClusterToChannel(context.Background(), newRC.RemoteId, th.BasicChannel.Id)
		require.Error(t, err)
		CheckForbiddenStatus(t, resp)
	})

	t.Run("AccessControl: CreateParentPolicy requires ManageSystem permission", func(t *testing.T) {
		th.App.UpdateConfig(func(cfg *model.Config) {
			cfg.AccessControlSettings.EnableAttributeBasedAccessControl = model.NewPointer(true)
		})
		ok := th.App.Srv().SetLicense(model.NewTestLicenseSKU(model.LicenseShortSkuEnterpriseAdvanced))
		require.True(t, ok)

		parentPolicy := &model.AccessControlPolicy{
			ID:      model.NewId(),
			Type:    model.AccessControlPolicyTypeParent,
			Version: model.AccessControlPolicyVersionV0_2,
			Rules: []model.AccessControlPolicyRule{
				{
					Expression: "true",
					Actions:    []string{"*"},
				},
			},
		}

		_, resp, err := th.Client.CreateAccessControlPolicy(context.Background(), parentPolicy)
		require.Error(t, err)
		CheckForbiddenStatus(t, resp)
	})
}
