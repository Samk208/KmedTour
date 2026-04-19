/**
 * Pushes the pending migrations flagged in MANUAL-TODO.md:
 *   - 001_user_roles.sql
 *   - 002_performance_indexes.sql
 *
 * Attempts the exec_sql RPC first. If it is not installed on the target
 * instance, falls back to PostgREST-level operations where possible, and
 * otherwise prints the SQL for manual paste into the SQL editor.
 *
 * Usage: node supabase/scripts/push_pending_migrations.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const PENDING = ['001_user_roles.sql', '002_performance_indexes.sql'];

async function verifyAuth() {
  const probe = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (probe.status === 401) {
    console.error('\n🔑 Auth failed — the service-role key does not match the');
    console.error('   JWT secret on the Coolify Supabase stack. Pull the current');
    console.error('   ANON_KEY and SERVICE_ROLE_KEY from Coolify → Supabase stack');
    console.error('   → environment → {JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY}.');
    return false;
  }
  return true;
}

async function runSql(sql) {
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (!error) return { ok: true };
  return { ok: false, error };
}

async function main() {
  console.log(`Target: ${url}`);
  if (!(await verifyAuth())) process.exit(1);

  for (const file of PENDING) {
    const full = path.join(__dirname, '..', 'migrations', file);
    const sql = fs.readFileSync(full, 'utf8');
    console.log(`\n▶ ${file} (${(sql.length / 1024).toFixed(1)} KB)`);
    const result = await runSql(sql);
    if (result.ok) {
      console.log('  ✅ applied');
      continue;
    }
    if (result.error?.message?.includes('exec_sql')
        || result.error?.code === 'PGRST202'
        || /function .* does not exist/i.test(result.error?.message || '')) {
      console.log('  ⚠  exec_sql RPC missing on this instance.');
      console.log('  📋 Copy the SQL below into the Supabase SQL editor and run:');
      console.log('  ' + '─'.repeat(60));
      console.log(sql.split('\n').map((l) => '  ' + l).join('\n'));
      console.log('  ' + '─'.repeat(60));
    } else {
      console.log(`  ❌ ${result.error.code || ''} ${result.error.message}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
