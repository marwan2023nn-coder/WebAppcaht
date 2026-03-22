// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

//go:build enterprise

package enterprise

import (
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/account_migration"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/cluster"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/compliance"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/data_retention"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/ldap"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/cloud"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/notification"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/oauth/google"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/oauth/office365"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/saml"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/oauth/openid"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/license"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/ip_filtering"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/outgoing_oauth_connections"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/access_control"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/message_export"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/message_export/actiance_export"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/push_proxy"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/message_export/csv_export"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/message_export/global_relay_export"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/autotranslation"
	// Needed to ensure the init() method in the EE gets run
	_ "github.com/sofa/enterprise/intune"
)
