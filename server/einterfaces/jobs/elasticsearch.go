// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package jobs

import (
	"github.com/marwan2023nn-coder/sofa/server/public/model"
)

type ElasticsearchIndexerInterface interface {
	MakeWorker() model.Worker
}

type ElasticsearchAggregatorInterface interface {
	MakeWorker() model.Worker
	MakeScheduler() Scheduler
}
