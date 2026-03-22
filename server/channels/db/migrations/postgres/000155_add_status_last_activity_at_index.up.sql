-- Migration 000155: Add index on Status(LastActivityAt) for DeactivateInactiveUsers performance.
--
-- Without this index, every call to DeactivateInactiveUsers performs a FULL TABLE SCAN
-- on the Status table: SELECT UserId FROM Status WHERE LastActivityAt < $1
-- On a large deployment this can block for several seconds, consuming all DB I/O.
--
-- Note: CONCURRENTLY is NOT used here because Sofa's migration runner executes
-- all migrations inside a transaction block, and PostgreSQL forbids CONCURRENTLY
-- inside transactions.
CREATE INDEX IF NOT EXISTS idx_status_last_activity_at
ON Status (LastActivityAt);
