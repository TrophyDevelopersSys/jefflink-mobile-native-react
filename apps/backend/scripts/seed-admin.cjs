/**
 * seed-admin.cjs
 *
 * Seeds/updates an admin user with adaptive support for legacy and modern schemas.
 *
 * Usage:
 *   node scripts/seed-admin.cjs
 *   ADMIN_SEED_EMAIL=trophy.vas@gmail.com ADMIN_SEED_PASSWORD='StrongPass#123' ADMIN_SEED_ROLE=SUPER_ADMIN node scripts/seed-admin.cjs
 */
const { readFileSync } = require('fs');
const { join } = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { neonConfig, Pool } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

function loadEnvFile(pathname) {
  try {
    const lines = readFileSync(pathname, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx <= 0) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore missing file
  }
}

loadEnvFile(join(__dirname, '..', '.env'));
loadEnvFile(join(__dirname, '..', '.env.local'));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const ADMIN_EMAIL_RAW = process.env.ADMIN_SEED_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD;
if (!ADMIN_EMAIL_RAW || !ADMIN_PASSWORD) {
  console.log(
    'Admin seed skipped: set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD to enable.',
  );
  process.exit(0);
}

const ADMIN_EMAIL = ADMIN_EMAIL_RAW.toLowerCase();
const ADMIN_ROLE = (process.env.ADMIN_SEED_ROLE || 'SUPER_ADMIN').toUpperCase();
const ADMIN_NAME = process.env.ADMIN_SEED_NAME || 'Trophy Admin';
const ADMIN_PHONE = process.env.ADMIN_SEED_PHONE || '+256700000000';

function qIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

async function getColumnMeta(client, tableName) {
  const { rows } = await client.query(
    `SELECT column_name, is_nullable, column_default, data_type, udt_name, is_identity
       FROM information_schema.columns
      WHERE table_schema='public' AND table_name=$1
      ORDER BY ordinal_position`,
    [tableName],
  );
  return rows.map((r) => ({
    columnName: r.column_name,
    isNullable: r.is_nullable === 'YES',
    hasDefault: r.column_default != null,
    dataType: String(r.data_type || ''),
    udtName: String(r.udt_name || ''),
    isIdentity: r.is_identity === 'YES',
  }));
}

async function getUniqueColumns(client, tableName) {
  const { rows } = await client.query(
    `SELECT DISTINCT kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema='public'
        AND tc.table_name=$1
        AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')`,
    [tableName],
  );
  return new Set(rows.map((r) => r.column_name));
}

async function getForeignKeys(client, tableName) {
  const { rows } = await client.query(
    `SELECT
       kcu.column_name,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
     JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.table_schema='public'
      AND tc.table_name=$1
      AND tc.constraint_type='FOREIGN KEY'`,
    [tableName],
  );
  const out = new Map();
  for (const r of rows) {
    out.set(r.column_name, {
      foreignTableName: r.foreign_table_name,
      foreignColumnName: r.foreign_column_name,
    });
  }
  return out;
}

async function getEnumLabels(client, enumTypeName) {
  const { rows } = await client.query(
    `SELECT e.enumlabel
       FROM pg_type t
       JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE t.typname = $1
      ORDER BY e.enumsortorder`,
    [enumTypeName],
  );
  return rows.map((r) => r.enumlabel);
}

async function ensureLookupRoleId(client, rolesColumns, targetRole) {
  const roleCol = rolesColumns.has('role')
    ? 'role'
    : rolesColumns.has('name')
      ? 'name'
      : null;
  if (!roleCol || !rolesColumns.has('id')) return null;

  const existing = await client.query(
    `SELECT id::text AS id FROM roles WHERE LOWER(${qIdent(roleCol)}) = LOWER($1) LIMIT 1`,
    [targetRole],
  );
  if (existing.rows[0]?.id) return existing.rows[0].id;

  const cols = [roleCol];
  const vals = [targetRole];
  if (rolesColumns.has('created_at')) {
    cols.push('created_at');
    vals.push(new Date());
  }
  const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
  const inserted = await client.query(
    `INSERT INTO roles (${cols.map(qIdent).join(', ')})
     VALUES (${placeholders})
     RETURNING id::text AS id`,
    vals,
  );
  return inserted.rows[0]?.id || null;
}

