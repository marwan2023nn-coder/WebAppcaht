// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See License.txt for license information.

package main

import (
	"os"

	"github.com/marwan2023nn-coder/sofa/tools/mmgotool/commands"
)

func main() {
	if err := commands.Run(os.Args[1:]); err != nil {
		os.Exit(1)
	}
}
