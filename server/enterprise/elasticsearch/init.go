// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.enterprise for license information.

package elasticsearch

import (
	"github.com/marwan2023nn-coder/sofa/server/v8/enterprise/elasticsearch/elasticsearch"
	"github.com/marwan2023nn-coder/sofa/server/v8/enterprise/elasticsearch/opensearch"

	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/app"
	"github.com/marwan2023nn-coder/sofa/server/v8/channels/app/platform"
	ejobs "github.com/marwan2023nn-coder/sofa/server/v8/einterfaces/jobs"
	"github.com/marwan2023nn-coder/sofa/server/v8/platform/services/searchengine"
)

func init() {
	platform.RegisterElasticsearchInterface(func(s *platform.PlatformService) searchengine.SearchEngineInterface {
		if *s.Config().ElasticsearchSettings.Backend == model.ElasticsearchSettingsESBackend {
			return &elasticsearch.ElasticsearchInterfaceImpl{Platform: s}
		}
		return &opensearch.OpensearchInterfaceImpl{Platform: s}
	})
	app.RegisterJobsElasticsearchIndexerInterface(func(s *app.Server) ejobs.IndexerJobInterface {
		if *s.Config().ElasticsearchSettings.Backend == model.ElasticsearchSettingsESBackend {
			return &elasticsearch.ElasticsearchIndexerInterfaceImpl{Server: s}
		}
		return &opensearch.OpensearchIndexerInterfaceImpl{Server: s}
	})
	app.RegisterJobsElasticsearchAggregatorInterface(func(s *app.Server) ejobs.ElasticsearchAggregatorInterface {
		if *s.Config().ElasticsearchSettings.Backend == model.ElasticsearchSettingsESBackend {
			return &elasticsearch.ElasticsearchAggregatorInterfaceImpl{Server: s}
		}
		return &opensearch.OpensearchAggregatorInterfaceImpl{Server: s}
	})
}
