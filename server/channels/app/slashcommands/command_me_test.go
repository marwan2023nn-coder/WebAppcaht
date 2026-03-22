// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package slashcommands

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/marwan2023nn-coder/sofa/server/public/model"
)

func TestMeProviderDoCommand(t *testing.T) {
	th := setup(t)

	mp := MeProvider{}

	msg := "hello"

	resp := mp.DoCommand(th.App, th.Context, &model.CommandArgs{}, msg)

	assert.Equal(t, model.CommandResponseTypeInChannel, resp.ResponseType)
	assert.Equal(t, model.PostTypeMe, resp.Type)
	assert.Equal(t, "*"+msg+"*", resp.Text)
}
