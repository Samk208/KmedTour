/**
 * Execution Script: Seed Content
 * Usage: node execution/seed_content.js
 * 
 * internal usage: Reads CSVs from 'Content Hub Data' and updates 'lib/data/*.json'
 */

const fs = require('fs');
const path = require('path');

// Paths
const CONTENT_HUB_DIR = path.join(process.cwd(), 'Content Hub Data');
const TARGET_DATA_DIR = path.join(process.cwd(), 'lib/data');

const HOSPITALS_CSV = path.join(CONTENT_HUB_DIR, 'verified_hospitals', 'wonlink-medicalkorea-hospitals-data.csv');
const PUBLIC_HOSPITALS_CSV = path.join(CONTENT_HUB_DIR, 'verified_hospitals', 'wonlink-medicalkorea-hospitals-public.csv');
const PROCEDURES_CSV = path.join(CONTENT_HUB_DIR, 'verified_procedures', 'wonlink-procedures-all-merged.csv');
const MAPPINGS_CSV = path.join(CONTENT_HUB_DIR, 'hospital_procedure_mappings', 'wonlink-hospital-procedures-mapping.csv');
const IMAGES_MAP_JSON = path.join(CONTENT_HUB_DIR, 'hospital_images_map.json');

// Regex to parse CSV lines handling quotes
const CSV_PATTERN = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
const HOSPITAL_HEADERS = [
    'Hospital_ID',
    'Hospital_Name',
    'Region',
    'Hospital_Type',
    'Address',
    'Website',
    'Instagram',
    'Number_of_Doctors',
    'Number_of_Beds',
    'Email',
    'Phone',
    'Interpretation',
    'Meal',
    'Pickup',
    'Accreditation',
    'Other_Services',
    'Specialties'
];

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = parseLine(lines[0]);
    return lines.slice(1).map(line => {
        const values = parseLine(line);
        return headers.reduce((obj, header, index) => {
            const key = header.trim();
            // Handle potentially missing values at end of line
            const val = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
            obj[key] = val;
            return obj;
        }, {});
    });
}

function parseLine(line) {
    const result = [];
    let startValue = 0;
    let inQuotes = false;
    for (let current = 0; current < line.length; current++) {
        const char = line[current];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(line.substring(startValue, current));
            startValue = current + 1;
        }
    }
    result.push(line.substring(startValue));
    return result;
}

function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

