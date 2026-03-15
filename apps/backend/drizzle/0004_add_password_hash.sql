-- ============================================================================
-- 0004_add_password_hash.sql
-- Adds password_hash to the users table when the DB was originally provisioned
-- from jefflink_finance_schema.sql (which lacked this column).
-- Safe to run multiple times: uses IF NOT EXISTS guard.
-- ============================================================================

-- Add the column only when it is missing (legacy DBs provisioned from
-- jefflink_finance_schema.sql did not include password_hash).
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Ensure status has no NULLs so the NOT NULL constraint can be applied later.
UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;
