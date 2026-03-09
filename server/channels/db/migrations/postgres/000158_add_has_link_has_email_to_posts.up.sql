-- morph:nontransactional
ALTER TABLE Posts ADD COLUMN IF NOT EXISTS HasLink boolean DEFAULT false;
ALTER TABLE Posts ADD COLUMN IF NOT EXISTS HasEmail boolean DEFAULT false;

UPDATE Posts SET HasLink = true WHERE Message ~ 'https?://[^\s/$.?#].[^\s]*';
UPDATE Posts SET HasEmail = true WHERE Message ~ '[^\s@]+@[^\s@]+\.[^\s@]+';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_has_link ON Posts (HasLink) WHERE HasLink = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_has_email ON Posts (HasEmail) WHERE HasEmail = true;
