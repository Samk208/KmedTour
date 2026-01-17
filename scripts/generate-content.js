/**
 * Content Generation Script for KmedTour pSEO Pages
 *
 * Generates 1,000-1,500 word SEO-optimized content using AI
 * Uses Claude API (Anthropic) or OpenAI GPT-4
 *
 * Usage:
 *   node scripts/generate-content.js procedure rhinoplasty
 *   node scripts/generate-content.js hospital asan-medical-center
 *   node scripts/generate-content.js city seoul rhinoplasty
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Import prompts
const {
  generateProcedurePrompt,
  generateHospitalPrompt,
  generateCityProcedurePrompt
} = require('./ai-prompts.js');

// Configuration
const CONFIG = {
  provider: process.env.AI_PROVIDER || 'anthropic', // 'anthropic' or 'openai'
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
  model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022', // or 'gpt-4'
  outputDir: path.join(__dirname, '../content/generated'),
};

// Load data
const proceduresCSV = fs.readFileSync(
  path.join(__dirname, '../Content Hub Data/verified_procedures/wonlink-procedures-all-merged.csv'),
  'utf-8'
);

const hospitalsCSV = fs.readFileSync(
  path.join(__dirname, '../Content Hub Data/verified_hospitals/wonlink-medicalkorea-hospitals-data.csv'),
  'utf-8'
);

// Parse CSV helper
function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  });
}

const procedures = parseCSV(proceduresCSV);
const hospitals = parseCSV(hospitalsCSV);

/**
 * Call Claude API
 */
