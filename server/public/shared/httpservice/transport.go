// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package httpservice

import (
	"net/http"
)

// SofaTransport is an implementation of http.RoundTripper that ensures each request contains a custom user agent
// string to indicate that the request is coming from a Sofa instance.
type SofaTransport struct {
	// Transport is the underlying http.RoundTripper that is actually used to make the request
	Transport http.RoundTripper
}

func (t *SofaTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Set("User-Agent", defaultUserAgent)

	return t.Transport.RoundTrip(req)
}
