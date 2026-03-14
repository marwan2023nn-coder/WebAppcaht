CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_posts_message_trgm ON Posts USING gin (Message gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_posts_hashtags_trgm ON Posts USING gin (Hashtags gin_trgm_ops);
