// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"testing"
	"github.com/stretchr/testify/require"
)

func TestUnicode_ContainsCJK(t *testing.T) {
	t.Run("no CJK", func(t *testing.T) {
		require.False(t, ContainsCJK("Hello World"))
		require.False(t, ContainsCJK("1234567890"))
		require.False(t, ContainsCJK("!@#$%^&*()"))
		require.False(t, ContainsCJK("مرحبا بك")) // Arabic
	})

	t.Run("with Han", func(t *testing.T) {
		require.True(t, ContainsCJK("Hello 世界"))
	})

	t.Run("with Hiragana", func(t *testing.T) {
		require.True(t, ContainsCJK("こんにちは"))
	})

	t.Run("with Katakana", func(t *testing.T) {
		require.True(t, ContainsCJK("カタカナ"))
	})

	t.Run("with Hangul", func(t *testing.T) {
		require.True(t, ContainsCJK("안녕하세요"))
	})
}
