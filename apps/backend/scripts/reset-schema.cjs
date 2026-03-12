/**
 * reset-schema.cjs
 * Drops all old tables and applies the new Drizzle schema.
 * Usage: node scripts/reset-schema.cjs
 */
const { readFileSync } = require('fs');
const { join } = require('path');

// Read .env manually (dotenv may not resolve from scripts/ subdir)
const envPath = join(__dirname, '..', '.env');
const envLines = readFileSync(envPath, 'utf-8').split('\n');
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx > 0) {
    process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
}

const { neonConfig, Pool } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    console.log('🔗 Connected to Neon PostgreSQL');

    // Step 1: Drop all old tables (CASCADE handles FK dependencies)
    const oldTables = [
      'recovery_cases',
      'gps_devices',
      'commissions',
      'vendor_withdrawals',
      'ledger_entries',
      'ads',
      'wallets',
      'vendors',
      'roles',
      'users',
      'branches',
      // also drop new-named tables in case of partial previous push
      'installments',
      'withdrawals',
      'payments',
      'contracts',
      'vendor_wallets',
      'reviews',
      'favorites',
      'notifications',
      'media_assets',
      'ledger_transactions',
      'vehicles',
      'properties',
    ];

    console.log('\n🗑️  Dropping old tables...');
    for (const table of oldTables) {
      await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
      console.log(`   ✓ Dropped ${table}`);
    }

    // Step 2: Apply new migration SQL
    const migrationPath = join(__dirname, '..', 'drizzle', '0000_fancy_raza.sql');
    const migrationSql = readFileSync(migrationPath, 'utf-8');

    // drizzle-kit generates SQL separated by "--> statement-breakpoint"
    const statements = migrationSql
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(Boolean);

    console.log(`\n📦 Applying ${statements.length} SQL statements...`);
    for (const stmt of statements) {
      await client.query(stmt);
    }
    console.log('   ✓ All statements applied');

    console.log('\n✅ Schema reset complete! All new tables created.');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
