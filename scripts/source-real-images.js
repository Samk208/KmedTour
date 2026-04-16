#!/usr/bin/env node
/**
 * Real Image Sourcing Script for KmedTour
 *
 * Downloads high-quality, royalty-free medical/hospital photos from Pexels API
 * to replace AI-generated placeholder images.
 *
 * Usage:
 *   1. Get a free API key at https://www.pexels.com/api/ (takes 30 seconds)
 *   2. Set: export PEXELS_API_KEY=your_key_here
 *   3. Run: node scripts/source-real-images.js [--hospitals] [--procedures] [--hero]
 *
 * Pexels license: Free for commercial use, no attribution required.
 * Rate limit: 200 requests/hour (free tier).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env.local so the script works without manual export
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const eqIndex = trimmed.indexOf('=');
      const key = trimmed.slice(0, eqIndex).trim();
      const val = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const HOSPITALS_DIR = path.join(PUBLIC_DIR, 'images', 'hospitals');
const PROCEDURES_DIR = path.join(PUBLIC_DIR, 'images', 'procedures');

// --- Search term mappings ---
// Maps procedure slugs to Pexels search queries for relevant real photos

const PROCEDURE_SEARCH_MAP = {
  // Cosmetic / Plastic Surgery
  'rhinoplasty': 'nose surgery consultation doctor',
  'facelift': 'facial cosmetic surgery clinic',
  'double-eyelid-surgery': 'eye surgery ophthalmology',
  'breast-augmentation': 'plastic surgery consultation',
  'liposuction': 'body contouring medical clinic',
  'tummy-tuck': 'cosmetic surgery recovery',
  'v-line-surgery': 'jaw surgery consultation',
  'botox-injections': 'dermatology cosmetic treatment',
  'hair-transplant': 'hair restoration clinic',
  'gynecomastia-surgery': 'male cosmetic surgery',
  'chemical-peel': 'dermatology skin treatment',
  'laser-skin-resurfacing': 'laser dermatology clinic',
  'skin-whitening-treatment': 'dermatology skincare clinic',

  // Eye Surgery
  'lasik-eye-surgery': 'lasik eye surgery clinic',
  'lasek-eye-surgery': 'eye laser surgery',
  'smile-eye-surgery': 'ophthalmology eye exam',
  'cataract-surgery': 'cataract eye surgery',
  'corneal-transplant': 'eye surgery operating room',

  // Dental
  'dental-implants': 'dental implant clinic',
  'porcelain-veneers': 'dental veneer smile',
  'teeth-whitening': 'dental whitening clinic',
  'full-mouth-reconstruction': 'dental reconstruction clinic',

  // Orthopedic
  'knee-replacement': 'knee surgery orthopedic',
  'hip-replacement': 'hip surgery hospital',
  'acl-reconstruction': 'knee rehabilitation sports medicine',
  'spinal-fusion': 'spine surgery hospital',
  'limb-lengthening': 'orthopedic surgery clinic',

  // Fertility / Women's Health
  'ivf-treatment': 'fertility clinic ivf',
  'egg-freezing': 'fertility preservation clinic',
  'fertility-consultation': 'fertility doctor consultation',
  'preimplantation-genetic-testing': 'genetic testing laboratory',
  'prenatal-care-package': 'prenatal care pregnant doctor',
  'hysterectomy': 'gynecology surgery hospital',

  // Cancer / Oncology
  'cancer-screening-package': 'cancer screening medical',
  'lung-cancer-surgery': 'thoracic surgery hospital',
  'brain-tumor-surgery': 'neurosurgery operating room',

  // Cardiac
  'coronary-artery-bypass-grafting': 'cardiac surgery hospital',
  'tavi-procedure': 'cardiac catheterization',

  // Bariatric
  'gastric-bypass': 'bariatric surgery consultation',
  'gastric-sleeve': 'weight loss surgery clinic',

  // Screening / General
  'comprehensive-health-screening': 'health checkup screening',
  'colonoscopy-screening': 'endoscopy clinic',
  'endoscopy': 'endoscopy medical procedure',

  // ENT
  'septoplasty': 'ent surgery clinic',
  'sinus-surgery': 'ent nasal surgery',
  'tonsillectomy': 'ent throat surgery',

  // Urology
  'prostate-surgery': 'urology surgery hospital',
  'kidney-stone-removal': 'urology kidney treatment',

  // Other
  'hemorrhoid-surgery': 'colorectal surgery clinic',
  'varicose-vein-treatment': 'vascular surgery clinic',
  'thyroid-surgery': 'thyroid surgery hospital',
  'lung-transplantation': 'organ transplant hospital',
  'pediatric-surgery': 'pediatric surgery children hospital',
};

// Generic hospital search terms
const HOSPITAL_SEARCH_TERMS = [
  'modern hospital building korea',
  'medical center building asia',
  'hospital lobby reception modern',
  'korean hospital exterior',
  'medical facility building',
  'hospital entrance modern',
  'clinic building professional',
  'healthcare facility modern',
];

// --- API Functions ---

function pexelsSearch(query, perPage = 1, orientation = 'landscape') {
  return new Promise((resolve, reject) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=${orientation}&size=medium`;

    const options = {
      headers: { Authorization: PEXELS_API_KEY },
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(json.error));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        https.get(res.headers.location, (redirectRes) => {
          redirectRes.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', (err) => { fs.unlink(destPath, () => {}); reject(err); });
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlink(destPath, () => {}); reject(err); });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Main Logic ---

async function sourceProcedureImages(slugs) {
  console.log(`\n--- Sourcing ${slugs.length} procedure images ---\n`);
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const slug of slugs) {
    const searchTerm = PROCEDURE_SEARCH_MAP[slug] || `${slug.replace(/-/g, ' ')} medical`;
    const destPath = path.join(PROCEDURES_DIR, `${slug}.jpg`);

    // Skip if we already have a .jpg (real photo already downloaded)
    if (fs.existsSync(destPath)) {
      console.log(`  SKIP ${slug} (already has .jpg)`);
      skipped++;
      continue;
    }

    try {
      console.log(`  SEARCH "${searchTerm}"...`);
      const result = await pexelsSearch(searchTerm, 3);

      if (!result.photos || result.photos.length === 0) {
        console.log(`  MISS  ${slug} — no results for "${searchTerm}"`);
        failed++;
        continue;
      }

      // Pick the best photo (first result, medium size)
      const photo = result.photos[0];
      const imageUrl = photo.src.medium; // 350x250ish, good for cards

      console.log(`  DOWNLOAD ${slug} from Pexels (photo ${photo.id} by ${photo.photographer})`);
      await downloadImage(imageUrl, destPath);

      // Save attribution (good practice even though Pexels doesn't require it)
      const attrPath = path.join(PROCEDURES_DIR, `${slug}.attribution.json`);
      fs.writeFileSync(attrPath, JSON.stringify({
        source: 'pexels',
        photoId: photo.id,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        pexelsUrl: photo.url,
        license: 'Pexels License (free for commercial use)',
        downloadedAt: new Date().toISOString(),
      }, null, 2));

      downloaded++;
      await sleep(400); // Stay well under rate limit
    } catch (err) {
      console.log(`  ERROR ${slug}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nProcedures: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`);
}

async function sourceHospitalImages() {
  console.log(`\n--- Sourcing hospital images ---\n`);

  // Read clinics.json for hospital names
  const clinicsPath = path.join(__dirname, '..', 'lib', 'data', 'clinics.json');
  const clinics = JSON.parse(fs.readFileSync(clinicsPath, 'utf-8'));

  let downloaded = 0;
  let termIndex = 0;

  for (const clinic of clinics) {
    const destPath = path.join(HOSPITALS_DIR, `${clinic.slug}.jpg`);

    if (fs.existsSync(destPath)) {
      console.log(`  SKIP ${clinic.slug} (already has .jpg)`);
      continue;
    }

    const searchTerm = HOSPITAL_SEARCH_TERMS[termIndex % HOSPITAL_SEARCH_TERMS.length];
    termIndex++;

    try {
      console.log(`  SEARCH "${searchTerm}" for ${clinic.name}...`);
      const result = await pexelsSearch(searchTerm, 5);

      if (!result.photos || result.photos.length === 0) {
        console.log(`  MISS  ${clinic.slug}`);
        continue;
      }

      // Use different photos for different hospitals
      const photoIndex = termIndex % result.photos.length;
      const photo = result.photos[photoIndex];
      const imageUrl = photo.src.medium;

      console.log(`  DOWNLOAD ${clinic.slug} (photo ${photo.id})`);
      await downloadImage(imageUrl, destPath);

      const attrPath = path.join(HOSPITALS_DIR, `${clinic.slug}.attribution.json`);
      fs.writeFileSync(attrPath, JSON.stringify({
        source: 'pexels',
        photoId: photo.id,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        pexelsUrl: photo.url,
        license: 'Pexels License (free for commercial use)',
        downloadedAt: new Date().toISOString(),
      }, null, 2));

      downloaded++;
      await sleep(400);
    } catch (err) {
      console.log(`  ERROR ${clinic.slug}: ${err.message}`);
    }
  }

  console.log(`\nHospitals: ${downloaded} downloaded`);
}

async function sourceHeroImage() {
  console.log(`\n--- Sourcing hero image ---\n`);

  const searchTerm = 'modern medical hospital korea interior professional';
  const destPath = path.join(PUBLIC_DIR, 'hero-medical-korea.jpg');

  try {
    const result = await pexelsSearch(searchTerm, 5, 'landscape');
    if (result.photos && result.photos.length > 0) {
      const photo = result.photos[0];
      console.log(`  DOWNLOAD hero image (photo ${photo.id} by ${photo.photographer})`);
      await downloadImage(photo.src.large, destPath); // Large for hero
      console.log(`  Saved to ${destPath}`);
    }
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
  }
}

// --- CLI ---

async function main() {
  if (!PEXELS_API_KEY) {
    console.error(`
ERROR: PEXELS_API_KEY not set.

Get a free API key in 30 seconds:
  1. Go to https://www.pexels.com/api/
  2. Sign up / log in
  3. Copy your API key
  4. Run: export PEXELS_API_KEY=your_key_here
  5. Re-run this script
`);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const doAll = args.length === 0;
  const doHospitals = doAll || args.includes('--hospitals');
  const doProcedures = doAll || args.includes('--procedures');
  const doHero = doAll || args.includes('--hero');

  console.log('KmedTour Image Sourcing — Pexels API (free, royalty-free)');
  console.log('=========================================================');

  // Get list of procedure slugs from existing files
  const existingProcedures = fs.readdirSync(PROCEDURES_DIR)
    .filter(f => f.endsWith('.png'))
    .map(f => f.replace('.png', ''));

  if (doHero) await sourceHeroImage();
  if (doProcedures) await sourceProcedureImages(existingProcedures);
  if (doHospitals) await sourceHospitalImages();

  console.log('\n--- Done! ---');
  console.log('Next steps:');
  console.log('  1. Review downloaded .jpg files in public/images/');
  console.log('  2. Update image references in code to prefer .jpg over .png');
  console.log('  3. Delete old AI-generated .png files you no longer need');
}

main().catch(console.error);
