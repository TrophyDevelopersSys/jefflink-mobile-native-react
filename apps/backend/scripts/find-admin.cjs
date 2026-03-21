const { readFileSync } = require('fs');
const { join } = require('path');
const { neonConfig, Pool } = require('@neondatabase/serverless');
const ws = require('ws');
neonConfig.webSocketConstructor = ws;

readFileSync(join(__dirname, '..', '.env'), 'utf-8').split(/\r?\n/).forEach(l => {
  const i = l.indexOf('=');
  if (i > 0) {
    const k = l.slice(0, i).trim();
    const v = l.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
});

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query(
    "SELECT u.id, u.email, u.name, u.status, r.role FROM users u LEFT JOIN roles r ON r.user_id = u.id WHERE LOWER(u.email) LIKE '%admin%' OR LOWER(u.email) LIKE '%jefflink%' ORDER BY u.created_at"
  );
  console.log(JSON.stringify(rows, null, 2));
  await pool.end();
})();
