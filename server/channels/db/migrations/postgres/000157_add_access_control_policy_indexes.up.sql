-- morph:nontransactional
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_access_control_policies_type ON AccessControlPolicies (Type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_access_control_policies_active ON AccessControlPolicies (Active);
