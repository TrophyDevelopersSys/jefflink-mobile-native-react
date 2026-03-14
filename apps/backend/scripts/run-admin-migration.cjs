/**
 * run-admin-migration.cjs
 *
 * Applies the 0001_admin_infrastructure.sql migration against Neon PostgreSQL.
 * Idempotent — all CREATE TABLE / CREATE INDEX statements use IF NOT EXISTS.
 *
 * Usage:
 *   node scripts/run-admin-migration.cjs
 *   # or via npm:
 *   npm run db:migrate:admin
 */
const { readFileSync } = require('fs');
const { join } = require('path');

// ── Load .env ────────────────────────────────────────────────────────────────
const envPath = join(__dirname, '..', '.env');
try {
  const envLines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of envLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {
  // .env not present — rely on existing process.env (e.g. CI / Render)
}

const { neonConfig, Pool } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Add it to .env or your environment.');
  process.exit(1);
}

const SQL_PATH = join(__dirname, '..', 'drizzle', '0001_admin_infrastructure.sql');
const sql = readFileSync(SQL_PATH, 'utf-8');

const pool = new Pool({ connectionString: DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    console.log('🔗 Connected to Neon PostgreSQL');
    console.log('⚙️  Applying 0001_admin_infrastructure.sql …\n');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    console.log('✅  Migration applied successfully.\n');
    console.log('Tables created / verified:');
    console.log('  • vendor_profiles');
    console.log('  • listing_reports');
    console.log('  • admin_logs');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed — rolled back.\n');
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
