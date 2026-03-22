// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/app/platform"
)

// PopulateWebConnConfig checks if the connection id already exists in the hub,
// and if so, accordingly populates the other fields of the webconn.
func (a *App) PopulateWebConnConfig(s *model.Session, cfg *platform.WebConnConfig, seqVal string) (*platform.WebConnConfig, error) {
	return a.Srv().Platform().PopulateWebConnConfig(s, cfg, seqVal)
}
