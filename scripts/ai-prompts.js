/**
 * AI Content Generation Prompts for KmedTour pSEO Pages
 *
 * Use these prompts with Claude/GPT-4 to generate 1,000-1,500 word content
 * Target: Avoid thin content, meet Google Helpful Content guidelines
 */

// =============================================================================
// PROCEDURE PAGE PROMPT TEMPLATE
// =============================================================================

export function generateProcedurePrompt(procedureData) {
  const {
    name,              // e.g., "Rhinoplasty"
    slug,              // e.g., "rhinoplasty"
    category,          // e.g., "Cosmetic"
    specialty,         // e.g., "PLASTIC_SURGERY"
    costMin,           // e.g., 3000
    costMax,           // e.g., 8000
    durationDays,      // e.g., 7
    keywords,          // e.g., "nose job seoul, rhinoplasty korea cost"
    alsoKnownAs,       // e.g., "Nose Job|Nose Surgery"
  } = procedureData;

  return `You are an expert medical tourism content writer specializing in Korean healthcare.

Write a comprehensive, helpful guide for patients considering ${name} in South Korea.

TARGET AUDIENCE: International patients (US, UK, Australia, Middle East) researching medical tourism options
TONE: Professional but warm, trustworthy, informative without medical jargon
WORD COUNT: 1,000-1,500 words
PURPOSE: Help patients make informed decisions, build trust in Korean healthcare

KEY REQUIREMENTS:
- Write for humans first, not search engines
- Demonstrate expertise and experience with Korean medical tourism
- Include specific, verifiable facts and statistics
- Show empathy for patient concerns
- Provide actionable information
- Natural keyword usage (not stuffing)

TARGET KEYWORDS (use naturally): ${keywords}

STRUCTURE YOUR CONTENT WITH THESE SECTIONS:

## 1. Introduction (150-200 words)
- What is ${name}? (in plain language)
- Also known as: ${alsoKnownAs}
- Who typically gets this procedure
- Brief mention of why Korea is excellent for this
- Establish credibility: Korea performs X,000+ annually

## 2. Why Choose Korea for ${name}? (250-300 words)

Include:
- **Cost Savings**: Korea costs $${costMin.toLocaleString()}-$${costMax.toLocaleString()} vs. $X,XXX-$X,XXX in US/UK (60-70% savings)
- **Expertise**: Korean surgeons perform 10-20x more procedures than Western counterparts
- **Technology**: Latest medical equipment and techniques
- **Experience**: Specific to ${category} procedures, Korea leads globally
- **Success Rates**: Higher than global average (cite if available)

Create a simple cost comparison:
| Country | Average Cost | Savings |
|---------|-------------|---------|
| USA | $XX,XXX | XX% more |
| UK | £X,XXX | XX% more |
| Korea | $${costMin.toLocaleString()}-$${costMax.toLocaleString()} | Baseline |

## 3. What to Expect (300-350 words)

### Before the Procedure:
- Initial consultation (virtual or in-person)
- Medical tests required
- Preparation checklist (2-3 weeks before)
- Travel planning tips

### The Procedure:
- Typical duration
- Anesthesia type
- Brief step-by-step process (3-5 steps)
- What you'll feel

### Recovery Timeline:
- Hospital stay: typically ${durationDays} days
- Week 1: [immediate recovery details]
- Week 2-3: [returning to normal activities]
- Long-term: [final results timeline]

When can I:
- Return to work: X days
- Exercise: X weeks
- See final results: X months

## 4. Top Hospitals & Cities (150-200 words)
- Seoul has the highest concentration of ${specialty} specialists
- Mention 2-3 specific hospital types (don't name specific ones, use descriptions):
  - "Large multi-specialty hospitals with international patient centers"
  - "Specialized clinics focused exclusively on ${category} procedures"
  - "University hospitals with research programs"
- Cities offering this: Seoul (main hub), Busan, Incheon

## 5. Safety & Quality (150-200 words)
- KAHF/KOIHA accreditation explained
- Success rates for ${name} in Korea
- Common concerns addressed:
  - Language barriers (English-speaking coordinators)
  - Quality of care (international standards)
  - Follow-up care (virtual consultations available)
- Realistic expectations: not everyone is a candidate

## 6. Frequently Asked Questions (5-7 questions, 200-250 words total)

Must include:
1. How much does ${name} cost in Korea?
   - Answer: $${costMin.toLocaleString()}-$${costMax.toLocaleString()}, including [what's included]

2. How long do I need to stay in Korea?
   - Answer: Minimum ${durationDays} days, recommended [X] days

3. Is ${name} safe in Korea?
   - Answer: Yes, with KAHF/KOIHA accredited hospitals...

4. What's included in the price?
   - Answer: Surgery, anesthesia, hospital stay, initial consultations...

5. Can I combine this with tourism?
   - Answer: Yes, many patients...

Add 2-3 more relevant questions specific to ${name}

## Medical Disclaimer (50 words)
Standard medical disclaimer: "This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider before making medical decisions. KmedTour is a concierge service, not a medical provider."

WRITING STYLE GUIDELINES:
✅ DO:
- Use specific numbers and statistics
- Include personal touches ("Many of our patients find...")
- Address common fears and concerns
- Use conversational transitions
- Break up text with subheadings, bullets, tables
- Include comparative data (Korea vs. other countries)
- Mention real-world logistics (flights, hotels, meals)

❌ DON'T:
- Make unverified medical claims
- Over-promise results
- Use excessive medical jargon without explanation
- Copy content from other websites
- Keyword stuff
- Sound like a sales pitch
- Make it feel templated

EXAMPLES OF GOOD VS. BAD:

BAD: "Rhinoplasty Korea is the best rhinoplasty. Korea rhinoplasty cost is low. Get rhinoplasty in Seoul."
GOOD: "When considering rhinoplasty, many international patients choose Korea for its combination of expertise and value. With costs 60-70% lower than Western countries and surgeons who perform hundreds of procedures annually, it's no surprise that Seoul has become a global hub for cosmetic surgery."

BAD: "The doctor will fix your nose."
GOOD: "During the 1.5-2 hour procedure, your surgeon will carefully reshape the bone and cartilage to achieve the proportions you discussed during consultation. You'll be under general anesthesia, so you won't feel anything during the surgery."

NOW WRITE THE COMPREHENSIVE GUIDE:
Begin with a natural, engaging introduction that immediately addresses the reader's main question: "Is Korea a good choice for ${name}?"

Focus on being genuinely helpful, not just SEO-optimized. A patient reading this should feel informed, reassured, and clear on next steps.

Write the full article now.`;
}

