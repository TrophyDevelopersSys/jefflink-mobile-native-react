-- ============================================================================
-- 0005_admin_recovery.sql
-- Adds admin_recovery_tokens and admin_recovery_audit tables for a
-- production-grade admin password recovery system with full auditability.
-- Safe to run multiple times: uses IF NOT EXISTS guards.
-- ============================================================================

-- ── Admin Recovery Tokens ───────────────────────────────────────────────────
-- Stores hashed recovery tokens (SHA-256). Raw tokens are NEVER persisted.
-- Each token is single-use and time-bound.
CREATE TABLE IF NOT EXISTS admin_recovery_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    VARCHAR(128) NOT NULL,            -- SHA-256 hex digest
  expires_at    TIMESTAMP NOT NULL,
  used_at       TIMESTAMP,                        -- NULL until consumed
  revoked_at    TIMESTAMP,                        -- NULL unless manually revoked
  ip_address    VARCHAR(45),                      -- IPv4 or IPv6
  user_agent    TEXT,
  initiated_by  UUID REFERENCES users(id),        -- NULL = self-service, set = SUPER_ADMIN initiated
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by user + unexpired + unused tokens
CREATE INDEX IF NOT EXISTS admin_recovery_tokens_user_idx
  ON admin_recovery_tokens (user_id);

CREATE INDEX IF NOT EXISTS admin_recovery_tokens_expires_idx
  ON admin_recovery_tokens (expires_at);

CREATE INDEX IF NOT EXISTS admin_recovery_tokens_hash_idx
  ON admin_recovery_tokens (token_hash);

-- ── Admin Recovery Audit Log ────────────────────────────────────────────────
-- Immutable append-only log of every admin recovery action.
CREATE TABLE IF NOT EXISTS admin_recovery_audit (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),        -- target user (may be NULL for unknown emails)
  action        VARCHAR(50) NOT NULL,             -- REQUEST | RESET_SUCCESS | RESET_FAILED | INITIATE | REVOKE | TOKEN_EXPIRED
  email         VARCHAR(255),                     -- email used in request (masked in responses)
  ip_address    VARCHAR(45),
  user_agent    TEXT,
  metadata      JSONB,                            -- extra context (failure reasons, etc.)
  initiated_by  UUID REFERENCES users(id),        -- the SUPER_ADMIN who triggered (if applicable)
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_recovery_audit_user_idx
  ON admin_recovery_audit (user_id);

CREATE INDEX IF NOT EXISTS admin_recovery_audit_action_idx
  ON admin_recovery_audit (action);

CREATE INDEX IF NOT EXISTS admin_recovery_audit_created_at_idx
  ON admin_recovery_audit (created_at);

-- Cleanup: automatically invalidate expired tokens (can be called periodically)
-- This is a convenience function, not a trigger — called from application code.
CREATE OR REPLACE FUNCTION cleanup_expired_admin_recovery_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM admin_recovery_tokens
  WHERE expires_at < NOW()
    AND used_at IS NULL
    AND revoked_at IS NULL;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
