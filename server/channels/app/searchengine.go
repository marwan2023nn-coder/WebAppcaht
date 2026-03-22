// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"net/http"

	"github.com/marwan2023nn-coder/sofa/server/public/model"
	"github.com/marwan2023nn-coder/sofa/server/public/shared/request"
	"github.com/marwan2023nn-coder/sofa/server/v8/platform/services/searchengine"
)

func (a *App) TestElasticsearch(rctx request.CTX, cfg *model.Config) *model.AppError {
	if *cfg.ElasticsearchSettings.Password == model.FakeSetting {
		if *cfg.ElasticsearchSettings.ConnectionURL == *a.Config().ElasticsearchSettings.ConnectionURL && *cfg.ElasticsearchSettings.Username == *a.Config().ElasticsearchSettings.Username {
			*cfg.ElasticsearchSettings.Password = *a.Config().ElasticsearchSettings.Password
		} else {
			return model.NewAppError("TestElasticsearch", "ent.elasticsearch.test_config.reenter_password", nil, "", http.StatusBadRequest)
		}
	}

	seI := a.SearchEngine().ElasticsearchEngine
	if seI == nil {
		return nil
	}
	if err := seI.TestConfig(rctx, cfg); err != nil {
		return err
	}

	return nil
}

func (a *App) SetSearchEngine(se *searchengine.Broker) {
	a.ch.srv.platform.SearchEngine = se
}

func (a *App) PurgeElasticsearchIndexes(rctx request.CTX, indexes []string) *model.AppError {
	engine := a.SearchEngine().ElasticsearchEngine
	if engine == nil {
		return nil
	}

	var appErr *model.AppError
	if len(indexes) > 0 {
		appErr = engine.PurgeIndexList(rctx, indexes)
	} else {
		appErr = engine.PurgeIndexes(rctx)
	}

	return appErr
}

func (a *App) ActiveSearchBackend() string {
	return a.ch.srv.platform.SearchEngine.ActiveEngine()
}
