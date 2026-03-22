// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

//go:build enterprise

// This file is needed to ensure the enterprise code get complied
// when running tests. See https://sofa.atlassian.net/browse/MM-54929
// for more details.

package commands

import (
	// Enterprise Deps
	_ "github.com/elastic/go-elasticsearch/v8"
	_ "github.com/gorilla/handlers"
	_ "github.com/hako/durafmt"
	_ "github.com/hashicorp/memberlist"
	_ "github.com/sofa/gosaml2"
	_ "github.com/sofa/ldap"
	_ "github.com/marwan2023nn-coder/sofa/server/v8/channels/utils/testutils"
	_ "github.com/marwan2023nn-coder/sofa/server/v8/enterprise"
	_ "github.com/sofa/rsc/qr"
	_ "github.com/prometheus/client_golang/prometheus"
	_ "github.com/prometheus/client_golang/prometheus/collectors"
	_ "github.com/prometheus/client_golang/prometheus/promhttp"
	_ "github.com/tylerb/graceful"
)
