DROP INDEX IF EXISTS idx_posts_message_trgm;
DROP INDEX IF EXISTS idx_posts_hashtags_trgm;
-- We usually don't drop extensions in migrations unless absolutely necessary
