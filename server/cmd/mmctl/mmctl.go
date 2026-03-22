// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package main

import (
	"os"

	_ "github.com/golang/mock/mockgen/model"

	"github.com/marwan2023nn-coder/sofa/server/v8/cmd/mmctl/commands"
)

func main() {
	if err := commands.Run(os.Args[1:]); err != nil {
		os.Exit(1)
	}
}
