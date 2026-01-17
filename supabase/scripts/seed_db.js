/**
 * Database Seeding Script
 * Usage: node execution/seed_db.js
 * 
 * Reads lib/data/*.json and pushes to Supabase
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTable(tableName, filePath, transformFn) {
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Skipping ${tableName}: File not found at ${filePath}`);
        return;
    }

    console.log(`\n📦 Seeding ${tableName}...`);
    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const data = transformFn ? rawData.map(transformFn) : rawData;

    // Insert in chunks of 100 to avoid timeouts
    const CHUNK_SIZE = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE);
        const { error } = await supabase.from(tableName).upsert(chunk, { onConflict: 'slug' });

        if (error) {
            console.error(`Status ${i}-${i + chunk.length}: ❌ Error: ${error.message}`);
            errorCount += chunk.length;
        } else {
            successCount += chunk.length;
        }
        process.stdout.write('.');
    }

    console.log(`\n✅ ${tableName}: ${successCount} upserted, ${errorCount} failed.`);
}

// Transform functions to match DB schema if needed
const mapClinic = (c) => ({
    slug: c.slug,
    external_id: c.id.toString(),
    name: c.name,
    description: c.description || '',
    short_description: c.description ? c.description.substring(0, 150) : '',
    location: c.location,
    address: c.address,
    specialties: c.specialties,
    accreditations: c.accreditations,
    international_patients: c.internationalPatients,
    languages_supported: c.languagesSupported,
    highlights: c.highlights,
    facilities: c.facilities,
    image_url: c.imageUrl,
    doctors: c.doctors,
    api_integration_level: 'NONE', // Default for Deep Tech
    booking_webhook_url: null
});

const mapTreatment = (t) => ({
    slug: t.slug,
    external_id: t.id.toString(),
    title: t.title,
    short_description: t.shortDescription,
    description: t.description,
    price_range: t.priceRange,
    price_note: t.priceNote,
    duration: t.duration,
    success_rate: t.successRate,
    category: t.category,
    image_url: t.imageUrl,
    highlights: t.highlights
});

async function main() {
    console.log('🚀 Starting Database Seed...');

    await seedTable('clinics', path.join(process.cwd(), 'lib/data/clinics.json'), mapClinic);
    await seedTable('treatments', path.join(process.cwd(), 'lib/data/treatments.json'), mapTreatment);

    console.log('\n✨ Database seeding complete!');
}

main().catch(console.error);
