## 2026-03-01 - N+1 Query Bottleneck in Post Metadata Preparation
**Learning:** The `PreparePostListForClient` function in the app layer is a critical path for many API responses (channel loads, search results). While reactions and emojis were already bulk-loaded, file information was being fetched individually for each post, leading to up to 60+ additional database queries per request. This pattern is likely present in other metadata types and should be audited.
**Action:** When preparing lists of entities that require associated metadata (files, reactions, priority), always implement bulk-loading methods in the store and app layers to keep database query counts constant (O(1)) relative to the list size.

## 2026-03-01 - RBAC Shared Boundary Data Leakage
**Learning:** Using multiple `JOIN` statements in RBAC view restriction logic creates an intersection (AND), which is logically incorrect for administrators with multiple boundaries (e.g., Team A AND Channel B). This prevents them from seeing users they should have access to.
**Action:** Use a `UNION` of permissions via subqueries (`Id IN (...)`) with `sq.Or` blocks. This ensures correct logical union of boundaries and improved performance by avoiding cross-product join overhead.

## 2026-03-01 - WebSocket Hub Blocking Registration
**Learning:** Performing blocking database lookups (like fetching channel memberships) inside the main WebSocket Hub event loop creates a "Stop-the-World" bottleneck during mass-reconnection events.
**Action:** Refactor registration and invalidation sequences to perform all necessary I/O *outside* the Hub loop, passing the results as message payload. This keeps the real-time distribution engine entirely non-blocking.

## 2026-03-01 - Mass Deletion Thread Metadata Bottleneck
**Learning:** Updating thread metadata (`ReplyCount`, `Participants`) in a loop during mass post deletions causes an N+1 query explosion and significant DB lock contention.
**Action:** Implement bulk update methods using correlated subqueries and PostgreSQL-specific JSONB operators (`Participants - 'user_id'`) to refresh entire batches of thread metadata in a single transaction.
