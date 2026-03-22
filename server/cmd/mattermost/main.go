// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package main

import (
	"os"

	"github.com/marwan2023nn-coder/sofa/server/v8/cmd/sofa/commands"
	// Import and register app layer slash commands
	_ "github.com/marwan2023nn-coder/sofa/server/v8/channels/app/slashcommands"
	// Plugins
	_ "github.com/marwan2023nn-coder/sofa/server/v8/channels/app/oauthproviders/gitlab"
	_ "github.com/marwan2023nn-coder/sofa/server/v8/channels/app/oauthproviders/openid"

	// Enterprise Imports
	_ "github.com/marwan2023nn-coder/sofa/server/v8/enterprise"
)

func main() {
	if err := commands.Run(os.Args[1:]); err != nil {
		os.Exit(1)
	}
}
