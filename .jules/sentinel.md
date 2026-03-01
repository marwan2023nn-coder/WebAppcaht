## 2025-05-14 - License Feature Nil Pointer Dereference
**Vulnerability:** Potential server panics (DoS) due to missing nil checks on `license.Features` before accessing specific feature pointers like `LDAP`.
**Learning:** While the top-level `license` object was checked for nil, its nested `Features` pointer (common in the Mattermost/Sofa model) could also be nil in certain configurations or license states.
**Prevention:** Always verify both `license` and `license.Features` are non-nil, and use `model.SafeDereference` for the actual feature pointers to handle optional or omitted fields safely.

## 2025-05-15 - Insecure Default HTTP Client Usage
**Vulnerability:** Direct use of Go's default `http.Get` for outgoing requests (e.g., `TestSiteURL`, `GetLatestVersion`, `GetPreviewModalData`), which lacks default timeouts and SSRF protection.
**Learning:** Standard library functions like `http.Get` use a default client without timeouts or connection restrictions, potentially leading to resource exhaustion or Server-Side Request Forgery (SSRF) if URLs are influenced by users or external systems.
**Prevention:** Mandatory use of the application's `HTTPService` (via `a.HTTPService()` or `s.HTTPService()`) to instantiate HTTP clients. Use `MakeClient(false)` for requests to untrusted or external URLs to enforce SSRF protection and standardized timeouts.
