/**
 * fix-admin.cjs — Directly promote a specific user to SUPER_ADMIN
 */
const { readFileSync } = require('fs');
const { join } = require('path');
const bcrypt = require('bcryptjs');
const { neonConfig, Pool } = require('@neondatabase/serverless');
const ws = require('ws');
neonConfig.webSocketConstructor = ws;

function loadEnv(p) {
  try {
    readFileSync(p, 'utf-8').split(/\r?\n/).forEach(l => {
      const t = l.trim();
      if (!t || t.startsWith('#')) return;
      const i = t.indexOf('=');
      if (i <= 0) return;
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    });
  } catch {}
}
loadEnv(join(__dirname, '..', '.env'));

const TARGET_USER_ID = '32462aaa-dd31-439a-a3e4-60117c8b6dfd';
const NEW_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'JeffLink@Admin2026!';
const TARGET_ROLE = 'SUPER_ADMIN';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    // 1. Verify user exists
    const { rows: [user] } = await client.query(
      'SELECT id, email, name, status FROM users WHERE id = $1',
      [TARGET_USER_ID]
    );
    if (!user) {
      console.error('User not found:', TARGET_USER_ID);
      process.exit(1);
    }
    console.log('Found user:', user.email, '| status:', user.status);

    await client.query('BEGIN');

    // 2. Update password + status
    const passwordHash = await bcrypt.hash(NEW_PASSWORD, 12);

    // Check which password column exists
    const { rows: cols } = await client.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema='public' AND table_name='users'
       AND column_name IN ('password_hash','password')`,
    );
    const pwCols = cols.map(c => c.column_name);
    console.log('Password columns:', pwCols);

    for (const col of pwCols) {
      await client.query(
        `UPDATE users SET "${col}" = $1, status = 'ACTIVE', updated_at = NOW() WHERE id = $2`,
        [passwordHash, TARGET_USER_ID]
      );
    }
    console.log('Password updated');

    // 3. Check if roles table has user_id + role columns (per-user role row)
    const { rows: roleCols } = await client.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema='public' AND table_name='roles'`
    );
    const roleColNames = new Set(roleCols.map(c => c.column_name));

    if (roleColNames.has('user_id') && roleColNames.has('role')) {
      // Upsert role row
      const { rows: existing } = await client.query(
        'SELECT id FROM roles WHERE user_id = $1 LIMIT 1',
        [TARGET_USER_ID]
      );
      if (existing.length) {
        await client.query('UPDATE roles SET role = $1 WHERE user_id = $2', [TARGET_ROLE, TARGET_USER_ID]);
        console.log('Updated existing role row to', TARGET_ROLE);
      } else {
        await client.query('INSERT INTO roles (user_id, role, created_at) VALUES ($1, $2, NOW())', [TARGET_USER_ID, TARGET_ROLE]);
        console.log('Inserted new role row:', TARGET_ROLE);
      }
    }

    // 4. Also update users.role if that column exists
    const { rows: userRoleCol } = await client.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema='public' AND table_name='users' AND column_name='role'`
    );
    if (userRoleCol.length) {
      await client.query('UPDATE users SET role = $1 WHERE id = $2', [TARGET_ROLE, TARGET_USER_ID]);
      console.log('Updated users.role to', TARGET_ROLE);
    }

    await client.query('COMMIT');

    // 5. Verify final state
    const { rows: [final] } = await client.query(
      'SELECT id, email, name, status FROM users WHERE id = $1',
      [TARGET_USER_ID]
    );
    const { rows: finalRoles } = await client.query(
      'SELECT role FROM roles WHERE user_id = $1',
      [TARGET_USER_ID]
    );
    console.log('\n=== ADMIN ACCOUNT READY ===');
    console.log('userId:', final.id);
    console.log('email:', final.email);
    console.log('name:', final.name);
    console.log('status:', final.status);
    console.log('role:', finalRoles[0]?.role || '(from users table)');
    console.log('password: [redacted]');

    // 6. Clean up duplicate if seed created one
    const { rows: dupes } = await client.query(
      "SELECT id FROM users WHERE LOWER(email) = 'admin@jefflinkcars.com' AND id != $1",
      [TARGET_USER_ID]
    );
    if (dupes.length) {
      console.log('\nFound', dupes.length, 'duplicate row(s) — cleaning up...');
      for (const d of dupes) {
        await client.query('DELETE FROM roles WHERE user_id = $1', [d.id]);
        await client.query('DELETE FROM users WHERE id = $1', [d.id]);
        console.log('Removed duplicate:', d.id);
      }
    }
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('Failed:', e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}
main();
