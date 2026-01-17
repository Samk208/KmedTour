/**
 * Image Generation Script for KmedTour SEO Pages
 *
 * This script generates professional, modern photorealistic images for:
 * - 31 KAHF/KOIHA accredited hospitals
 * - 113 medical procedures
 *
 * Uses OpenAI DALL-E 3 API for high-quality medical imagery
 * Follows KmedTour brand design system
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  imageSize: '1792x1024', // Wide format for hero sections
  quality: 'hd',
  style: 'natural', // Photorealistic
  outputDir: {
    hospitals: path.join(__dirname, '../public/images/hospitals'),
    procedures: path.join(__dirname, '../public/images/procedures')
  }
};

// Brand colors for prompt guidance
const BRAND_COLORS = {
  primary: '#1B4DFF', // kmed-blue
  secondary: '#39C6B0', // kmed-teal
  navy: '#0C1A34', // kmed-navy
  style: 'modern, clean, bright, professional'
};

// Load hospital data
const hospitals = require('../Content Hub Data/verified_hospitals/wonlink-medicalkorea-hospitals-data.csv');

// Hospital image prompts with Korea-specific context
const HOSPITAL_PROMPTS = {
  'Asan Medical Center': {
    prompt: `A modern, world-class hospital building in Seoul, South Korea. Sleek glass and steel architecture with multiple towers, featuring the latest medical technology. Bright blue sky, clean aesthetic, professional medical environment. Wide-angle architectural photography, photorealistic, high quality, natural lighting.`,
    specialty: 'ONCOLOGY'
  },
  'BRIGHT EYE CLINIC': {
    prompt: `Modern ophthalmology clinic in Gangnam, Seoul. Premium medical interior with advanced eye surgery equipment, clean white surfaces, blue accent lighting. Professional medical environment, Korean modern design aesthetic. Photorealistic, bright, welcoming atmosphere.`,
    specialty: 'OPHTHALMOLOGY'
  },
  'Banobagi Plastic Surgery Clinic': {
    prompt: `Luxury plastic surgery clinic in Gangnam, Seoul. Premium modern interior design with elegant waiting area, advanced medical facilities visible. Sophisticated Korean medical aesthetics, clean white and blue tones. Professional photography, photorealistic, high-end medical environment.`,
    specialty: 'PLASTIC_SURGERY'
  },
  'CHA University Fertility Center Seoul Station': {
    prompt: `Modern fertility center in Seoul Square building. Contemporary medical interior with warm, welcoming atmosphere. Advanced reproductive medicine equipment, comfortable consultation areas. Professional Korean medical design, clean and hopeful ambiance. Photorealistic, natural lighting.`,
    specialty: 'FERTILITY'
  },
  'Bundang Jesaeng General Hospital': {
    prompt: `Large modern hospital complex in Bundang, Gyeonggi-do. Contemporary multi-story medical building with clean architecture, green landscaping. Professional healthcare facility, Korean modern design. Wide-angle exterior shot, photorealistic, bright daylight.`,
    specialty: 'UROLOGY'
  },
  'Busan Adventist Hospital': {
    prompt: `Modern general hospital in Busan with mountain views. Clean contemporary architecture, multiple wings, professional medical environment. Korean coastal city setting, clear blue sky. Architectural photography, photorealistic, welcoming atmosphere.`,
    specialty: 'SURGERY'
  },
  'BNviit Eye Center': {
    prompt: `High-end eye surgery center in Gangnam, Seoul. State-of-the-art ophthalmology equipment, laser vision correction technology. Clean modern interior, blue and white medical design. Professional Korean eye clinic, photorealistic, bright medical environment.`,
    specialty: 'OPHTHALMOLOGY'
  },
  'Chonnam National University Hospital': {
    prompt: `Large university hospital in Gwangju with historic reputation. Modern medical towers with extensive facilities, professional healthcare campus. Clean architecture, Korean medical excellence. Wide exterior view, photorealistic, professional medical environment.`,
    specialty: 'CARDIOLOGY'
  },
  'DM Dermatology': {
    prompt: `Premium dermatology clinic in Apgujeong, Gangnam. Luxury medical spa atmosphere, advanced skin treatment technology. Clean white interior with elegant Korean design, professional dermatology environment. Photorealistic, bright, sophisticated medical aesthetics.`,
    specialty: 'DERMATOLOGY'
  },
  'Donghoon Advanced Lengthening Reconstruction Institute': {
    prompt: `Specialized orthopedic center in Seongnam, Gyeonggi-do. Modern medical facility focused on limb reconstruction, advanced surgical technology visible. Professional Korean medical interior, clean clinical environment. Photorealistic, medical precision atmosphere.`,
    specialty: 'ORTHOPEDICS'
  }
};

// Procedure image prompts
const PROCEDURE_PROMPTS = {
  'Rhinoplasty': {
    prompt: `Professional medical illustration of rhinoplasty nose surgery procedure in modern Korean hospital. Surgical precision, advanced medical equipment, clean operating room environment. Professional medical photography, photorealistic, focused on surgical excellence and patient safety. Blue surgical drapes, modern medical technology.`,
    category: 'Cosmetic'
  },
  'Double Eyelid Surgery': {
    prompt: `Close-up of advanced double eyelid surgery procedure in premium Seoul clinic. Precise surgical technique, modern ophthalmologic tools, sterile environment. Korean aesthetic surgery excellence, professional medical photography. Photorealistic, clean medical environment.`,
    category: 'Cosmetic'
  },
  'LASIK Eye Surgery': {
    prompt: `State-of-the-art LASIK eye surgery with advanced laser equipment in modern Korean eye center. High-tech laser vision correction machine, patient receiving treatment, professional medical environment. Blue laser lights, clean sterile setting. Photorealistic medical technology photography.`,
    category: 'Eye Care'
  },
  'IVF Treatment': {
    prompt: `Modern fertility laboratory in Korean IVF center. Advanced embryology equipment, professional medical scientists working, clean laboratory environment. Hopeful medical atmosphere, cutting-edge reproductive technology. Photorealistic, bright clinical setting with warm undertones.`,
    category: 'Fertility'
  },
  'Knee Replacement': {
    prompt: `Advanced orthopedic surgery suite in Korean hospital performing knee replacement. State-of-the-art surgical equipment, professional orthopedic team, modern operating room. Medical precision, clean environment, blue surgical lighting. Photorealistic medical photography.`,
    category: 'Orthopedic'
  },
  'Dental Implants': {
    prompt: `Modern dental surgery in premium Korean dental clinic. Advanced dental implant procedure, high-tech dental equipment, professional dentist working. Clean bright dental environment, precise medical work. Photorealistic dental photography, professional medical setting.`,
    category: 'Dental'
  },
  'Liposuction': {
    prompt: `Professional body contouring surgery in modern Korean plastic surgery clinic. Advanced liposuction equipment, sterile surgical environment, professional medical team. Clean aesthetic surgery setting, modern medical technology. Photorealistic, professional medical photography.`,
    category: 'Cosmetic'
  },
  'Facelift': {
    prompt: `Premium facial rejuvenation surgery in luxury Korean plastic surgery clinic. Professional plastic surgeons performing facelift procedure, advanced surgical tools, sterile environment. Sophisticated medical setting, blue surgical drapes. Photorealistic medical photography.`,
    category: 'Cosmetic'
  },
  'Cataract Surgery': {
    prompt: `Modern cataract surgery with phacoemulsification equipment in Korean eye center. Advanced ophthalmologic surgical microscope, professional eye surgeon, sterile operating environment. Precision medical procedure, blue surgical lighting. Photorealistic medical photography.`,
    category: 'Eye Care'
  },
  'Spinal Fusion': {
    prompt: `Advanced spinal surgery in modern Korean neurosurgery center. High-tech surgical navigation equipment, professional surgical team, clean operating room. Precision spinal procedure, medical excellence. Photorealistic surgical photography, professional medical environment.`,
    category: 'Orthopedic'
  },
  'Breast Augmentation': {
    prompt: `Professional breast surgery in premium Korean plastic surgery clinic. Modern surgical suite, advanced equipment, sterile environment. Professional aesthetic surgery, clean medical setting. Photorealistic medical photography, tasteful professional presentation.`,
    category: 'Cosmetic'
  },
  'V-Line Surgery': {
    prompt: `Specialized facial contouring surgery in Korean plastic surgery center. Advanced maxillofacial surgical equipment, professional surgical team, modern operating room. Korean aesthetic surgery expertise, precision medical work. Photorealistic medical photography.`,
    category: 'Cosmetic'
  },
  'ACL Reconstruction': {
    prompt: `Arthroscopic ACL knee surgery in modern Korean sports medicine center. Advanced arthroscopic equipment, professional orthopedic surgeon, clean surgical environment. Precision sports medicine procedure, modern medical technology. Photorealistic surgical photography.`,
    category: 'Orthopedic'
  },
  'Egg Freezing': {
    prompt: `Modern cryopreservation laboratory in Korean fertility center. Advanced egg freezing technology, professional embryologists, clean laboratory environment. Hopeful fertility preservation setting, cutting-edge reproductive science. Photorealistic laboratory photography.`,
    category: 'Fertility'
  },
  'Botox Injections': {
    prompt: `Professional cosmetic dermatology treatment in luxury Korean medical spa. Precise botox injection procedure, elegant medical aesthetics environment, professional dermatologist. Clean modern setting, sophisticated Korean medical aesthetics. Photorealistic medical photography.`,
    category: 'Cosmetic'
  },
  'Hip Replacement': {
    prompt: `Advanced orthopedic surgery for hip replacement in modern Korean hospital. State-of-the-art surgical equipment, professional orthopedic team, clean operating room. Medical precision and excellence, modern surgical technology. Photorealistic medical photography.`,
    category: 'Orthopedic'
  },
  'Limb Lengthening': {
    prompt: `Specialized limb lengthening surgery center in Korea. Advanced orthopedic technology for limb reconstruction, professional surgical team, modern medical facility. Precision orthopedic procedure, clean clinical environment. Photorealistic medical photography.`,
    category: 'Orthopedic'
  },
  'Chemical Peel': {
    prompt: `Professional dermatology treatment in modern Korean medical spa. Advanced chemical peel procedure, elegant clinical environment, professional dermatologist working. Clean bright medical aesthetics setting, sophisticated Korean skincare. Photorealistic medical photography.`,
    category: 'Cosmetic'
  },
  'Porcelain Veneers': {
    prompt: `High-end cosmetic dentistry in premium Korean dental clinic. Professional dentist creating porcelain veneers, advanced dental technology, clean modern environment. Precision dental work, bright clinical setting. Photorealistic dental photography.`,
    category: 'Dental'
  },
  'SMILE Eye Surgery': {
    prompt: `Cutting-edge SMILE refractive surgery in Korean eye center. Advanced femtosecond laser equipment, professional ophthalmologist, modern surgical suite. Revolutionary vision correction technology, clean medical environment. Photorealistic medical technology photography.`,
    category: 'Eye Care'
  }
};

/**
 * Generate image using OpenAI DALL-E 3
 */
