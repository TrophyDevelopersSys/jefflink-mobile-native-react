/**
 * run-admin-migration.cjs
 *
 * Applies the idempotent compatibility migrations required by the deployed
 * backend. This keeps legacy/prod databases aligned with the current NestJS
 * auth + admin schema before the API starts.
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

const MIGRATIONS = [
  {
    name: '0001_admin_infrastructure.sql',
    description: 'admin tables and indexes',
  },
  {
    name: '0003_align_prod_schema.sql',
    description: 'users/roles compatibility alignment',
  },
  {
    name: '0004_add_password_hash.sql',
    description: 'legacy auth password column backfill',
  },
];

const pool = new Pool({ connectionString: DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    console.log('🔗 Connected to Neon PostgreSQL');
    console.log('⚙️  Applying startup compatibility migrations …\n');

    await client.query('BEGIN');

    for (const migration of MIGRATIONS) {
      const sqlPath = join(__dirname, '..', 'drizzle', migration.name);
      const sql = readFileSync(sqlPath, 'utf-8');

      console.log(`   • ${migration.name} (${migration.description})`);
      await client.query(sql);
    }

    await client.query('COMMIT');

    console.log('\n✅  Startup compatibility migrations applied successfully.\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Startup compatibility migrations failed — rolled back.\n');
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