// =============================================================================
// HOSPITAL PAGE PROMPT TEMPLATE
// =============================================================================

export function generateHospitalPrompt(hospitalData) {
  const {
    name,              // e.g., "Asan Medical Center"
    slug,              // e.g., "asan-medical-center"
    city,              // e.g., "Seoul"
    hospitalType,      // e.g., "High level general hospital"
    specialties,       // e.g., ["ONCOLOGY", "SURGERY", "INTERNAL_MEDICINE"]
    numDoctors,        // e.g., 1300
    numBeds,           // e.g., 2705
    accreditations,    // e.g., ["KOIHA", "KAHF"]
    languages,         // e.g., "ENGLISH, CHINESE, RUSSIAN, JAPANESE"
    services,          // e.g., "Airport pickup, Translation services"
  } = hospitalData;

  const specialtiesFormatted = specialties.map(s => s.replace(/_/g, ' ')).join(', ');

  return `You are an expert medical tourism content writer specializing in Korean healthcare facilities.

Write a comprehensive, helpful guide for international patients considering ${name} in ${city}, South Korea.

TARGET AUDIENCE: International medical tourists researching hospital options in Korea
TONE: Professional, trustworthy, detailed but accessible
WORD COUNT: 1,000-1,500 words
PURPOSE: Help patients understand this hospital's strengths, services, and why it's suitable for international patients

KEY FACTS ABOUT ${name}:
- Location: ${city}, South Korea
- Type: ${hospitalType}
- Doctors: ${numDoctors}
- Beds: ${numBeds}
- Accreditation: ${accreditations.join(', ')}
- Specialties: ${specialtiesFormatted}
- Languages: ${languages}
- Services: ${services}

STRUCTURE YOUR CONTENT:

## 1. Introduction (150-200 words)
- Brief overview of ${name}
- Established year (if you know major Korean hospitals, otherwise say "decades of experience")
- Position in Korean healthcare (e.g., "one of Korea's leading tertiary care centers")
- Why international patients choose this hospital
- Quick mention of specialties: ${specialtiesFormatted}

## 2. Hospital Overview (250-300 words)

### Size & Capacity:
- ${numDoctors} medical professionals
- ${numBeds} beds
- [Estimate] X operating rooms
- [Estimate] X,XXX international patients annually

### Accreditation & Quality:
- ${accreditations.join(' and ')} accredited (explain what this means)
- International patient care standards
- Quality metrics (if known, otherwise general Korean hospital quality standards)

### Key Specializations:
For each of ${specialtiesFormatted}:
- Brief description of specialty department
- Why this hospital excels in this area
- Types of procedures commonly performed

## 3. International Patient Services (250-300 words)

### Language Support:
- Languages available: ${languages}
- Medical interpreters on staff
- Translated documents and signage

### Concierge Services:
${services.split(';').map(s => `- ${s.trim()}`).join('\n')}
- Appointment scheduling assistance
- Medical records coordination
- Insurance claim support (if applicable)

### Practical Support:
- Help finding nearby accommodation
- Transportation arrangements
- Cultural orientation
- 24/7 international patient hotline

### Location & Accessibility:
- ${city} location details
- Distance from Incheon International Airport
- Public transportation access
- Parking availability

## 4. Popular Procedures for International Patients (200-250 words)

Based on ${specialtiesFormatted}, mention:
- 5-7 common procedures international patients seek
- Estimated cost ranges (if known)
- Success rates or outcomes (if available)
- Comparison with costs in US/UK/Australia

Example format:
"Many international patients come to ${name} for [specialty] procedures such as [procedure], [procedure], and [procedure]. These procedures typically cost 50-70% less than in Western countries while maintaining the same (or higher) quality standards."

## 5. Why Choose ${name} for Medical Tourism (200-250 words)

Highlight:
- **Expertise**: ${numDoctors} doctors, many with international training
- **Experience**: High patient volume = refined skills
- **Technology**: Modern medical equipment and techniques
- **Integrated Care**: Comprehensive services under one roof
- **Track Record**: Years of serving international patients
- **Convenience**: Located in ${city} with excellent infrastructure

Create comparison:
"Choosing ${name} means accessing world-class medical care at a fraction of Western costs. A procedure that might cost $X,XXX in the US typically costs $X,XXX-$X,XXX here, including hospital stay and initial consultations."

## 6. Patient Journey at ${name} (200-250 words)

Walk through typical experience:

### Before Arrival:
- Virtual consultation process
- Medical records review
- Quote and treatment plan

### Arrival Day:
- Airport pickup (if offered)
- Check into hotel or hospital accommodation
- Initial orientation

### Treatment Phase:
- Pre-procedure consultations
- Surgery/treatment day
- Hospital stay and monitoring
- Post-treatment care

### Follow-Up:
- Discharge instructions
- Follow-up appointments
- Virtual consultations after returning home
- Emergency contact information

## 7. Frequently Asked Questions (5-7 questions, 150-200 words)

Must include:
1. How do I book an appointment at ${name}?
2. Does ${name} accept international insurance?
3. What languages does the staff speak?
4. How far is ${name} from the airport?
5. Are there hotels near ${name}?

Add 2-3 more relevant to this specific hospital type

## Medical Disclaimer (50 words)
Standard medical disclaimer

WRITING GUIDELINES:
✅ DO:
- Be specific with numbers (doctors, beds, years established)
- Explain medical terms
- Address practical concerns (language, location, costs)
- Show empathy for international patients' concerns
- Include logistics information
- Mention Korean healthcare system strengths

❌ DON'T:
- Over-promise or exaggerate
- Make unverifiable claims
- Sound like advertising copy
- Ignore practical challenges
- Skip important details like accessibility

TONE EXAMPLES:

GOOD: "${name} has been serving both domestic and international patients for over [X] years. With ${numDoctors} physicians across multiple specialties, the hospital has the depth of expertise to handle complex cases while providing personalized care."

GOOD: "Getting to ${name} is straightforward. The hospital is located in ${city}, approximately [X] minutes from Incheon International Airport. Most international patients arrange airport pickup through the hospital's concierge service, which ensures a smooth transition from arrival to your initial consultation."

NOW WRITE THE COMPREHENSIVE HOSPITAL GUIDE:
Focus on being genuinely helpful to someone planning medical tourism. They need practical information, reassurance about quality and safety, and clear next steps.

Write the full article now.`;
}