async function generateImage(prompt, outputPath) {
  if (!CONFIG.openaiApiKey) {
    console.error('❌ OPENAI_API_KEY not set in environment variables');
    return null;
  }

  const requestBody = JSON.stringify({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: CONFIG.imageSize,
    quality: CONFIG.quality,
    style: CONFIG.style
  });

  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/images/generations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.openaiApiKey}`,
      'Content-Length': requestBody.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', async () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          const imageUrl = response.data[0].url;

          // Download the image
          await downloadImage(imageUrl, outputPath);
          resolve(outputPath);
        } else {
          reject(new Error(`API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(requestBody);
    req.end();
  });
}

/**
 * Download image from URL to file
 */
function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(outputPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download image: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

/**
 * Generate sample hospital images
 */
async function generateHospitalImages() {
  console.log('\n🏥 Generating Hospital Images...\n');

  const hospitalsToGenerate = Object.keys(HOSPITAL_PROMPTS).slice(0, 10);

  for (const hospitalName of hospitalsToGenerate) {
    const slug = hospitalName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const outputPath = path.join(CONFIG.outputDir.hospitals, `${slug}.png`);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Skipping ${hospitalName} (already exists)`);
      continue;
    }

    try {
      console.log(`🎨 Generating: ${hospitalName}`);
      console.log(`   Specialty: ${HOSPITAL_PROMPTS[hospitalName].specialty}`);

      await generateImage(HOSPITAL_PROMPTS[hospitalName].prompt, outputPath);

      console.log(`✅ Saved: ${outputPath}\n`);

      // Rate limiting - wait 60 seconds between requests (DALL-E 3 limit)
      await new Promise(resolve => setTimeout(resolve, 60000));

    } catch (error) {
      console.error(`❌ Error generating ${hospitalName}:`, error.message);
    }
  }
}

/**
 * Generate sample procedure images
 */
async function generateProcedureImages() {
  console.log('\n💉 Generating Procedure Images...\n');

  const proceduresToGenerate = Object.keys(PROCEDURE_PROMPTS).slice(0, 20);

  for (const procedureName of proceduresToGenerate) {
    const slug = procedureName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const outputPath = path.join(CONFIG.outputDir.procedures, `${slug}.png`);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Skipping ${procedureName} (already exists)`);
      continue;
    }

    try {
      console.log(`🎨 Generating: ${procedureName}`);
      console.log(`   Category: ${PROCEDURE_PROMPTS[procedureName].category}`);

      await generateImage(PROCEDURE_PROMPTS[procedureName].prompt, outputPath);

      console.log(`✅ Saved: ${outputPath}\n`);

      // Rate limiting - wait 60 seconds between requests (DALL-E 3 limit)
      await new Promise(resolve => setTimeout(resolve, 60000));

    } catch (error) {
      console.error(`❌ Error generating ${procedureName}:`, error.message);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 KmedTour Image Generation Script');
  console.log('====================================\n');

  // Ensure output directories exist
  fs.mkdirSync(CONFIG.outputDir.hospitals, { recursive: true });
  fs.mkdirSync(CONFIG.outputDir.procedures, { recursive: true });

  const args = process.argv.slice(2);
  const type = args[0];

  if (!type || type === 'hospitals') {
    await generateHospitalImages();
  }

  if (!type || type === 'procedures') {
    await generateProcedureImages();
  }

  console.log('\n✨ Image generation complete!');
  console.log('\n📊 Summary:');
  console.log(`   Hospitals: ${fs.readdirSync(CONFIG.outputDir.hospitals).filter(f => f.endsWith('.png')).length} images`);
  console.log(`   Procedures: ${fs.readdirSync(CONFIG.outputDir.procedures).filter(f => f.endsWith('.png')).length} images`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateImage, HOSPITAL_PROMPTS, PROCEDURE_PROMPTS };
