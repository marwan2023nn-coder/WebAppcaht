DO $$
DECLARE
    column_exist boolean := false;
BEGIN
SELECT count(*) != 0 INTO column_exist
    FROM information_schema.columns
    WHERE table_name = 'oauthapps'
    AND table_schema = current_schema()
    AND column_name = 'sofaappid';
IF column_exist THEN
    UPDATE OAuthApps SET SofaAppID = '' WHERE SofaAppID IS NULL;
    ALTER TABLE OAuthApps ALTER COLUMN SofaAppID SET DEFAULT '';
    ALTER TABLE OAuthApps ALTER COLUMN SofaAppID SET NOT NULL;
END IF;
END $$;
