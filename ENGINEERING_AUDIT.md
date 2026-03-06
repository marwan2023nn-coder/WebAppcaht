# Engineering Audit Report: Sofa Workspace (WebAppcaht)

## 1. Executive Summary
This audit evaluated the codebase against **Clean Architecture**, **Zero-Bug Policy**, and **Enterprise-Grade Scalability**. Critical remediations were performed in the store and platform layers to address SQL syntax vulnerabilities, N+1 performance bottlenecks, and concurrency stalls in the WebSocket infrastructure.

## 2. Structural Engineering (Clean Architecture)
- **Layer Separation:** Confirmed strict isolation. SQL logic and Squirrel builders are confined to `server/channels/store/sqlstore/`. API handlers interface exclusively with the `app` layer.
- **Dependency Injection:** The `Store` interface acts as the definitive contract between business logic and data implementation, allowing for seamless introduction of caching layers (TimerLayer/RetryLayer).

## 3. Security & Logic Audit
### Vulnerability Log & Remediation

| Issue ID | File:Line | Description | Resolution |
| :--- | :--- | :--- | :--- |
| **SEC-01** | `user_store.go:2205` | **SQL Syntax Error:** Squirrel `IN` clause fails to expand slices correctly when using `sq.Expr` without explicit subquery parentheses. | Refactored to `sq.Expr("Users.Id IN (?)", subquery)` with `sq.Question` format. |
| **PERF-01** | `user.go:2643` | **Multi-tenancy O(N) Loop:** Boundary checks for team admins executed sequential DB queries per team. | Implemented **Bulk Loading** and process-level caching for `GetAdminTeamIdsForUser`. |
| **CONC-01** | `web_hub.go:120` | **Websocket Stall:** DB calls during registration blocked the main Hub event loop. | Decoupled membership fetching from the Hub loop; registrations are now **Non-blocking**. |
| **LOGIC-01**| `role.go:1250` | **DoS Risk:** Infinite recursion in ancillary permission resolution. | Added a `Visited Map` to `AddAncillaryPermissions` to ensure safe termination. |

## 4. Custom RBAC Patch: Team-Scoped Admin
**Requirement:** Restrict System Console visibility for "Community Manager + User Manager" roles to only their managed teams/users, without affecting global chat search.

**Implementation Details:**
An **Implicit Filter** was injected into the Store layer. When a session carries restricted administrative roles, the `ViewUsersRestrictions` context is populated. The `SqlStore` then automatically appends team-based boundaries to all search and list queries.

```go
// server/channels/store/sqlstore/user_store.go
func applyViewRestrictionsFilter(query sq.SelectBuilder, restrictions *model.ViewUsersRestrictions) sq.SelectBuilder {
    if restrictions == nil { return query }
    restrictionClause := sq.Or{}
    if len(restrictions.Teams) > 0 {
        teamSubquery := sq.StatementBuilder.PlaceholderFormat(sq.Question).
            Select("UserId").From("TeamMembers").
            Where(sq.Eq{"DeleteAt": 0, "TeamId": restrictions.Teams})
        restrictionClause = append(restrictionClause, sq.Expr("Users.Id IN (?)", teamSubquery))
    }
    return query.Where(restrictionClause)
}
```

## 5. Performance & Hardening Blueprint
1. **Database Drivers:** Implemented **Driver Branching** in `bulkUpdateThreadsAfterReplyDeletion` to maintain high performance on both PostgreSQL (JSONB) and MySQL (JSON_REMOVE).
2. **Cache Strategy:** Replaced "Nuclear Cache Invalidation" (InvalidateAllCaches) with **Scoped Invalidation** to prevent database spikes during bulk user updates.
3. **License Centralization:** Verified that `PlatformService` acts as the single source of truth for license enforcement, preventing bypass of SAML/MFA features.

## 6. System Graph (Data Flow)
`Client (React)` -> `API (Permission Middleware)` -> `App (Service Orchestration)` -> `Store Interface` -> `SQL Store (Squirrel)` -> `Postgres/MySQL`.

---
**Status:** The system is now optimized for **Production-Ready** deployment with significantly improved resilience against peak loads and boundary leakage.
