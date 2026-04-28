/**
 * Seed countries, articles, testimonials, africa_regions from lib/data/*.json.
 * Run AFTER seed_db.js (which does clinics + treatments).
 *
 *   node supabase/scripts/seed_extra.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function upsertChunked(table, rows, conflictKey) {
  const CHUNK = 100;
  let success = 0;
  let failed = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const q = conflictKey
      ? supabase.from(table).upsert(chunk, { onConflict: conflictKey })
      : supabase.from(table).insert(chunk);
    const { error } = await q;
    if (error) {
      console.error(`  ${table}[${i}-${i + chunk.length}] error:`, error.message);
      failed += chunk.length;
    } else {
      success += chunk.length;
    }
    process.stdout.write('.');
  }
  console.log(`\n${table}: ${success} ok, ${failed} failed.`);
}

async function clearTable(table) {
  // delete-all so a re-run doesn't duplicate non-uniquely-keyed rows
  const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) console.error(`  warning: failed to clear ${table}:`, error.message);
}

async function main() {
  const dataDir = path.join(process.cwd(), 'lib/data');

  // 1. countries — has unique slug
  console.log('Seeding countries...');
  const countries = require(path.join(dataDir, 'countries.json'));
  const countryRows = countries.map((c) => ({
    slug: c.slug,
    external_id: c.id,
    name: c.name,
    region: c.region ?? null,
    flag: c.flag ?? null,
    visa_info: c.visaInfo ?? null,
    travel_info: c.travelInfo ?? null,
    medical_tourism_notes: c.medicalTourismNotes ?? null,
    common_treatments: c.commonTreatments ?? [],
  }));
  await upsertChunked('countries', countryRows, 'slug');

  // 2. articles — has unique slug
  console.log('Seeding articles...');
  const articles = require(path.join(dataDir, 'articles.json'));
  const articleRows = articles.map((a) => ({
    slug: a.slug,
    external_id: a.id,
    title: a.title,
    excerpt: a.excerpt ?? null,
    content: a.content ?? null,
    category: a.category ?? null,
    author: a.author ?? null,
    published_at: a.publishedAt ?? null,
    image_url: a.imageUrl ?? null,
    tags: a.tags ?? [],
  }));
  await upsertChunked('articles', articleRows, 'slug');

  // 3. testimonials — no unique constraint, clear+insert
  console.log('Seeding testimonials (clear+insert)...');
  await clearTable('testimonials');
  const testimonials = require(path.join(dataDir, 'testimonials.json'));
  const testimonialRows = testimonials.map((t) => ({
    external_id: String(t.id),
    name: t.name,
    country: t.country ?? null,
    country_code: t.countryCode ?? null,
    treatment: t.treatment ?? null,
    quote: t.quote ?? null,
    rating: t.rating ?? null,
    date: t.date ?? null,
  }));
  await upsertChunked('testimonials', testimonialRows, null);

  // 4. africa_regions — no unique constraint, clear+insert
  console.log('Seeding africa_regions (clear+insert)...');
  await clearTable('africa_regions');
  const africaWrap = require(path.join(dataDir, 'africa-regions.json'));
  const africaList = Array.isArray(africaWrap) ? africaWrap : (africaWrap.countries || []);
  const africaRows = africaList.map((r) => ({
    country_name: r.name,
    country_code: r.code,
    region: r.region ?? null,
    tips: r.tips ?? null,
  }));
  await upsertChunked('africa_regions', africaRows, null);

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
