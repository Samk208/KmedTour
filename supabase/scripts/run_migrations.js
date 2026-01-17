/**
 * Migration Runner for KmedTour Medical Tourism Operating System
 *
 * This script runs all SQL migrations in order against the Supabase database.
 *
 * Usage:
 *   node supabase/scripts/run_migrations.js
 *
 * Environment:
 *   Requires .env.local with:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// Migration files in order
const MIGRATIONS = [
  '001_journey_state_machine.sql',
  '002_journey_events.sql',
  '003_bookings.sql',
  '004_notifications.sql',
  '005_enhanced_quotes.sql',
];

async function runMigration(filename) {
  const filePath = path.join(__dirname, '..', 'migrations', filename);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${filename}`);
    return false;
  }

  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`\n📄 Running migration: ${filename}`);
  console.log(`   File size: ${(sql.length / 1024).toFixed(2)} KB`);

  try {
    // Split by semicolons but be careful with function bodies
    // For complex migrations, we run the whole file at once
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If RPC doesn't exist, try direct execution via REST API
      console.log('   Attempting direct SQL execution...');

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response.ok) {
        // Fall back to logging instructions
        console.log('   ⚠️  Direct execution not available.');
        console.log('   📋 Please run this migration manually in Supabase SQL Editor:');
        console.log(`      ${supabaseUrl}/project/default/sql`);
        return 'manual';
      }
    }

    console.log(`   ✅ Migration completed: ${filename}`);
    return true;

  } catch (err) {
    console.error(`   ❌ Migration failed: ${filename}`);
    console.error(`   Error: ${err.message}`);
    return false;
  }
}

async function checkMigrationStatus() {
  console.log('\n🔍 Checking current database state...\n');

  // Check if journey_state enum exists
  const { data: enumCheck } = await supabase
    .from('pg_type')
    .select('typname')
    .eq('typname', 'journey_state')
    .single();

  if (enumCheck) {
    console.log('   ✅ journey_state enum exists');
  } else {
    console.log('   ⏳ journey_state enum needs to be created');
  }

  // Check tables
  const tables = ['journey_events', 'bookings', 'notifications', 'notification_templates'];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error && error.code === 'PGRST116') {
      console.log(`   ⏳ ${table} table needs to be created`);
    } else if (error) {
      console.log(`   ⚠️  ${table}: ${error.message}`);
    } else {
      console.log(`   ✅ ${table} exists (${count || 0} rows)`);
    }
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     KmedTour Medical Tourism OS - Migration Runner         ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Database: ${supabaseUrl.substring(0, 45)}...  ║`);
  console.log('╚════════════════════════════════════════════════════════════╝');

  await checkMigrationStatus();

  console.log('\n📦 Running migrations...');

  const results = {
    success: [],
    failed: [],
    manual: []
  };

  for (const migration of MIGRATIONS) {
    const result = await runMigration(migration);

    if (result === true) {
      results.success.push(migration);
    } else if (result === 'manual') {
      results.manual.push(migration);
    } else {
      results.failed.push(migration);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 Migration Summary');
  console.log('═'.repeat(60));

  if (results.success.length > 0) {
    console.log(`\n✅ Successful (${results.success.length}):`);
    results.success.forEach(m => console.log(`   - ${m}`));
  }

  if (results.manual.length > 0) {
    console.log(`\n📋 Requires manual execution (${results.manual.length}):`);
    results.manual.forEach(m => console.log(`   - ${m}`));
    console.log(`\n   Please run these migrations in Supabase SQL Editor:`);
    console.log(`   ${supabaseUrl}/project/default/sql`);
  }

  if (results.failed.length > 0) {
    console.log(`\n❌ Failed (${results.failed.length}):`);
    results.failed.forEach(m => console.log(`   - ${m}`));
  }

  console.log('\n' + '═'.repeat(60));

  // Provide SQL Editor instructions
  console.log('\n📝 To run migrations manually:');
  console.log('   1. Go to Supabase SQL Editor');
  console.log('   2. Copy contents of each migration file');
  console.log('   3. Paste and run in order (001 → 005)');
  console.log(`\n   Migration files location:`);
  console.log(`   ${path.join(__dirname, '..', 'migrations')}`);
}

main().catch(console.error);
