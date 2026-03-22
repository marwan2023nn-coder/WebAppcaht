package pluginapi_test

import (
	"github.com/marwan2023nn-coder/sofa/server/public/pluginapi"

	"github.com/marwan2023nn-coder/sofa/server/public/plugin"
)

type Plugin struct {
	plugin.SofaPlugin
	client *pluginapi.Client
}

func (p *Plugin) OnActivate() error {
	p.client = pluginapi.NewClient(p.API, p.Driver)

	return nil
}

func Example() {
}
