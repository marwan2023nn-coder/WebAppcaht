// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api4

import (
	"net/http"

	"github.com/marwan2023nn-coder/sofa/server/public/model"
)

func (api *API) InitPermissions() {
	api.BaseRoutes.Permissions.Handle("/ancillary", api.APISessionRequired(appendAncillaryPermissionsPost)).Methods(http.MethodPost)
}

func appendAncillaryPermissionsPost(c *Context, w http.ResponseWriter, r *http.Request) {
	permissions, err := model.NonSortedArrayFromJSON(r.Body)
	if err != nil || len(permissions) < 1 {
		c.Err = model.NewAppError("appendAncillaryPermissionsPost", model.PayloadParseError, nil, "", http.StatusBadRequest).Wrap(err)
		return
	}
	w.Write(model.ToJSON(model.AddAncillaryPermissions(permissions)))
}