async function inferValueForRequiredColumn({
  client,
  column,
  meta,
  isUnique,
  emailLocalPart,
  usersForeignKeys,
  rolesColumns,
}) {
  const name = column.toLowerCase();

  if (name === 'email') return ADMIN_EMAIL;
  if (name === 'name' || name === 'full_name' || name === 'display_name') return ADMIN_NAME;
  if (name === 'first_name') return ADMIN_NAME;
  if (name === 'last_name') return 'Admin';
  if (name === 'phone') return isUnique ? `${ADMIN_PHONE}-${crypto.randomBytes(2).toString('hex')}` : ADMIN_PHONE;
  if (name === 'status') return 'ACTIVE';
  if (name === 'role' || name === 'user_role' || name === 'account_type' || name === 'user_type') {
    return ADMIN_ROLE;
  }
  if (name === 'username' || name === 'user_name') {
    return isUnique
      ? `${emailLocalPart}_${crypto.randomBytes(4).toString('hex')}`
      : emailLocalPart;
  }
  if (name.endsWith('_at')) return new Date();
  if (name.startsWith('is_') || name.startsWith('has_')) return false;

  const fk = usersForeignKeys.get(column);
  if (fk) {
    if (fk.foreignTableName === 'roles') {
      const roleId = await ensureLookupRoleId(client, rolesColumns, ADMIN_ROLE);
      if (roleId) return roleId;
    }
    const ref = await client.query(
      `SELECT ${qIdent(fk.foreignColumnName)}::text AS value FROM ${qIdent(fk.foreignTableName)} LIMIT 1`,
    );
    if (ref.rows[0]?.value) return ref.rows[0].value;
  }

  const dt = meta.dataType.toLowerCase();
  const udt = meta.udtName.toLowerCase();

  if (dt === 'user-defined') {
    const labels = await getEnumLabels(client, meta.udtName);
    if (labels.length) {
      const upper = new Map(labels.map((l) => [String(l).toUpperCase(), l]));
      if (name.includes('status') && upper.has('ACTIVE')) return upper.get('ACTIVE');
      if ((name.includes('role') || name.includes('type')) && upper.has(ADMIN_ROLE)) {
        return upper.get(ADMIN_ROLE);
      }
      return labels[0];
    }
  }

  if (dt === 'boolean' || udt === 'bool') return false;
  if (['smallint', 'integer', 'bigint', 'numeric', 'real', 'double precision'].includes(dt)) {
    return 0;
  }
  if (['character varying', 'character', 'text'].includes(dt)) {
    return isUnique
      ? `${emailLocalPart}_${crypto.randomBytes(4).toString('hex')}`
      : '';
  }
  if (dt === 'uuid' || udt === 'uuid') return crypto.randomUUID();
  if (dt.startsWith('timestamp') || dt === 'date' || dt === 'time') return new Date();
  if (dt === 'json' || dt === 'jsonb') return {};

  return undefined;
}

