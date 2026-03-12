-- ─── Auth columns ───────────────────────────────────────────────────────────
-- Run once after jefflink_finance_schema.sql to enable password-based auth.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- ─── Seed mobile-app roles ───────────────────────────────────────────────────
INSERT INTO roles (name)
VALUES
  ('ADMIN'),
  ('MANAGER'),
  ('CUSTOMER'),
  ('AGENT')
ON CONFLICT (name) DO NOTHING;
