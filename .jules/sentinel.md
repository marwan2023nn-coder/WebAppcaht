## 2025-05-14 - License Feature Nil Pointer Dereference
**Vulnerability:** Potential server panics (DoS) due to missing nil checks on `license.Features` before accessing specific feature pointers like `LDAP`.
**Learning:** While the top-level `license` object was checked for nil, its nested `Features` pointer (common in the Mattermost/Sofa model) could also be nil in certain configurations or license states.
**Prevention:** Always verify both `license` and `license.Features` are non-nil, and use `model.SafeDereference` for the actual feature pointers to handle optional or omitted fields safely.