// =============================================================================
// CITY + PROCEDURE PAGE PROMPT TEMPLATE
// =============================================================================

export function generateCityProcedurePrompt(cityProcedureData) {
  const {
    city,              // e.g., "Seoul"
    citySlug,          // e.g., "seoul"
    procedureName,     // e.g., "Rhinoplasty"
    procedureSlug,     // e.g., "rhinoplasty"
    category,          // e.g., "Cosmetic"
    costMin,           // e.g., 3000
    costMax,           // e.g., 8000
    topHospitals,      // e.g., ["Hospital A", "Hospital B", "Hospital C"]
  } = cityProcedureData;

  return `You are an expert medical tourism content writer specializing in Korean healthcare.

Write a helpful, comprehensive guide for patients specifically interested in ${procedureName} in ${city}, South Korea.

TARGET AUDIENCE: International patients who have already decided on both the procedure and location
TONE: Practical, detailed, locally informed
WORD COUNT: 800-1,200 words
PURPOSE: Help patients understand why ${city} is ideal for ${procedureName} and what to expect

KEY FACTS:
- City: ${city}, South Korea
- Procedure: ${procedureName}
- Category: ${category}
- Cost Range: $${costMin.toLocaleString()}-$${costMax.toLocaleString()}
- Top Hospitals: ${topHospitals.slice(0, 3).join(', ')}

STRUCTURE YOUR CONTENT:

## 1. Introduction (100-150 words)
- Why ${city} for ${procedureName}?
- ${city}'s reputation in ${category} procedures
- Number of clinics/hospitals offering this (estimate based on city size)
- Brief cost comparison: ${city} vs. home country

## 2. Why ${city} Specifically? (250-300 words)

### Medical Excellence:
- ${city}'s healthcare infrastructure
- Concentration of ${category} specialists
- Success rates and patient volume
- Innovation and technology specific to ${city}

### Accessibility:
- International airport (Incheon for Seoul, etc.)
- Transportation within city
- English-friendly environment
- Medical tourism infrastructure

### Cost Advantages:
- ${procedureName} in ${city}: $${costMin.toLocaleString()}-$${costMax.toLocaleString()}
- Compare with: USA ($X,XXX), UK (£X,XXX), Australia (AU$X,XXX)
- Total trip cost estimate (including accommodation, flights)

### City-Specific Benefits:
- Recovery-friendly environment
- Things to do during recovery (light activities)
- Food scene (important for recovery nutrition)
- Shopping and entertainment options

## 3. Top Hospital Areas in ${city} (200-250 words)

Describe ${city}'s medical districts:
- For Seoul: Gangnam district (plastic surgery hub), Myeongdong, etc.
- For other cities: equivalent medical zones

Include:
- Which neighborhoods have most clinics
- Characteristics of each area
- Accessibility to hotels and attractions
- Average clinic quality/reputation

## 4. Planning Your ${procedureName} Trip to ${city} (250-300 words)

### Best Time to Visit:
- Weather considerations
- Peak tourism seasons to avoid (or embrace)
- Medical tourism high/low seasons

### How Long to Stay:
- Minimum: [X] days (consultation + surgery + initial recovery)
- Recommended: [X] days (includes post-op check-up)
- Extended: [X] days (see results, light tourism)

### Where to Stay:
- Hotels near medical districts
- Recovery houses/Airbnb options
- Budget: $30-50/night
- Mid-range: $80-120/night
- Luxury: $150+/night

### Getting Around:
- ${city}'s public transportation (subway, buses)
- Taxi costs and convenience
- Hospital shuttle services
- Walking vs. transportation (during recovery)

### What to Pack:
- Comfortable clothing (especially for ${procedureName} recovery)
- Entertainment for downtime
- Medical documents
- Translation apps (Papago, Naver)

## 5. Typical Costs Breakdown (150-200 words)

Create detailed cost estimate for ${city} trip:

**Medical Costs:**
- ${procedureName} surgery: $${costMin.toLocaleString()}-$${costMax.toLocaleString()}
- Consultations: Usually included
- Post-op care: Usually included
- Medications: $50-100

**Travel & Accommodation ([X] days):**
- Round-trip flights: $600-1,500 (varies by origin)
- Hotel ([X] nights): $XXX-XXX
- Meals: $15-30/day = $XXX
- Transportation: $100-200
- Miscellaneous: $200-500

**Total Estimated Cost: $X,XXX - $X,XXX**

**Savings vs. home country: $X,XXX - $X,XXX**

## 6. What Makes ${city} Special for Medical Tourism (150-200 words)

Highlight city-specific advantages:
- ${city}'s global reputation
- Cultural attractions for companions
- Recovery-friendly climate/environment
- International patient support systems
- Success stories and testimonials (general, not specific people)

## 7. FAQs for ${procedureName} in ${city} (5-6 questions, 150-200 words)

1. How many clinics in ${city} offer ${procedureName}?
2. Is ${city} safe for international medical tourists?
3. What neighborhoods should I stay in?
4. Can I sightsee during recovery?
5. How do I get from the airport to medical district?
6. [One more procedure-specific question]

WRITING GUIDELINES:

✅ DO:
- Be specific about ${city} (not generic Korea info)
- Include local knowledge (neighborhoods, transportation)
- Address practical travel logistics
- Mention ${city}-specific advantages
- Include realistic trip planning timeline
- Reference ${city}'s culture and amenities

❌ DON'T:
- Just repeat general procedure information
- Ignore the city-specific angle
- Make it feel like a generic template
- Overlook practical travel concerns
- Skip local logistics

TONE EXAMPLE:

GOOD: "${city}, particularly the Gangnam district, has become synonymous with excellence in ${category} procedures. With over [X] specialized clinics within a few subway stops, international patients have access to some of Asia's most experienced ${procedureName} surgeons. The city's efficient metro system means you can easily visit multiple clinics for consultations, all while staying in comfortable, affordable accommodation near the medical district."

NOW WRITE THE CITY-SPECIFIC PROCEDURE GUIDE:
Remember, readers have already chosen ${procedureName} and ${city}. They need practical, local information to plan their trip successfully.

Write the full article now.`;
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

// Example: Generate prompt for Rhinoplasty
const rhinoplastyPrompt = generateProcedurePrompt({
  name: "Rhinoplasty",
  slug: "rhinoplasty",
  category: "Cosmetic",
  specialty: "PLASTIC_SURGERY",
  costMin: 3000,
  costMax: 8000,
  durationDays: 7,
  keywords: "nose job seoul, rhinoplasty korea cost, nose surgery korea",
  alsoKnownAs: "Nose Job|Nose Surgery|Nose Reshaping",
});

// Example: Generate prompt for Asan Medical Center
const asanPrompt = generateHospitalPrompt({
  name: "Asan Medical Center",
  slug: "asan-medical-center",
  city: "Seoul",
  hospitalType: "High level general hospital",
  specialties: ["ONCOLOGY", "SURGERY", "INTERNAL_MEDICINE"],
  numDoctors: 1300,
  numBeds: 2705,
  accreditations: ["KOIHA", "KAHF"],
  languages: "ENGLISH, CHINESE, RUSSIAN, JAPANESE, MONGOLIAN, VIETNAMESE, ARABIC",
  services: "Airport pickup; Medical coordination; Translation services; Accommodation assistance",
});

// Example: Generate prompt for Seoul Rhinoplasty
const seoulRhinoplastyPrompt = generateCityProcedurePrompt({
  city: "Seoul",
  citySlug: "seoul",
  procedureName: "Rhinoplasty",
  procedureSlug: "rhinoplasty",
  category: "Cosmetic",
  costMin: 3000,
  costMax: 8000,
  topHospitals: ["Banobagi", "Grand Plastic Surgery", "View Clinic"],
});

// Export for use in other scripts
export default {
  generateProcedurePrompt,
  generateHospitalPrompt,
  generateCityProcedurePrompt,
};
