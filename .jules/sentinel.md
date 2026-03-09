## 2025-05-14 - License Feature Nil Pointer Dereference
**Vulnerability:** Potential server panics (DoS) due to missing nil checks on `license.Features` before accessing specific feature pointers like `LDAP`.
**Learning:** While the top-level `license` object was checked for nil, its nested `Features` pointer (common in the Mattermost/Sofa model) could also be nil in certain configurations or license states.
**Prevention:** Always verify both `license` and `license.Features` are non-nil, and use `model.SafeDereference` for the actual feature pointers to handle optional or omitted fields safely.

## 2025-05-15 - Insecure Default HTTP Client Usage
**Vulnerability:** Direct use of Go's default `http.Get` for outgoing requests (e.g., `TestSiteURL`, `GetLatestVersion`, `GetPreviewModalData`), which lacks default timeouts and SSRF protection.
**Learning:** Standard library functions like `http.Get` use a default client without timeouts or connection restrictions, potentially leading to resource exhaustion or Server-Side Request Forgery (SSRF) if URLs are influenced by users or external systems.
**Prevention:** Mandatory use of the application's `HTTPService` (via `a.HTTPService()` or `s.HTTPService()`) to instantiate HTTP clients. Use `MakeClient(false)` for requests to untrusted or external URLs to enforce SSRF protection and standardized timeouts.

## 2025-05-16 - Nested Nil Pointer Dereference in License Features
**Vulnerability:** Potential server panics (DoS) in multiple modules (admin, email, jobs, file) when dereferencing `license.Features` or `license.Limits` pointers without ensuring they are non-nil.
**Learning:** Even when the top-level `license` object is checked for nil, its nested components like `Features` and `Limits` can still be nil depending on how the license was loaded or forged. This pattern was widespread in background jobs and configuration-dependent logic.
**Prevention:** Use `license.IsCloud()` or `license.IsMattermostEntry()` helpers where applicable as they handle nested nil checks. For other features, always explicitly check `license != nil && license.Features != nil` before dereferencing feature flags.

## 2025-05-17 - Insecure Default HTTP Client and Missing Timeouts
**Vulnerability:** Resource exhaustion (DoS) and potential SSRF due to usage of `http.Get` or unconfigured `http.Client` which lacks timeouts and security overrides.
**Learning:** Even in non-critical paths like product notices or internal test utilities (inbucket), using Go's default HTTP client is risky as it can hang indefinitely and bypass SSRF protections.
**Prevention:** Always use the application's `HTTPService` to create clients, or at minimum, configure an explicit timeout on a dedicated `http.Client`. Avoid `http.Get`, `http.Post`, and falling back to `http.DefaultClient`.

## 2025-05-18 - XSS via Unsanitized Markdown in Admin Console
**Vulnerability:** Potential XSS when rendering `upgradeError` messages using `dangerouslySetInnerHTML` without sanitization.
**Learning:** The application's default markdown renderer is configured with `sanitize: false`, assuming callers will handle sanitization. High-privilege components like Admin Console banners rendered dynamic error strings (potentially from external or system-level sources) directly into the DOM.
**Prevention:** Mandatory use of `DOMPurify.sanitize()` when using `dangerouslySetInnerHTML` for any content processed by the markdown `format()` utility, especially for strings like error messages that might contain unsanitized input.

## 2026-03-09 - [CLI Network Timeout Security]
**Vulnerability:** Lack of HTTP timeouts in mmctl commands causing potential DoS via hang requests, and direct use of `http.Get` bypassing security client configurations.
**Learning:** Direct use of `http.Get` is forbidden as it bypasses centralized client configuration and lacks mandatory timeouts.
**Prevention:** Always use authorized API client wrappers and require an explicit request timeout (or request-scoped context deadline) for outbound calls.
