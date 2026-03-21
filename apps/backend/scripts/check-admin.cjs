const { readFileSync } = require('fs');
const { join } = require('path');
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
loadEnv(join(__dirname, '.env'));

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const { rows: users } = await pool.query(
      "SELECT id, email, name, status FROM users WHERE LOWER(email) = LOWER($1)",
      ['admin@jefflinkcars.com']
    );
    console.log('Admin user:', JSON.stringify(users, null, 2));

    if (users.length > 0) {
      const { rows: roleRows } = await pool.query(
        "SELECT id, user_id, role FROM roles WHERE user_id = $1",
        [users[0].id]
      );
      console.log('Admin role:', JSON.stringify(roleRows, null, 2));
    } else {
      console.log('No admin user found!');
    }
  } finally {
    await pool.end();
  }
}
main().catch(e => { console.error(e.message); process.exit(1); });
