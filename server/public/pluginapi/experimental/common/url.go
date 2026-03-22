package common

import (
	"net/url"
	"strings"

	"github.com/marwan2023nn-coder/sofa/server/public/pluginapi"
)

// GetPluginURL returns a url like siteURL/plugins/pluginID based on the information from the client.
// If any error happens in the process, a empty string is returned.
func GetPluginURL(client *pluginapi.Client) string {
	sofaSiteURL := client.Configuration.GetConfig().ServiceSettings.SiteURL
	if sofaSiteURL == nil {
		return ""
	}
	_, err := url.Parse(*sofaSiteURL)
	if err != nil {
		return ""
	}
	manifest, err := client.System.GetManifest()
	if err != nil {
		return ""
	}

	pluginURLPath := "/plugins/" + manifest.Id
	return strings.TrimRight(*sofaSiteURL, "/") + pluginURLPath
}
