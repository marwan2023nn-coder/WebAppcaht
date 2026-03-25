ALTER TABLE clusterdiscovery DROP COLUMN IF NOT EXISTS version;
ALTER TABLE clusterdiscovery DROP COLUMN IF NOT EXISTS schemaversion;
ALTER TABLE clusterdiscovery DROP COLUMN IF NOT EXISTS confighash;
ALTER TABLE clusterdiscovery DROP COLUMN IF NOT EXISTS ipaddress;