async function seed() {
    console.log('🌱 Starting Content Seed...');

    // Store data in memory for cross-referencing
    let clinicsData = [];
    let treatmentsData = [];
    let imageMap = {};

    if (fs.existsSync(IMAGES_MAP_JSON)) {
        console.log(`... Reading Image Map from ${IMAGES_MAP_JSON}`);
        imageMap = JSON.parse(fs.readFileSync(IMAGES_MAP_JSON, 'utf-8'));
    }

    // 1. Process Clinics
    const hospitalsCsvPath = fs.existsSync(PUBLIC_HOSPITALS_CSV) ? PUBLIC_HOSPITALS_CSV : HOSPITALS_CSV;

    if (fs.existsSync(hospitalsCsvPath)) {
        console.log(`... Reading Hospitals from ${hospitalsCsvPath}${hospitalsCsvPath === PUBLIC_HOSPITALS_CSV ? ' (public/redacted)' : ''}`);
        const csvContent = fs.readFileSync(hospitalsCsvPath, 'utf-8');
        const rows = parseCSV(csvContent);

        // If public/redacted file is missing, generate it from the full CSV
        if (hospitalsCsvPath === HOSPITALS_CSV && !fs.existsSync(PUBLIC_HOSPITALS_CSV)) {
            console.log('... Generating redacted public hospitals CSV (no phone/email, city-only address)');
            const sanitizedLines = rows.map(row => {
                const redacted = {
                    ...row,
                    Address: row.Region,
                    Email: '',
                    Phone: ''
                };
                return HOSPITAL_HEADERS.map(key => {
                    const val = redacted[key] || '';
                    return val.includes(',') ? `"${val}"` : val;
                }).join(',');
            });
            const publicCsv = [HOSPITAL_HEADERS.join(','), ...sanitizedLines].join('\n');
            fs.writeFileSync(PUBLIC_HOSPITALS_CSV, publicCsv);
            console.log(`✅ Wrote redacted hospitals CSV to ${PUBLIC_HOSPITALS_CSV}`);
        }

        clinicsData = rows.map(row => ({
            id: row.Hospital_ID || `hosp_${Math.random().toString(36).substr(2, 9)}`,
            slug: slugify(row.Hospital_Name),
            name: row.Hospital_Name,
            description: row.Other_Services || `${row.Hospital_Name} is a premier medical facility in ${row.Region}.`,
            // Redact precise address to avoid direct outreach; keep region/city for SEO pages
            location: row.Region,
            address: row.Region,
            specialties: row.Specialties ? row.Specialties.split(',').map(s => s.trim()) : [],
            accreditations: row.Accreditation ? row.Accreditation.split(';').map(s => s.trim()) : [],
            internationalPatients: "Yes",
            languagesSupported: row.Interpretation ? row.Interpretation.split(',').map(s => s.trim()) : ['English'],
            // Defaults as strictly required by schema might be missing in CSV
            highlights: ["KAHF/KOIHA Accredited", "KmedTour Concierge First"],
            highlights: ["KAHF/KOIHA Accredited", "KmedTour Concierge First"],
            facilities: row.Meal ? [row.Meal] : [],
            imageUrl: imageMap[slugify(row.Hospital_Name)] || imageMap['default'],
            doctors: []
        }));

        fs.writeFileSync(path.join(TARGET_DATA_DIR, 'clinics.json'), JSON.stringify(clinicsData, null, 2));
        console.log(`✅ Wrote ${clinicsData.length} clinics to lib/data/clinics.json`);
    } else {
        console.warn(`⚠️  Hospitals CSV not found at ${HOSPITALS_CSV}`);
    }

    // 2. Process Procedures
    if (fs.existsSync(PROCEDURES_CSV)) {
        console.log(`... Reading Procedures from ${PROCEDURES_CSV}`);
        const csvContent = fs.readFileSync(PROCEDURES_CSV, 'utf-8');
        const rows = parseCSV(csvContent);

        treatmentsData = rows.map(row => ({
            id: row.procedure_id,
            slug: row.procedure_slug || slugify(row.procedure_name),
            title: row.procedure_name,
            shortDescription: row.procedure_name, // fallback
            description: row.clinical_notes || `Comprehensive guide to ${row.procedure_name} in South Korea.`,
            priceRange: `$${row.typical_cost_min_usd} - $${row.typical_cost_max_usd}`,
            priceNote: "Estimated cost including basic procedure fees.",
            duration: `${row.avg_duration_days} days`,
            successRate: "95%+", // Placeholder based on general KR stats
            category: row.category,
            imageUrl: `/images/procedures/${row.procedure_slug}.jpg`,
            highlights: row.search_keywords ? row.search_keywords.split(',').map(s => s.trim()) : []
        }));

        fs.writeFileSync(path.join(TARGET_DATA_DIR, 'treatments.json'), JSON.stringify(treatmentsData, null, 2));
        console.log(`✅ Wrote ${treatmentsData.length} treatments to lib/data/treatments.json`);
    } else {
        console.warn(`⚠️  Procedures CSV not found at ${PROCEDURES_CSV}`);
    }

    // 3. Process Mappings & pSEO Data
    if (fs.existsSync(MAPPINGS_CSV) && clinicsData.length > 0 && treatmentsData.length > 0) {
        console.log(`... Reading Mappings from ${MAPPINGS_CSV}`);
        const csvContent = fs.readFileSync(MAPPINGS_CSV, 'utf-8');
        const rows = parseCSV(csvContent);

        // Lookup maps
        const hospitalLocationMap = clinicsData.reduce((acc, c) => {
            acc[c.id] = c.location;
            return acc;
        }, {});

        const treatmentSlugMap = treatmentsData.reduce((acc, t) => {
            acc[t.id] = t.slug;
            return acc;
        }, {});

        // Process mappings
        const mappings = rows.map(row => ({
            hospitalId: row.hospital_id,
            procedureId: row.procedure_id,
            verified: row.verified === 'true'
        })).filter(m => m.hospitalId && m.procedureId);

        fs.writeFileSync(path.join(TARGET_DATA_DIR, 'mappings.json'), JSON.stringify(mappings, null, 2));
        console.log(`✅ Wrote ${mappings.length} mappings to lib/data/mappings.json`);

        // Generate City Procedures (Combinations)
        const cityProceduresSet = new Set();
        const cityProcedures = [];

        mappings.forEach(m => {
            const city = hospitalLocationMap[m.hospitalId];
            const procSlug = treatmentSlugMap[m.procedureId];

            if (city && procSlug) {
                const citySlug = slugify(city);
                const comboKey = `${citySlug}|${procSlug}`;

                if (!cityProceduresSet.has(comboKey)) {
                    cityProceduresSet.add(comboKey);
                    cityProcedures.push({
                        city: city,
                        citySlug: citySlug,
                        procedureSlug: procSlug
                    });
                }
            }
        });

        fs.writeFileSync(path.join(TARGET_DATA_DIR, 'city-procedures.json'), JSON.stringify(cityProcedures, null, 2));
        console.log(`✅ Wrote ${cityProcedures.length} city+procedure combinations to lib/data/city-procedures.json`);

        // Generate Locations List
        const locations = [...new Set(clinicsData.map(c => c.location).filter(Boolean))].map(loc => ({
            name: loc,
            slug: slugify(loc)
        }));
        fs.writeFileSync(path.join(TARGET_DATA_DIR, 'locations.json'), JSON.stringify(locations, null, 2));
        console.log(`✅ Wrote ${locations.length} locations to lib/data/locations.json`);

    } else {
        console.warn('⚠️  Skipping mappings: Mappings CSV missing or no base data available.');
    }
}

seed().catch(console.error);
