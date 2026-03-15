-- ============================================================================
-- 0003_align_prod_schema.sql
-- Aligns the production Neon DB (created from jefflink_finance_schema.sql)
-- with the NestJS Drizzle ORM schema (0000_fancy_raza.sql).
--
-- Safe to run multiple times: every change uses IF NOT EXISTS / IF EXISTS guards.
--
-- Changes:
--   users  → add name, avatar_url, refresh_token_hash, updated_at
--   roles  → transform from name-lookup table to per-user role rows
--            (legacy: roles.name; target: roles.user_id + roles.role)
--   users  → drop first_name, last_name, role_id (legacy columns)
--   roles  → drop name (legacy column)
-- ============================================================================

-- ── 1. users: add new columns ────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS name              VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url        TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at        TIMESTAMPTZ DEFAULT NOW();

-- ── 2. users: populate name from legacy first_name + last_name ───────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'first_name'
  ) THEN
    UPDATE users
      SET name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
      WHERE name IS NULL OR name = '';
  END IF;
END $$;

-- Fallback: use email prefix for any names still empty
UPDATE users SET name = SPLIT_PART(email, '@', 1) WHERE name IS NULL OR name = '';
-- Final fallback
UPDATE users SET name = 'User' WHERE name IS NULL OR name = '';

-- Make name NOT NULL (all rows are populated above)
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
ALTER TABLE users ALTER COLUMN name SET DEFAULT '';

-- ── 3. roles: add new columns ────────────────────────────────────────────────
ALTER TABLE roles ADD COLUMN IF NOT EXISTS user_id    UUID;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS role       VARCHAR(50);
ALTER TABLE roles ADD COLUMN IF NOT EXISTS branch_id  UUID;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ── 4. roles: migrate legacy name-lookup rows → per-user rows ────────────────
-- Runs only when the legacy roles.name column exists (old schema).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roles' AND column_name = 'name'
  ) THEN
    -- Case A: users.role_id still present — use it to map each user → role name
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'role_id'
    ) THEN

      -- Insert per-user role rows for users who have a role_id
      INSERT INTO roles (user_id, role, created_at)
      SELECT DISTINCT u.id, r.name, NOW()
        FROM users u
        JOIN roles r ON r.id = u.role_id
       WHERE u.role_id IS NOT NULL
         AND NOT EXISTS (SELECT 1 FROM roles r2 WHERE r2.user_id = u.id);

      -- Insert CUSTOMER role for users with no role_id
      INSERT INTO roles (user_id, role, created_at)
      SELECT u.id, 'CUSTOMER', NOW()
        FROM users u
       WHERE u.role_id IS NULL
         AND NOT EXISTS (SELECT 1 FROM roles r2 WHERE r2.user_id = u.id);

      -- Drop users.role_id (and its FK to the old lookup rows) so we can
      -- delete the old lookup rows without a FK violation.
      EXECUTE 'ALTER TABLE users DROP COLUMN IF EXISTS role_id';

    ELSE
      -- Case B: role_id already gone — assign CUSTOMER to any unmapped user
      INSERT INTO roles (user_id, role, created_at)
      SELECT u.id, 'CUSTOMER', NOW()
        FROM users u
       WHERE NOT EXISTS (SELECT 1 FROM roles r2 WHERE r2.user_id = u.id);
    END IF;

    -- Remove old lookup rows (they have user_id IS NULL)
    DELETE FROM roles WHERE user_id IS NULL;

    -- Drop the legacy name column from roles
    EXECUTE 'ALTER TABLE roles DROP COLUMN IF EXISTS name';
  END IF;
END $$;

-- ── 5. roles: enforce NOT NULL on user_id and role ───────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roles' AND column_name = 'user_id' AND is_nullable = 'YES'
  ) THEN
    EXECUTE 'ALTER TABLE roles ALTER COLUMN user_id SET NOT NULL';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roles' AND column_name = 'role' AND is_nullable = 'YES'
  ) THEN
    EXECUTE 'ALTER TABLE roles ALTER COLUMN role SET NOT NULL';
  END IF;
END $$;

-- ── 6. roles: add FK constraint roles.user_id → users.id ─────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'roles_user_id_users_id_fk'
      AND table_name = 'roles'
  ) THEN
    EXECUTE 'ALTER TABLE roles ADD CONSTRAINT roles_user_id_users_id_fk
             FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE';
  END IF;
END $$;

-- ── 7. users: drop remaining legacy columns ───────────────────────────────────
ALTER TABLE users DROP COLUMN IF EXISTS first_name;
ALTER TABLE users DROP COLUMN IF EXISTS last_name;
-- role_id may still exist if the DO block above was skipped (idempotent guard)
ALTER TABLE users DROP COLUMN IF EXISTS role_id;

-- ── 8. indexes ────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE        INDEX IF NOT EXISTS roles_user_idx  ON roles  (user_id);