async function callClaude(prompt) {
  if (!CONFIG.apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set in environment');
  }

  const requestBody = JSON.stringify({
    model: CONFIG.model,
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const options = {
    hostname: 'api.anthropic.com',
    port: 443,
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CONFIG.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Length': requestBody.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          resolve(response.content[0].text);
        } else {
          reject(new Error(`API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt) {
  if (!CONFIG.apiKey) {
    throw new Error('OPENAI_API_KEY not set in environment');
  }

  const requestBody = JSON.stringify({
    model: CONFIG.model,
    messages: [{
      role: 'user',
      content: prompt
    }],
    max_tokens: 4096,
    temperature: 0.7
  });

  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.apiKey}`,
      'Content-Length': requestBody.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          resolve(response.choices[0].message.content);
        } else {
          reject(new Error(`API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

/**
 * Generate content using configured AI provider
 */
async function generateContent(prompt) {
  console.log(`Using ${CONFIG.provider} with model ${CONFIG.model}...`);

  if (CONFIG.provider === 'anthropic') {
    return await callClaude(prompt);
  } else if (CONFIG.provider === 'openai') {
    return await callOpenAI(prompt);
  } else {
    throw new Error(`Unknown provider: ${CONFIG.provider}`);
  }
}

/**
 * Generate procedure content
 */
async function generateProcedureContent(procedureSlug) {
  console.log(`\n📄 Generating content for procedure: ${procedureSlug}`);

  // Find procedure data
  const procedure = procedures.find(p => p.procedure_slug === procedureSlug);
  if (!procedure) {
    throw new Error(`Procedure not found: ${procedureSlug}`);
  }

  // Prepare data for prompt
  const procedureData = {
    name: procedure.procedure_name,
    slug: procedure.procedure_slug,
    category: procedure.category,
    specialty: procedure.specialty,
    costMin: parseInt(procedure.typical_cost_min_usd),
    costMax: parseInt(procedure.typical_cost_max_usd),
    durationDays: parseInt(procedure.avg_duration_days),
    keywords: procedure.search_keywords,
    alsoKnownAs: procedure.aka_names,
  };

  console.log(`   Name: ${procedureData.name}`);
  console.log(`   Cost: $${procedureData.costMin.toLocaleString()}-$${procedureData.costMax.toLocaleString()}`);
  console.log(`   Duration: ${procedureData.durationDays} days`);

  // Generate prompt
  const prompt = generateProcedurePrompt(procedureData);

  // Generate content
  console.log(`   Generating content...`);
  const content = await generateContent(prompt);

  // Save to file
  const outputPath = path.join(CONFIG.outputDir, 'procedures', `${procedureSlug}.md`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content);

  console.log(`   ✅ Saved to: ${outputPath}`);
  console.log(`   Word count: ${content.split(/\s+/).length}`);

  return content;
}

/**
 * Generate hospital content
 */
async function generateHospitalContent(hospitalSlug) {
  console.log(`\n🏥 Generating content for hospital: ${hospitalSlug}`);

  // Find hospital data
  const hospital = hospitals.find(h => {
    const slug = h.Hospital_Name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return slug === hospitalSlug;
  });

  if (!hospital) {
    throw new Error(`Hospital not found: ${hospitalSlug}`);
  }

  // Prepare data for prompt
  const hospitalData = {
    name: hospital.Hospital_Name,
    slug: hospitalSlug,
    city: hospital.Region,
    hospitalType: hospital.Hospital_Type,
    specialties: hospital.Specialties.split(',').map(s => s.trim()),
    numDoctors: parseInt(hospital.Number_of_Doctors) || 0,
    numBeds: parseInt(hospital.Number_of_Beds) || 0,
    accreditations: hospital.Accreditation.split(/[;,]/).map(a => a.trim()).filter(Boolean),
    languages: hospital.Interpretation,
    services: hospital.Other_Services || 'International patient support',
  };

  console.log(`   Name: ${hospitalData.name}`);
  console.log(`   City: ${hospitalData.city}`);
  console.log(`   Doctors: ${hospitalData.numDoctors}`);
  console.log(`   Beds: ${hospitalData.numBeds}`);

  // Generate prompt
  const prompt = generateHospitalPrompt(hospitalData);

  // Generate content
  console.log(`   Generating content...`);
  const content = await generateContent(prompt);

  // Save to file
  const outputPath = path.join(CONFIG.outputDir, 'hospitals', `${hospitalSlug}.md`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content);

  console.log(`   ✅ Saved to: ${outputPath}`);
  console.log(`   Word count: ${content.split(/\s+/).length}`);

  return content;
}

/**
 * Generate city+procedure content
 */
async function generateCityProcedureContent(citySlug, procedureSlug) {
  console.log(`\n🌆 Generating content for: ${citySlug}/${procedureSlug}`);

  // Find procedure
  const procedure = procedures.find(p => p.procedure_slug === procedureSlug);
  if (!procedure) {
    throw new Error(`Procedure not found: ${procedureSlug}`);
  }

  // City name mapping
  const cityNames = {
    'seoul': 'Seoul',
    'busan': 'Busan',
    'incheon': 'Incheon',
    'daegu': 'Daegu',
    'gwangju': 'Gwangju',
    'gyeonggi-do': 'Gyeonggi-do',
  };

  const city = cityNames[citySlug] || citySlug;

  // Find hospitals in this city offering this procedure
  const cityHospitals = hospitals
    .filter(h => h.Region.toLowerCase().includes(city.toLowerCase()))
    .slice(0, 3)
    .map(h => h.Hospital_Name);

  // Prepare data
  const cityProcedureData = {
    city,
    citySlug,
    procedureName: procedure.procedure_name,
    procedureSlug: procedure.procedure_slug,
    category: procedure.category,
    costMin: parseInt(procedure.typical_cost_min_usd),
    costMax: parseInt(procedure.typical_cost_max_usd),
    topHospitals: cityHospitals,
  };

  console.log(`   City: ${city}`);
  console.log(`   Procedure: ${cityProcedureData.procedureName}`);
  console.log(`   Hospitals: ${cityHospitals.length}`);

  // Generate prompt
  const prompt = generateCityProcedurePrompt(cityProcedureData);

  // Generate content
  console.log(`   Generating content...`);
  const content = await generateContent(prompt);

  // Save to file
  const outputPath = path.join(CONFIG.outputDir, 'city-procedures', `${citySlug}-${procedureSlug}.md`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content);

  console.log(`   ✅ Saved to: ${outputPath}`);
  console.log(`   Word count: ${content.split(/\s+/).length}`);

  return content;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const type = args[0];
  const param1 = args[1];
  const param2 = args[2];

  console.log('🚀 KmedTour Content Generation');
  console.log('================================\n');

  if (!CONFIG.apiKey) {
    console.error('❌ Error: API key not set!');
    console.error('Set ANTHROPIC_API_KEY or OPENAI_API_KEY environment variable');
    console.error('Example: export ANTHROPIC_API_KEY=sk-ant-...');
    process.exit(1);
  }

  console.log(`Provider: ${CONFIG.provider}`);
  console.log(`Model: ${CONFIG.model}`);
  console.log(`Output: ${CONFIG.outputDir}\n`);

  try {
    if (type === 'procedure' && param1) {
      await generateProcedureContent(param1);
    } else if (type === 'hospital' && param1) {
      await generateHospitalContent(param1);
    } else if (type === 'city' && param1 && param2) {
      await generateCityProcedureContent(param1, param2);
    } else {
      console.log('Usage:');
      console.log('  node scripts/generate-content.js procedure <procedure-slug>');
      console.log('  node scripts/generate-content.js hospital <hospital-slug>');
      console.log('  node scripts/generate-content.js city <city-slug> <procedure-slug>');
      console.log('\nExamples:');
      console.log('  node scripts/generate-content.js procedure rhinoplasty');
      console.log('  node scripts/generate-content.js hospital asan-medical-center');
      console.log('  node scripts/generate-content.js city seoul rhinoplasty');
      process.exit(1);
    }

    console.log('\n✨ Content generation complete!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateProcedureContent,
  generateHospitalContent,
  generateCityProcedureContent,
};
