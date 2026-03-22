// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package jobs

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
)

type IndexerJobInterface interface {
	MakeWorker() model.Worker
}
