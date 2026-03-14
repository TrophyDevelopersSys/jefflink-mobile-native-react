-- ============================================================================
-- JeffLink Admin Infrastructure Migration
-- Adds: vendor_profiles, listing_reports, admin_logs
-- Run against Neon PostgreSQL
-- ============================================================================

-- ── Vendor Profiles ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name       VARCHAR(255),
  business_type       VARCHAR(100),           -- DEALERSHIP | INDIVIDUAL | AGENCY
  location            VARCHAR(255),
  district            VARCHAR(100),
  tin_number          VARCHAR(50),
  license_number      VARCHAR(100),
  verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  verified_by         UUID REFERENCES users(id),
  verified_at         TIMESTAMPTZ,
  rejection_reason    TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS vendor_profiles_user_idx  ON vendor_profiles (user_id);
CREATE        INDEX IF NOT EXISTS vendor_profiles_status_idx ON vendor_profiles (verification_status);

-- ── Listing Reports ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listing_reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by      UUID NOT NULL REFERENCES users(id),
  reference_id     UUID NOT NULL,       -- vehicle_id or property_id
  reference_type   VARCHAR(50) NOT NULL, -- vehicle | property
  reason           VARCHAR(100) NOT NULL, -- FRAUD | DUPLICATE | INAPPROPRIATE | OTHER
  description      TEXT,
  status           VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  resolved_by      UUID REFERENCES users(id),
  resolution_note  TEXT,
  resolved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listing_reports_ref_idx      ON listing_reports (reference_id, reference_type);
CREATE INDEX IF NOT EXISTS listing_reports_status_idx   ON listing_reports (status);
CREATE INDEX IF NOT EXISTS listing_reports_reporter_idx ON listing_reports (reported_by);

-- ── Admin Audit Logs ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id     UUID NOT NULL REFERENCES users(id),
  action       VARCHAR(100) NOT NULL,  -- e.g. SUSPEND_USER, APPROVE_VEHICLE
  entity_type  VARCHAR(50),            -- user | vendor | vehicle | property | contract
  entity_id    UUID,
  metadata     JSONB,                  -- before/after snapshot, extra context
  ip_address   VARCHAR(45),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_logs_admin_idx      ON admin_logs (admin_id);
CREATE INDEX IF NOT EXISTS admin_logs_entity_idx     ON admin_logs (entity_id);
CREATE INDEX IF NOT EXISTS admin_logs_action_idx     ON admin_logs (action);
CREATE INDEX IF NOT EXISTS admin_logs_created_at_idx ON admin_logs (created_at DESC);

-- ── Add PENDING_REVIEW and REJECTED to listing statuses ─────────────────────
-- These are handled by varchar columns so no enum change needed.
-- Existing status column on vehicles/properties supports any varchar value.

-- ── Seed initial PENDING_REVIEW listings (none — new columns only) ───────────

-- ── Grant row-level security policy hints (enable if using RLS) ───────────────
-- ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE listing_reports ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE admin_logs IS
  'Immutable audit trail of every admin action. Never update or delete rows.';
COMMENT ON TABLE vendor_profiles IS
  'Verification and business profile data for vendor users.';
COMMENT ON TABLE listing_reports IS
  'User-submitted reports on suspicious or policy-violating listings.';
