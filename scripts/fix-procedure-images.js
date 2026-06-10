#!/usr/bin/env node
/**
 * Fix + optimize procedure images.
 *
 * 1. For every treatment in lib/data/treatments.json whose referenced .png is
 *    missing, download a real photo from Pexels (royalty-free, commercial use)
 *    and save it as an optimized PNG at the exact referenced path.
 * 2. Optimize every PNG in public/images/procedures (resize to <=1600px wide,
 *    palette quantization) so cards do not ship multi-MB images.
 *
 * Usage:
 *   node scripts/fix-procedure-images.js            # source missing + optimize all
 *   node scripts/fix-procedure-images.js --dry-run  # report only
 *
 * Requires PEXELS_API_KEY in .env.local (same key source-real-images.js uses).
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
const sharp = require('sharp')

// Load .env.local without printing values
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim()
    if (t && !t.startsWith('#') && t.includes('=')) {
      const i = t.indexOf('=')
      const k = t.slice(0, i).trim()
      if (!process.env[k]) process.env[k] = t.slice(i + 1).trim()
    }
  }
}

const PEXELS_API_KEY = process.env.PEXELS_API_KEY
const DRY_RUN = process.argv.includes('--dry-run')
const PROCEDURES_DIR = path.join(__dirname, '..', 'public', 'images', 'procedures')
const TREATMENTS = require('../lib/data/treatments.json')

const MAX_WIDTH = 1600
const PNG_OPTS = { palette: true, quality: 80, effort: 7 }

// Curated Pexels queries for slugs the original PROCEDURE_SEARCH_MAP misses.
const SEARCH_MAP = {
  'acne-scar-removal': 'dermatology laser skin treatment',
  'skin-whitening': 'dermatology skincare clinic',
  'prenatal-care': 'prenatal care pregnant doctor',
  'health-screening': 'health checkup screening doctor',
  'cancer-screening': 'cancer screening medical scan',
  'cardiac-screening': 'cardiology heart checkup',
  colonoscopy: 'endoscopy clinic procedure',
  'korean-medicine': 'traditional asian herbal medicine',
  acupuncture: 'acupuncture treatment',
  'cupping-therapy': 'cupping therapy back',
  'herbal-medicine': 'herbal medicine traditional',
  'coronary-bypass': 'cardiac surgery hospital',
  angioplasty: 'cardiac catheterization lab',
  'pacemaker-implantation': 'cardiology hospital monitor',
  'pulmonary-treatment': 'pulmonology lung doctor xray',
  'neonatal-care': 'neonatal intensive care nurse',
  'laparoscopic-gastric-cancer': 'laparoscopic surgery operating room',
  'endoscopic-submucosal-dissection': 'endoscopy medical procedure',
  'living-donor-liver-transplant': 'organ transplant surgery',
  'radiofrequency-ablation-liver': 'interventional radiology hospital',
  'laparoscopic-colorectal-surgery': 'laparoscopic surgery hospital',
  'sphincter-saving-procedure': 'colorectal surgery clinic',
  'sentinel-lymph-node-biopsy': 'oncology surgery hospital',
  'breast-conserving-surgery': 'breast cancer surgery hospital',
  'endoscopic-thyroidectomy': 'thyroid surgery hospital',
  'robotic-thyroidectomy': 'robotic surgery operating room',
  bronchoplasty: 'thoracic surgery hospital',
  'stereotactic-radiation-therapy': 'radiation therapy machine',
  'proton-therapy': 'radiation oncology machine',
  cyberknife: 'radiation therapy equipment',
  'heart-transplant': 'cardiac surgery operating room',
  'percutaneous-coronary-intervention': 'cardiac catheterization',
  'congenital-heart-defect-surgery': 'pediatric cardiac surgery',
  'neonatal-heart-surgery': 'neonatal intensive care',
  'minimally-invasive-spine-surgery': 'spine surgery hospital',
  'transforaminal-endoscopic-discectomy': 'spine surgery operating room',
  'open-microdiscectomy': 'spine surgery hospital',
  'spinal-decompression-surgery': 'spine surgery hospital',
  'ube-spinal-surgery': 'endoscopic spine surgery',
  'scoliosis-correction-surgery': 'spine xray doctor',
  'in-vitro-maturation': 'fertility laboratory embryo',
  'ovarian-tissue-cryopreservation': 'cryopreservation laboratory',
  'time-lapse-embryo-monitoring': 'embryology laboratory microscope',
  'microsurgical-tese': 'fertility laboratory microscope',
  'single-port-laparoscopic-surgery': 'laparoscopic surgery',
  'robotic-reproductive-surgery': 'robotic surgery hospital',
  'dental-implant-surgery': 'dental implant clinic',
  'prosthodontic-treatment': 'dental prosthetics clinic',
  'orthodontic-treatment': 'orthodontist braces clinic',
  'periodontal-treatment': 'dental clinic treatment',
  'conservative-dentistry': 'dentist clinic treatment',
  'oral-maxillofacial-surgery': 'oral surgery clinic',
  'digital-guided-implant-surgery': 'digital dentistry scanner',
  'living-donor-kidney-transplant': 'organ transplant surgery hospital',
  'abo-incompatible-transplant': 'transplant surgery operating room',
  'exchange-donor-kidney-transplant': 'kidney transplant hospital',
  'dual-donor-liver-transplant': 'liver transplant surgery',
  'robotic-transplant-surgery': 'robotic surgery operating room',
  'lung-transplant': 'thoracic surgery hospital',
  'pancreas-transplant': 'transplant surgery hospital',
  'small-intestine-transplant': 'abdominal surgery operating room',
  'cornea-transplant': 'eye surgery ophthalmology',
  'cardiovascular-physiology-assessment': 'cardiology stress test',
  'radial-artery-approach-pci': 'cardiac catheterization lab',
  'left-main-coronary-intervention': 'cardiology angiogram',
  'rehabilitation-therapy': 'physical therapy rehabilitation',
}

function pexelsSearch(query, perPage = 5) {
  return new Promise((resolve, reject) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`
    https
      .get(url, { headers: { Authorization: PEXELS_API_KEY } }, (res) => {
        let data = ''
        res.on('data', (c) => (data += c))
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            json.error ? reject(new Error(json.error)) : resolve(json)
          } catch (e) {
            reject(new Error(`bad response (${res.statusCode}): ${data.slice(0, 120)}`))
          }
        })
      })
      .on('error', reject)
  })
}

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return download(res.headers.location).then(resolve, reject)
        }
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => resolve(Buffer.concat(chunks)))
      })
      .on('error', reject)
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function optimizeToPng(inputBuffer, destPath) {
  const img = sharp(inputBuffer)
  const meta = await img.metadata()
  let p = img
  if (meta.width > MAX_WIDTH) p = p.resize({ width: MAX_WIDTH })
  await p.png(PNG_OPTS).toFile(destPath)
}

async function main() {
  const missing = TREATMENTS.filter(
    (t) => !fs.existsSync(path.join(__dirname, '..', 'public', t.imageUrl.replace(/^\//, '')))
  )
  console.log(`treatments: ${TREATMENTS.length}, missing images: ${missing.length}`)

  if (DRY_RUN) {
    missing.forEach((t) => console.log(`  MISSING ${t.slug}`))
    return
  }

  if (missing.length && !PEXELS_API_KEY) {
    console.error('PEXELS_API_KEY not set — cannot source missing images.')
    process.exit(2)
  }

  // 1. Source missing images. Rotate result index per query so identical
  //    queries do not all get the same photo.
  const queryUse = {}
  let ok = 0,
    fail = 0
  for (const t of missing) {
    const slug = t.slug
    const query = SEARCH_MAP[slug] || `${slug.replace(/-/g, ' ')} medical`
    const destPath = path.join(PROCEDURES_DIR, `${slug}.png`)
    try {
      const result = await pexelsSearch(query)
      if (!result.photos || result.photos.length === 0) {
        console.log(`  MISS ${slug} ("${query}")`)
        fail++
        continue
      }
      const idx = (queryUse[query] = (queryUse[query] ?? -1) + 1)
      const photo = result.photos[idx % result.photos.length]
      const buf = await download(photo.src.large2x || photo.src.large)
      await optimizeToPng(buf, destPath)
      fs.writeFileSync(
        path.join(PROCEDURES_DIR, `${slug}.attribution.json`),
        JSON.stringify(
          {
            source: 'pexels',
            photo_id: photo.id,
            photographer: photo.photographer,
            photographer_url: photo.photographer_url,
            pexels_url: photo.url,
            query,
            license: 'Pexels License — free for commercial use, no attribution required',
          },
          null,
          2
        )
      )
      const kb = Math.round(fs.statSync(destPath).size / 1024)
      console.log(`  OK   ${slug} <- pexels ${photo.id} (${kb} KB)`)
      ok++
      await sleep(400) // stay well under 200 req/hr burst behavior
    } catch (e) {
      console.log(`  FAIL ${slug}: ${e.message}`)
      fail++
    }
  }
  console.log(`sourced: ${ok} ok, ${fail} failed`)

  // 2. Optimize every PNG in the procedures dir (skip already-small files).
  let optimized = 0,
    savedBytes = 0
  for (const f of fs.readdirSync(PROCEDURES_DIR).filter((f) => f.endsWith('.png'))) {
    const full = path.join(PROCEDURES_DIR, f)
    const before = fs.statSync(full).size
    if (before < 400 * 1024) continue
    const tmp = full + '.tmp'
    try {
      await optimizeToPng(fs.readFileSync(full), tmp)
      const after = fs.statSync(tmp).size
      if (after < before) {
        fs.renameSync(tmp, full)
        optimized++
        savedBytes += before - after
        console.log(`  OPT  ${f}: ${Math.round(before / 1024)} -> ${Math.round(after / 1024)} KB`)
      } else {
        fs.unlinkSync(tmp)
      }
    } catch (e) {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp)
      console.log(`  SKIP ${f}: ${e.message}`)
    }
  }
  console.log(`optimized: ${optimized} files, saved ${Math.round(savedBytes / 1048576)} MB`)

  // Final coverage check
  const stillMissing = TREATMENTS.filter(
    (t) => !fs.existsSync(path.join(__dirname, '..', 'public', t.imageUrl.replace(/^\//, '')))
  )
  console.log(`FINAL: ${TREATMENTS.length - stillMissing.length}/${TREATMENTS.length} treatments have images`)
  if (stillMissing.length) stillMissing.forEach((t) => console.log(`  STILL MISSING ${t.slug}`))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