async function run() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    const emailLocalPart = ADMIN_EMAIL.split('@')[0] || 'admin';
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const usersMeta = await getColumnMeta(client, 'users');
    const rolesMeta = await getColumnMeta(client, 'roles');
    const usersColumns = new Set(usersMeta.map((c) => c.columnName));
    const rolesColumns = new Set(rolesMeta.map((c) => c.columnName));
    const usersUnique = await getUniqueColumns(client, 'users');
    const usersForeignKeys = await getForeignKeys(client, 'users');

    await client.query('BEGIN');

    let user = await client.query(
      `SELECT id::text AS id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [ADMIN_EMAIL],
    );

    let userId = user.rows[0]?.id;
    if (!userId) {
      const valuesByColumn = new Map();
      const setValue = (col, val) => {
        if (usersColumns.has(col) && !valuesByColumn.has(col)) valuesByColumn.set(col, val);
      };

      setValue('email', ADMIN_EMAIL);
      setValue('password_hash', passwordHash);
      setValue('password', passwordHash);
      setValue('name', ADMIN_NAME);
      setValue('first_name', ADMIN_NAME);
      setValue('last_name', 'Admin');
      setValue('phone', ADMIN_PHONE);
      setValue('status', 'ACTIVE');
      setValue('updated_at', new Date());

      if (usersColumns.has('role_id')) {
        const roleId = await ensureLookupRoleId(client, rolesColumns, ADMIN_ROLE);
        if (roleId) setValue('role_id', roleId);
      }

      for (const meta of usersMeta) {
        if (valuesByColumn.has(meta.columnName)) continue;
        if (meta.isNullable || meta.hasDefault || meta.isIdentity) continue;
        const value = await inferValueForRequiredColumn({
          client,
          column: meta.columnName,
          meta,
          isUnique: usersUnique.has(meta.columnName),
          emailLocalPart,
          usersForeignKeys,
          rolesColumns,
        });
        if (value === undefined) {
          throw new Error(
            `Cannot seed admin: required users.${meta.columnName} has no derived fallback`,
          );
        }
        valuesByColumn.set(meta.columnName, value);
      }

      const columns = Array.from(valuesByColumn.keys());
      const values = columns.map((c) => valuesByColumn.get(c));
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      const inserted = await client.query(
        `INSERT INTO users (${columns.map(qIdent).join(', ')})
         VALUES (${placeholders})
         RETURNING id::text AS id`,
        values,
      );
      userId = inserted.rows[0]?.id;
    } else {
      const sets = [];
      const vals = [];
      let p = 1;
      const pushSet = (col, val) => {
        if (!usersColumns.has(col)) return;
        sets.push(`${qIdent(col)} = $${p}`);
        vals.push(val);
        p += 1;
      };

      pushSet('password_hash', passwordHash);
      pushSet('password', passwordHash);
      pushSet('name', ADMIN_NAME);
      pushSet('first_name', ADMIN_NAME);
      pushSet('status', 'ACTIVE');
      if (usersColumns.has('updated_at')) {
        sets.push(`${qIdent('updated_at')} = NOW()`);
      }
      if (sets.length) {
        vals.push(userId);
        await client.query(
          `UPDATE users SET ${sets.join(', ')} WHERE id = $${p}`,
          vals,
        );
      }
    }

    if (!userId) {
      throw new Error('Failed to resolve seeded admin user ID');
    }

    // Assign admin role across modern and legacy schemas
    if (rolesColumns.has('user_id') && rolesColumns.has('role')) {
      const existing = await client.query(
        `SELECT id::text AS id FROM roles WHERE user_id = $1 LIMIT 1`,
        [userId],
      );
      if (existing.rows[0]?.id) {
        await client.query(
          `UPDATE roles SET role = $1 WHERE id = $2`,
          [ADMIN_ROLE, existing.rows[0].id],
        );
      } else {
        const cols = ['user_id', 'role'];
        const vals = [userId, ADMIN_ROLE];
        if (rolesColumns.has('created_at')) {
          cols.push('created_at');
          vals.push(new Date());
        }
        const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
        await client.query(
          `INSERT INTO roles (${cols.map(qIdent).join(', ')}) VALUES (${placeholders})`,
          vals,
        );
      }
    } else if (rolesColumns.has('user_id') && rolesColumns.has('name')) {
      const existing = await client.query(
        `SELECT id::text AS id FROM roles WHERE user_id = $1 LIMIT 1`,
        [userId],
      );
      if (existing.rows[0]?.id) {
        await client.query(
          `UPDATE roles SET name = $1 WHERE id = $2`,
          [ADMIN_ROLE, existing.rows[0].id],
        );
      } else {
        const cols = ['user_id', 'name'];
        const vals = [userId, ADMIN_ROLE];
        if (rolesColumns.has('created_at')) {
          cols.push('created_at');
          vals.push(new Date());
        }
        const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
        await client.query(
          `INSERT INTO roles (${cols.map(qIdent).join(', ')}) VALUES (${placeholders})`,
          vals,
        );
      }
    } else if (usersColumns.has('role_id') && rolesColumns.has('id')) {
      const roleId = await ensureLookupRoleId(client, rolesColumns, ADMIN_ROLE);
      if (roleId) {
        await client.query(`UPDATE users SET role_id = $1 WHERE id = $2`, [roleId, userId]);
      }
    } else if (usersColumns.has('role')) {
      await client.query(`UPDATE users SET role = $1 WHERE id = $2`, [ADMIN_ROLE, userId]);
    }

    await client.query('COMMIT');

    console.log('Admin seed complete');
    console.log(`email: ${ADMIN_EMAIL}`);
    console.log('password: [redacted]');
    console.log(`role: ${ADMIN_ROLE}`);
    console.log(`userId: ${userId}`);
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    console.error('Admin seed failed');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
