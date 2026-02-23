export type PseoFaq = {
  question: string
  answer: string
}

export type ProcedureGuide = {
  candidateFor: string[]
  whatToExpect: Array<{ step: string; duration: string; detail: string }>
  whyKorea: string[]
  faqs: PseoFaq[]
}

/**
 * Procedure-level content for high-traffic pSEO pages.
 * City-agnostic — displayed on all /[city]/[procedure] routes for a given procedure.
 * Content follows the writing-skills B2/B4 template.
 * Rules: no fabricated statistics, includes healthcare professional disclaimer language,
 * each entry is unique and medically accurate to general knowledge.
 */
export const procedureGuides: Record<string, ProcedureGuide> = {
  rhinoplasty: {
    candidateFor: [
      'Adults unhappy with the size, shape, or projection of their nose',
      'Patients with a dorsal hump, bulbous or drooping tip, or asymmetric nostrils',
      'Individuals with a deviated septum causing breathing difficulties',
      'Those who have completed facial growth (typically age 17+ for women, 18+ for men)',
    ],
    whatToExpect: [
      {
        step: 'Consultation & Imaging',
        duration: '1–2 hours',
        detail:
          'A 3D facial analysis and imaging session helps align your aesthetic goals with what is anatomically achievable. Your surgeon will review your nasal structure, skin thickness, and breathing function.',
      },
      {
        step: 'Surgery',
        duration: '2–4 hours',
        detail:
          'Performed under general anesthesia. Your surgeon uses either an open (small external incision) or closed (all incisions inside the nostril) approach depending on the complexity of your case.',
      },
      {
        step: 'Recovery & Follow-up',
        duration: '7–10 days in Korea',
        detail:
          'A splint is worn for 7–10 days. Most bruising and swelling are presentable within 2–3 weeks. Final shape becomes apparent at 6–12 months as residual swelling resolves.',
      },
    ],
    whyKorea: [
      'Korean plastic surgeons are trained in both Asian and Western rhinoplasty aesthetics, making them uniquely skilled at serving international patients from diverse ethnic backgrounds',
      'Korean clinics offer high-resolution 3D imaging and simulation technology as standard, helping patients visualize results before committing to surgery',
      'Procedure costs in Korea are typically 40–60% lower than equivalent quality in Western Europe or North America',
    ],
    faqs: [
      {
        question: 'How long does rhinoplasty swelling last?',
        answer:
          'Most visible swelling and bruising resolve within 2–3 weeks, allowing most patients to return to work and social settings. However, subtle residual swelling — particularly at the tip — can take 6–12 months to fully resolve. Protecting your nose from sun and trauma during this period supports the best outcome.',
      },
      {
        question: 'Can rhinoplasty improve breathing as well as appearance?',
        answer:
          'Yes. Functional rhinoplasty addresses structural issues such as a deviated septum, enlarged turbinates, or collapsed nasal valves that restrict airflow. Many patients choose to combine functional correction with cosmetic refinement in a single procedure.',
      },
      {
        question: 'What is the difference between open and closed rhinoplasty?',
        answer:
          'Closed rhinoplasty places all incisions inside the nostrils — no external scar — and is suitable for less complex cases. Open rhinoplasty uses a small incision across the columella (the strip of skin between the nostrils), giving the surgeon greater visibility and precision for complex reshaping. Both approaches are performed by Korean surgeons depending on the case.',
      },
      {
        question: 'Is it safe to fly home after rhinoplasty?',
        answer:
          'Most surgeons recommend waiting 7–10 days before flying to allow initial healing and to attend the first follow-up appointment. Flying with a nasal splint in place is standard. Inform cabin crew if needed. Your KmedTour coordinator will help schedule your flights around your surgical timeline.',
      },
    ],
  },

  'hair-transplant': {
    candidateFor: [
      'Men and women experiencing pattern baldness (androgenetic alopecia)',
      'Those with sufficient donor hair density at the back and sides of the scalp',
      'Individuals whose hair loss has stabilised — active hair loss may require ongoing treatment alongside transplantation',
      'Adults in good general health with realistic expectations about coverage and density',
    ],
    whatToExpect: [
      {
        step: 'Scalp Assessment & Design',
        duration: '1–2 hours',
        detail:
          'A trichologist or surgeon examines your donor density, hair quality, and extent of hair loss. A hairline design is drawn that suits your facial proportions, skin tone, and future hair loss trajectory.',
      },
      {
        step: 'Graft Harvesting & Implantation',
        duration: '6–10 hours (varies by graft count)',
        detail:
          'Individual follicular units are extracted from the donor area using an FUE punch or DHI tool. Grafts are implanted in the recipient area one by one. The procedure is performed under local anesthesia — most patients remain awake and comfortable throughout.',
      },
      {
        step: 'Post-Operative Care & Growth',
        duration: 'Results at 12–18 months',
        detail:
          'The scalp is washed gently from day 3. Scabs shed within 10–14 days. Transplanted hairs fall out at 2–6 weeks (shock loss) — this is normal. New growth begins at 3–4 months, with full density visible at 12–18 months.',
      },
    ],
    whyKorea: [
      'Korean hair transplant clinics frequently serve African, Middle Eastern, and South Asian patients, giving surgeons experience with the specific texture and curl characteristics of diverse hair types',
      'Korean clinics offer competitive pricing for FUE and DHI procedures compared to UK, US, or UAE clinics offering equivalent quality',
      'Many Korean hair transplant specialists have completed thousands of procedures, with high-volume practices enabling refined technique and efficiency',
    ],
    faqs: [
      {
        question: 'FUE or DHI — which is better for my hair type?',
        answer:
          'FUE (Follicular Unit Extraction) creates small recipient channels first, then implants grafts using forceps. DHI (Direct Hair Implantation) uses a specialized pen to create the channel and implant the graft simultaneously, allowing denser packing and more precise angle control. Your surgeon will recommend the best approach based on your hair type, density goals, and donor availability.',
      },
      {
        question: 'How many grafts will I need?',
        answer:
          'The number of grafts depends on the size of the area being covered and the desired density. As a rough guide: hairline restoration typically requires 1,500–2,500 grafts; a thinning crown may require 1,000–2,000 grafts; full coverage of a Norwood Class 5–6 pattern can require 3,500–5,000+ grafts across multiple sessions. Your surgeon will provide a specific estimate after assessing your donor density.',
      },
      {
        question: 'Will anyone be able to tell I had a hair transplant?',
        answer:
          'With modern FUE and DHI techniques, results look natural when performed by an experienced surgeon. The key factor is hairline design — a skilled surgeon creates an irregular, age-appropriate hairline rather than a straight, uniform line. The scalp is presentable within 2–3 weeks after scab shedding.',
      },
      {
        question: 'Can I colour or cut my hair after a transplant?',
        answer:
          'Hair can be cut once it has grown to a cuttable length (typically 3–6 months post-procedure). Chemical colouring is generally advised against for 3–6 months to avoid stressing the newly establishing follicles. Your clinic will give specific aftercare guidance.',
      },
    ],
  },

  'double-eyelid-surgery': {
    candidateFor: [
      'Individuals without a natural supratarsal (upper eyelid) fold who wish to create one',
      'Those with an existing fold that is asymmetric or poorly defined',
      'Adults in good health with no active eye infections or uncontrolled dry eye',
      'Patients with realistic expectations — suitable for a wide age range from young adults onward',
    ],
    whatToExpect: [
      {
        step: 'Consultation & Method Selection',
        duration: '30–60 minutes',
        detail:
          'Your surgeon assesses eyelid skin thickness, fat volume, and existing anatomy to recommend between the incisional and non-incisional (suture) methods. The target fold height and shape are agreed.',
      },
      {
        step: 'Surgery',
        duration: '30–90 minutes',
        detail:
          'Performed under local anesthesia with mild sedation. The non-incisional method places dissolving sutures to create the fold — no skin is removed, recovery is faster, but results may not be permanent for all patients. The incisional method removes a small strip of skin and fat for a permanent, defined result.',
      },
      {
        step: 'Recovery',
        duration: '5–7 days to presentable; 4–6 weeks to full result',
        detail:
          'Initial swelling peaks at 2–3 days and subsides significantly within 1–2 weeks. Cold compresses, head elevation, and avoiding strenuous activity speed recovery. Makeup can typically be worn from day 7–10.',
      },
    ],
    whyKorea: [
      'South Korea performs more double eyelid procedures than any other country, giving Korean surgeons unmatched depth of experience with diverse eyelid anatomies and aesthetic preferences',
      'Korean clinics have refined non-incisional techniques specifically for patients who want a more natural fold or who are concerned about downtime',
      'Costs in Korea are considerably lower than comparable procedures in the US, Australia, or UK while maintaining high clinical standards',
    ],
    faqs: [
      {
        question: 'How long do non-incisional results last?',
        answer:
          'Non-incisional (suture) double eyelid results can last many years, but longevity varies by individual — skin stretching with age, significant weight fluctuation, or rubbing the eyes can cause the fold to loosen over time. Patients with thicker or oilier eyelid skin may have shorter-lasting results and are often better suited to the incisional method.',
      },
      {
        question: 'Will the double eyelid look natural on my face?',
        answer:
          'A skilled Korean surgeon will design the fold height and shape to complement your specific facial features rather than applying a uniform template. The goal is a result that looks like your natural anatomy, not an obviously surgical outcome.',
      },
      {
        question: 'Can I combine double eyelid surgery with other procedures?',
        answer:
          'Yes. Many patients combine double eyelid surgery with epicanthoplasty (inner corner opening), lower blepharoplasty (undereye bag correction), or ptosis correction. Your surgeon will advise on what can safely be combined in a single session.',
      },
    ],
  },

  'v-line-surgery': {
    candidateFor: [
      'Adults with a wide or square lower face who wish to create a slimmer jawline',
      'Those with prominent mandible angles (protruding jaw corners) or a disproportionate chin',
      'Individuals in good overall health who have completed facial bone growth (typically age 18+)',
      'Patients willing to commit to the full recovery timeline — bone contouring has a longer recovery than soft-tissue procedures',
    ],
    whatToExpect: [
      {
        step: 'Consultation & Imaging',
        duration: '1–2 hours',
        detail:
          'A 3D CT scan of your facial skeleton allows the surgeon to plan precise amounts of bone reduction. The planned outcome is simulated digitally before surgery.',
      },
      {
        step: 'Surgery',
        duration: '2–4 hours',
        detail:
          'Performed under general anesthesia through incisions inside the mouth — no external scars. The surgeon shaves or cuts the mandible angle, reshapes the lower jaw contour, and performs genioplasty (chin repositioning or reduction) as planned.',
      },
      {
        step: 'Recovery',
        duration: '2 weeks to presentable; 4–6 weeks for major swelling to resolve',
        detail:
          'A compression bandage is worn for 1–2 weeks. Soft foods only for 3–4 weeks. Most patients return to professional settings at 2–3 weeks. Full facial refinement is visible at 3–6 months when minor residual swelling resolves.',
      },
    ],
    whyKorea: [
      'Korea originated V-line and facial bone contouring surgery — Korean maxillofacial surgeons have accumulated more experience in this specialty than anywhere else globally',
      'The combination of artistic training and technical surgical skill required for facial contouring is embedded in Korean plastic and maxillofacial surgical education',
      'Korean clinics routinely manage international patients seeking facial contouring, with dedicated recovery support and multilingual coordinators',
    ],
    faqs: [
      {
        question: 'Is V-line surgery permanent?',
        answer:
          'Yes. Bone reduction is permanent — the removed bone does not regenerate. The lower facial shape achieved is a stable, long-term result. Normal aging and skin laxity may affect the soft-tissue appearance over time, but the bone structure remains.',
      },
      {
        question: 'Is there a scar from V-line surgery?',
        answer:
          'All incisions for jaw contouring are made inside the mouth, so there are no visible external scars. Incision sites heal within the oral mucosa.',
      },
      {
        question: 'How much bone is typically removed?',
        answer:
          'The amount varies by individual anatomy and goals. Surgeons conservatively remove what is needed to achieve the planned result — preserving enough bone structure for dental function and facial support. Over-reduction can cause complications, so experienced surgeons are conservative and precise.',
      },
      {
        question: 'Can I eat normally after surgery?',
        answer:
          'A soft or liquid diet is required for 3–4 weeks after jaw contouring to protect the bone as it heals. Most patients can transition back to a normal diet by weeks 5–6. Your clinic will provide detailed dietary guidelines.',
      },
    ],
  },

  'dental-implants': {
    candidateFor: [
      'Adults with one or more missing teeth who want a permanent, fixed replacement',
      'Those with sufficient jawbone density to anchor an implant (or candidates for bone grafting)',
      'Non-smokers or those willing to quit smoking, as smoking significantly impairs osseointegration',
      'Patients with well-controlled general health — uncontrolled diabetes or bone-affecting medications may affect suitability',
    ],
    whatToExpect: [
      {
        step: 'Assessment & Treatment Planning',
        duration: '2–3 hours',
        detail:
          'A 3D CBCT scan maps your bone volume, nerve locations, and sinus anatomy. A treatment plan covering implant positions, sizes, and the need for bone grafting is prepared.',
      },
      {
        step: 'Implant Placement',
        duration: '1–3 hours (depends on number of implants)',
        detail:
          'The titanium implant post is inserted into the jawbone under local anesthesia. A healing cap or temporary crown may be placed immediately in some protocols.',
      },
      {
        step: 'Osseointegration & Crown Fitting',
        duration: '3–6 months healing; crown fitting on a follow-up visit',
        detail:
          'The implant fuses with the jawbone over 3–6 months (osseointegration). A permanent porcelain or zirconia crown is then attached. Many international patients arrange crown fitting with a local dentist using specifications from the Korean clinic.',
      },
    ],
    whyKorea: [
      'Korean implant brands Osstem and Dentium are among the top three implant manufacturers globally — trusted in clinics across 80+ countries — yet treatments in Korea cost significantly less than in Western countries',
      'Korean dental clinics routinely offer same-day loading protocols for select cases, reducing the number of required visits',
      'Digital workflow (CBCT scanning, CAD/CAM crown fabrication) is standard practice at major Korean dental clinics, ensuring precision and efficiency',
    ],
    faqs: [
      {
        question: 'How long do dental implants last?',
        answer:
          'With proper oral hygiene and regular dental check-ups, dental implants can last 20–30 years or longer. The implant itself (the titanium post) is considered a lifetime fixture in most cases — it is the crown or abutment that may occasionally need replacing due to wear.',
      },
      {
        question: 'Is the implant procedure painful?',
        answer:
          'The procedure is performed under local anesthesia, so you should feel no pain during placement. Post-operative discomfort is typically mild to moderate for 3–5 days and is managed with prescribed pain relief. Most patients describe it as comparable to a tooth extraction.',
      },
      {
        question: 'What if I do not have enough bone for an implant?',
        answer:
          'If bone volume is insufficient, a bone graft procedure is performed first. Grafts can use bone from your own body, processed donor bone, or synthetic bone substitute materials. After healing (typically 3–6 months), implants can be placed in the regenerated bone.',
      },
      {
        question: 'Can I get implants and crowns in a single trip to Korea?',
        answer:
          'In some cases, yes — immediate loading protocols allow a temporary crown to be placed on the same day as implant surgery. However, most comprehensive implant cases require returning for the permanent crown after osseointegration (3–6 months). Many international patients arrange permanent crown fabrication with their home dentist using detailed specifications and scan files from the Korean clinic.',
      },
    ],
  },

  'lasik-eye-surgery': {
    candidateFor: [
      'Adults aged 18+ with a stable spectacle prescription for at least 1–2 years',
      'Those with myopia (short-sightedness), hyperopia (long-sightedness), or astigmatism within treatable ranges',
      'Individuals with adequate corneal thickness to safely allow reshaping',
      'People free of corneal disease (such as keratoconus), severe dry eye, or autoimmune conditions affecting healing',
    ],
    whatToExpect: [
      {
        step: 'Pre-operative Screening',
        duration: '3–4 hours',
        detail:
          'Comprehensive tests measure corneal thickness, curvature, pupil size, and tear production. Contact lenses must be removed at least 1 week (soft) or 3 weeks (rigid) before screening to allow the cornea to return to its natural shape.',
      },
      {
        step: 'LASIK Procedure',
        duration: '15–20 minutes per eye',
        detail:
          'A femtosecond laser creates a thin corneal flap. An excimer laser then precisely reshapes the underlying corneal tissue. The flap is repositioned and adheres without sutures. The procedure itself is painless — numbing drops are used.',
      },
      {
        step: 'Recovery',
        duration: 'Vision improvement within 24 hours; full stabilization over 1–3 months',
        detail:
          'Vision is blurry immediately after surgery but improves significantly by the following morning. A check-up the next day confirms healing. Most patients can fly home 2–3 days post-procedure with protective eyewear.',
      },
    ],
    whyKorea: [
      'Korean eye surgery centers are high-volume, specialized facilities that invest in the latest generation of femtosecond and excimer laser platforms — equipment is updated more frequently than in general hospitals',
      'Pre-operative screening is thorough and conducted by refractive specialists — patients unsuitable for LASIK are identified and offered appropriate alternatives (LASEK, SMILE, ICL)',
      'LASIK in Korea is significantly more affordable than equivalent quality procedures in the US, UK, or Australia',
    ],
    faqs: [
      {
        question: 'What is the difference between LASIK, LASEK, and SMILE?',
        answer:
          'LASIK creates a corneal flap with a laser, reshapes the tissue underneath, and replaces the flap. LASEK removes the thin outer epithelial layer instead of creating a flap — recovery is slower but it is suitable for thinner corneas. SMILE is a newer technique that does not create a flap and is associated with less dry eye post-operatively. Your Korean refractive surgeon will recommend the safest option based on your corneal measurements.',
      },
      {
        question: 'Is LASIK permanent?',
        answer:
          'LASIK reshaping is permanent, but your eyes will continue to change naturally with age. Most patients enjoy stable vision for many years, but age-related changes (particularly presbyopia from the mid-40s onward) may eventually require reading glasses regardless of having had LASIK.',
      },
      {
        question: 'What happens if I am not a LASIK candidate?',
        answer:
          'If your corneas are too thin or you have contraindications to LASIK, your surgeon will discuss alternatives. LASEK is suitable for moderately thin corneas. SMILE avoids flap creation entirely. Implantable Collamer Lenses (ICL) are an option for very high prescriptions or borderline corneal thickness.',
      },
    ],
  },

  'knee-replacement': {
    candidateFor: [
      'Adults with severe osteoarthritis, rheumatoid arthritis, or post-traumatic arthritis of the knee',
      'Those who experience significant pain that limits daily activities and has not responded to conservative treatments (physiotherapy, injections, medications)',
      'Individuals whose X-rays show significant joint space narrowing and bone-on-bone changes',
      'Generally adults over 50, though younger patients with severe damage are also considered',
    ],
    whatToExpect: [
      {
        step: 'Pre-operative Assessment',
        duration: '1–2 days',
        detail:
          'X-rays, blood tests, cardiac assessment, and a consultation with your orthopedic surgeon and anaesthesiologist. Baseline physiotherapy assessment is conducted to plan your post-operative rehabilitation.',
      },
      {
        step: 'Surgery',
        duration: '1.5–2.5 hours',
        detail:
          'Performed under general or spinal anesthesia. Damaged cartilage and bone are removed from the knee joint surfaces and replaced with metal and plastic prosthetic components precisely fitted to your anatomy. Robotic guidance assists with implant positioning in advanced centers.',
      },
      {
        step: 'Rehabilitation',
        duration: '3–5 days hospital stay; 10–14 days total in Korea',
        detail:
          'Physiotherapy begins the day after surgery. You will walk with assistance within 24 hours. Hospital discharge typically occurs at days 3–5. A structured home rehabilitation programme following return is essential for a full recovery.',
      },
    ],
    whyKorea: [
      'Korean orthopedic hospitals have invested in robotic-assisted surgical systems that improve implant alignment accuracy — a key factor in long-term prosthetic function',
      'Rapid recovery protocols and early mobilization programs are well-established in Korean orthopedic centers, reducing hospital stays and complications',
      'Total knee replacement in Korea costs significantly less than private procedures in the UK, US, or Australia while using globally recognized implant brands',
    ],
    faqs: [
      {
        question: 'How long does a knee replacement last?',
        answer:
          'Modern knee prosthetics are designed to last 15–25 years for most patients. Longevity is influenced by patient weight, activity level, and implant alignment. Maintaining a healthy weight and avoiding high-impact activities prolongs implant life.',
      },
      {
        question: 'When can I walk normally after knee replacement?',
        answer:
          'Most patients walk with a walking aid within 24 hours of surgery. Walking without assistance typically occurs by weeks 3–6. A normal walking pattern — without a limp — is usually restored by 3–6 months as muscles strengthen through physiotherapy.',
      },
      {
        question: 'Can both knees be replaced at the same time?',
        answer:
          'Bilateral (both-knees-at-once) replacement is possible for patients who are medically fit enough. It reduces total recovery time compared to two separate procedures but carries a higher short-term surgical load. Your surgeon will advise based on your health profile and the urgency of each knee.',
      },
      {
        question: 'Will I need blood transfusion during knee surgery?',
        answer:
          'Modern blood conservation techniques (cell salvage, tranexamic acid) have significantly reduced transfusion requirements. Most straightforward knee replacements do not require a transfusion. Your pre-operative blood tests will identify if any preparation is needed.',
      },
    ],
  },

  'ivf-treatment': {
    candidateFor: [
      'Couples who have not conceived after 12 months of unprotected intercourse (or 6 months if the woman is over 35)',
      'Women with blocked or absent fallopian tubes, severe endometriosis, or ovarian insufficiency',
      'Men with significantly low sperm count, motility, or morphology',
      'Same-sex couples and single women pursuing parenthood with donor sperm',
    ],
    whatToExpect: [
      {
        step: 'Stimulation & Monitoring',
        duration: '10–14 days',
        detail:
          'Daily hormone injections stimulate multiple egg development. Multiple ultrasound scans and blood hormone tests monitor follicle growth and adjust medication doses.',
      },
      {
        step: 'Egg Retrieval & Fertilisation',
        duration: '1 day (retrieval); 3–5 days (embryo development)',
        detail:
          'Eggs are retrieved under mild sedation via ultrasound-guided needle. A semen sample is prepared on the same day. Eggs are fertilised using standard IVF or ICSI (intracytoplasmic sperm injection). Embryos are cultured to day 3 or day 5 blastocyst stage.',
      },
      {
        step: 'Embryo Transfer & Wait',
        duration: '15-minute procedure; 2-week wait',
        detail:
          'One or two embryos are transferred into the uterus via a thin catheter — no anesthesia required. A pregnancy blood test (beta-HCG) is performed approximately 10–14 days later.',
      },
    ],
    whyKorea: [
      'Korean fertility clinics maintain advanced embryology laboratories with time-lapse incubation, comprehensive genetic testing capabilities, and high technical standards',
      'IVF costs in Korea are typically 50–70% lower than equivalent cycle costs in the US, UK, or Australia, without sacrificing laboratory quality',
      'Korean clinics have well-established pathways for international patients, including remote monitoring during stimulation (in your home country) with travel to Korea only for egg retrieval and transfer',
    ],
    faqs: [
      {
        question: 'How many IVF cycles does it typically take?',
        answer:
          'Success rates per cycle vary significantly by age and individual factors. Multiple cycles are often needed. It is important to discuss cumulative success rates — not just per-cycle rates — with your clinic, and to have a clear plan for how many cycles you are prepared to attempt. Consult your fertility specialist for a realistic assessment specific to your situation.',
      },
      {
        question: 'What is the difference between IVF and ICSI?',
        answer:
          'In standard IVF, eggs and sperm are placed together in a dish and fertilisation occurs naturally. In ICSI (Intracytoplasmic Sperm Injection), a single sperm is injected directly into each egg — this is used when sperm parameters are poor or when fertilisation failure has occurred in a previous cycle. ICSI is commonly used in Korean clinics.',
      },
      {
        question: 'Can I do part of the IVF cycle in my home country?',
        answer:
          'Yes. Many Korean fertility clinics offer a split protocol: hormone stimulation and monitoring scans are performed at a clinic near your home, and you travel to Korea for egg retrieval and embryo transfer — typically a 5–7 day visit. Frozen embryo transfers on a subsequent cycle may also allow for a shorter visit.',
      },
      {
        question: 'Is there an age limit for IVF in Korea?',
        answer:
          'Korean clinics generally perform IVF for women up to their mid-40s using their own eggs, and up to an older age with donor eggs. Specific policies vary by clinic. Age is the single most significant factor affecting IVF outcomes — early consultation is advisable.',
      },
    ],
  },

  'egg-freezing': {
    candidateFor: [
      'Women in their 20s–mid-30s who wish to preserve fertility before age-related decline',
      'Women facing medical treatments (such as chemotherapy) that may affect ovarian function',
      'Those not yet ready for pregnancy but wishing to keep future options open',
      'Women with a family history of early menopause or diminished ovarian reserve',
    ],
    whatToExpect: [
      {
        step: 'Baseline Assessment',
        duration: '1–2 appointments before stimulation begins',
        detail:
          'Blood tests measure AMH (anti-Müllerian hormone) and FSH to assess ovarian reserve. An ultrasound counts antral follicles. Results guide the stimulation protocol and predict the likely number of eggs retrieved.',
      },
      {
        step: 'Hormone Stimulation',
        duration: '10–14 days',
        detail:
          'Self-administered daily injections stimulate multiple egg development. Monitoring scans every 2–3 days track follicle growth. Trigger injection is given at the optimal moment.',
      },
      {
        step: 'Egg Retrieval & Freezing',
        duration: 'Day procedure under mild sedation',
        detail:
          'Eggs are retrieved under ultrasound guidance and immediately vitrified (flash-frozen) for storage. You can typically leave the clinic within 2–4 hours and resume normal activities within 1–2 days.',
      },
    ],
    whyKorea: [
      'Korean fertility clinics use vitrification — the most advanced egg freezing method — as standard, achieving high post-thaw egg survival rates',
      'The cost of an egg freezing cycle in Korea is considerably lower than in Western Europe or North America, making multiple cycles (to bank more eggs) more accessible',
      'Korean clinics have experience managing international patients through the stimulation phase remotely, with patients travelling to Korea only for retrieval',
    ],
    faqs: [
      {
        question: 'How many eggs should I freeze?',
        answer:
          'The number of eggs needed to achieve a good chance of future pregnancy depends on your age at the time of freezing. Younger eggs (frozen in your 20s or early 30s) tend to have higher fertilisation and implantation potential. Freezing more eggs provides greater statistical coverage. Your fertility specialist will advise on a target number based on your individual profile.',
      },
      {
        question: 'How long can eggs be stored frozen?',
        answer:
          'Vitrified eggs can be stored for many years without significant deterioration in quality. Legal storage limits vary by country — Korean regulations allow extended storage. Arrangements for long-term international storage should be discussed with your clinic.',
      },
      {
        question: 'Does egg freezing guarantee a future pregnancy?',
        answer:
          'No. Egg freezing improves your options but does not guarantee pregnancy. Not all frozen eggs will survive thawing, fertilise, develop into viable embryos, or implant. Outcomes depend on your age at freezing, egg quality, and future partner sperm quality. It is best understood as a form of insurance rather than a guarantee.',
      },
    ],
  },

  'health-screening': {
    candidateFor: [
      'Adults aged 30+ seeking a comprehensive health baseline',
      'Those with a family history of cardiovascular disease, cancer, or metabolic conditions',
      'Expatriates or international travellers wanting thorough diagnostics not readily available at home',
      'Executives and professionals seeking an annual preventive health assessment',
    ],
    whatToExpect: [
      {
        step: 'Arrival & Sample Collection',
        duration: 'Morning of Day 1 (fasting required from midnight)',
        detail:
          'Blood and urine samples are collected first. Packages typically include a full blood count, metabolic panel, lipid profile, thyroid function, and cancer marker tests.',
      },
      {
        step: 'Imaging & Specialist Assessments',
        duration: 'Half to full day',
        detail:
          'Tests may include chest X-ray, abdominal ultrasound, cardiac EKG, gastroscopy (stomach camera), colonoscopy, mammogram (for women), and low-dose CT. Specialist examinations (ophthalmology, ENT, dermatology) are often included.',
      },
      {
        step: 'Results Consultation',
        duration: '1–2 hours',
        detail:
          'A physician reviews all results with you in a follow-up consultation. Abnormal findings trigger specialist referrals. A written report summarizing all findings and recommendations is provided.',
      },
    ],
    whyKorea: [
      'Korean health screening facilities are highly systematized and designed for efficiency — full packages are completed in 1–2 days using assembly-line workflows with minimal waiting between tests',
      'Korea has high screening rates for common cancers (gastric, colorectal, liver), and its clinicians are highly experienced at identifying early-stage findings',
      'Costs for comprehensive packages in Korea are substantially lower than equivalent private health assessments in Europe, making thorough annual screening accessible',
    ],
    faqs: [
      {
        question: 'Do I need a referral to book a health screening package in Korea?',
        answer:
          'No. Health screening packages in Korea can be booked directly as a self-pay service without a referral. Your KmedTour coordinator can help you select and book the most appropriate package based on your age, gender, and health concerns.',
      },
      {
        question: 'What preparation is required before the screening?',
        answer:
          'Most packages require fasting from midnight the night before (water is usually permitted). If a colonoscopy is included, a bowel preparation (laxative) is taken the evening before. Your clinic will provide detailed preparation instructions when booking.',
      },
      {
        question: 'Will my results be explained in English?',
        answer:
          'Major Korean health screening facilities catering to international patients provide English-language reports and offer consultation with English-speaking physicians or interpreters. Your KmedTour coordinator will confirm language support when booking.',
      },
      {
        question: 'What happens if something abnormal is found?',
        answer:
          'If a screening finding requires further investigation, the facility will advise on next steps — either arranging specialist follow-up in Korea during your visit or providing a detailed referral report for your home physician to act upon.',
      },
    ],
  },

  facelift: {
    candidateFor: [
      'Adults (typically 40+) with visible facial sagging, jowling, or loose neck skin',
      'Those who want to address nasolabial folds, marionette lines, and overall facial laxity',
      'Individuals in good overall health who are non-smokers or able to quit before surgery',
      'People with realistic expectations — a facelift restores a more youthful version of your face, not a different face',
    ],
    whatToExpect: [
      {
        step: 'Consultation & Planning',
        duration: '1–2 hours',
        detail:
          'Your surgeon evaluates skin quality, facial bone structure, and degree of laxity. The appropriate technique (mini-lift, SMAS lift, deep plane) is selected. Photos are taken for reference and planning.',
      },
      {
        step: 'Surgery',
        duration: '3–5 hours (longer for combined neck lift)',
        detail:
          'Performed under general anesthesia or intravenous sedation. Incisions are placed within the hairline and around the ear to conceal scarring. The SMAS layer is repositioned and excess skin removed.',
      },
      {
        step: 'Recovery',
        duration: '2–3 weeks visible swelling; full result at 3–6 months',
        detail:
          'Drains may be placed for 24–48 hours. Sutures are removed at 7–10 days. Most patients are socially presentable (with makeup) at 3–4 weeks. Scars continue to fade for 12–18 months.',
      },
    ],
    whyKorea: [
      'Korean plastic surgeons offer SMAS-layer techniques that create natural, long-lasting results — avoiding the stretched or windswept appearance associated with older skin-only approaches',
      'Korea has a large pool of board-certified plastic surgeons with focused experience in facial rejuvenation procedures across all age groups',
      'Facelift procedures in Korea are priced competitively compared to private clinics in the US, UK, or Singapore with comparable surgeon calibre',
    ],
    faqs: [
      {
        question: 'What is the difference between a mini lift and a full facelift?',
        answer:
          'A mini lift (short scar lift) targets the lower face and jaw using smaller incisions and local anesthesia — recovery is faster (1–2 weeks) and results are more subtle. A full facelift addresses the entire face and neck with greater correction. Your surgeon will recommend the approach best matched to your degree of laxity.',
      },
      {
        question: 'How long do facelift results last?',
        answer:
          'A well-performed facelift typically maintains visible improvement for 7–10 years. The face continues to age naturally after surgery, but patients consistently look younger than they would have without the procedure for many years afterward.',
      },
      {
        question: 'Can I combine a facelift with other procedures?',
        answer:
          'Commonly combined procedures include brow lift, upper or lower eyelid surgery, fat grafting to restore facial volume, and laser resurfacing. Your surgeon will advise on what can be safely combined in a single session versus staged separately.',
      },
    ],
  },

  'breast-augmentation': {
    candidateFor: [
      'Adults who wish to increase breast size or improve breast symmetry',
      'Women following significant weight loss or breastfeeding whose breast volume has diminished',
      'Those seeking reconstruction following breast surgery (in appropriate cases)',
      'Individuals in good overall health with realistic expectations about outcomes',
    ],
    whatToExpect: [
      {
        step: 'Consultation & Implant Selection',
        duration: '1–2 hours',
        detail:
          'Your surgeon discusses implant type (silicone gel, cohesive gel, saline), shape (round vs. anatomical), profile, and incision location. Sizers may be used to help visualise the planned result. Chest measurements guide implant volume selection.',
      },
      {
        step: 'Surgery',
        duration: '1–2 hours',
        detail:
          'Performed under general anesthesia. The implant is placed through the chosen incision approach (inframammary fold, around the areola, or via the armpit) either under the chest muscle (submuscular) or above it (subglandular). A drain may be placed for 24–48 hours.',
      },
      {
        step: 'Recovery',
        duration: '1–2 weeks to light activity; 6 weeks to full activity',
        detail:
          'Post-operative soreness — particularly with submuscular placement — is managed with prescribed pain relief. A surgical bra is worn for 4–6 weeks. Implants settle into their final position over 3–6 months.',
      },
    ],
    whyKorea: [
      'Korean plastic surgeons have extensive experience with a wide spectrum of body types and aesthetic preferences, tailoring implant choice and technique to each patient individually',
      'Korean FDA-approved implants are manufactured to strict quality standards comparable to CE-marked European devices',
      'Breast augmentation in Korea is priced considerably lower than in Western countries for equivalent quality and safety standards',
    ],
    faqs: [
      {
        question: 'Under the muscle or over the muscle — which is better?',
        answer:
          'Submuscular (under the muscle) placement tends to give a more natural appearance — particularly important for slender patients with little natural breast tissue. It also makes mammogram interpretation easier. Subglandular (above the muscle) placement may have an easier recovery but can look less natural in thin patients. Your surgeon will recommend based on your anatomy.',
      },
      {
        question: 'How long do breast implants last?',
        answer:
          'Modern silicone gel implants do not have a fixed expiry date. They do not need to be replaced on a set schedule if there are no problems. However, implant-related issues (capsular contracture, implant rupture, or position change) may require revision surgery at some point. Lifelong occasional MRI monitoring is recommended for silicone implants.',
      },
      {
        question: 'Will breast augmentation affect breastfeeding?',
        answer:
          'Most women with breast implants can breastfeed successfully. The risk of reduced milk supply is slightly higher with periareolar (around-the-nipple) incisions compared to other approaches. If future breastfeeding is a priority, discuss this with your surgeon when planning the procedure.',
      },
    ],
  },

  liposuction: {
    candidateFor: [
      'Adults at or near a healthy weight with localised fat deposits that do not respond to diet and exercise',
      'Those with good skin elasticity — liposuction removes fat but does not tighten loose or sagging skin',
      'Non-smokers in good general health without blood-clotting disorders or active skin conditions in the treatment area',
      'Individuals with realistic expectations — liposuction contours; it does not replace weight management',
    ],
    whatToExpect: [
      {
        step: 'Consultation & Area Marking',
        duration: '1 hour',
        detail:
          'Your surgeon marks the treatment areas with you in a standing position. The most appropriate liposuction technique is selected for each area. A compression garment fitting may be conducted at this appointment.',
      },
      {
        step: 'Surgery',
        duration: '1–3 hours (varies by number of areas)',
        detail:
          'Tumescent solution is infiltrated into the treatment area to reduce bleeding and provide local anesthesia. Fat is then removed via small cannulas through tiny incisions (typically 3–5mm). General anesthesia or deep sedation is used for larger treatment areas.',
      },
      {
        step: 'Recovery',
        duration: '1 week to desk work; 3–6 months to full result',
        detail:
          'A compression garment must be worn for 4–6 weeks. Initial swelling makes results hard to assess — final contour is visible at 3–6 months. Bruising resolves within 2–3 weeks. Light walking is encouraged from day 1 to reduce clot risk.',
      },
    ],
    whyKorea: [
      'Korean plastic surgeons frequently combine liposuction with complementary body contouring procedures (tummy tuck, body lift, fat grafting) in well-structured combination packages',
      'High-volume surgical experience in Korean clinics enables refined technique for smooth, even fat removal that minimises contour irregularities',
      'Liposuction pricing in Korea is significantly lower than equivalent procedures in the US, UK, or Singapore',
    ],
    faqs: [
      {
        question: 'Is liposuction permanent?',
        answer:
          'The fat cells removed by liposuction do not return. However, remaining fat cells in the body can still enlarge with significant weight gain, potentially affecting the treated areas. Maintaining a stable weight after the procedure preserves results long-term.',
      },
      {
        question: 'What areas can be treated with liposuction?',
        answer:
          'Commonly treated areas include the abdomen, flanks (love handles), back, thighs (inner and outer), upper arms, neck and chin, and knees. Some areas (face, buttocks) require specific techniques. Your surgeon will advise which areas are safe and appropriate to treat in your case.',
      },
      {
        question: 'Does liposuction tighten loose skin?',
        answer:
          'Liposuction removes fat but does not primarily address excess or loose skin. Patients with good skin elasticity will see the skin contract naturally after fat removal. Patients with significant skin laxity may need a skin-tightening procedure (such as a tummy tuck for the abdomen) in addition to liposuction.',
      },
    ],
  },

  'tummy-tuck': {
    candidateFor: [
      'Adults with excess abdominal skin following significant weight loss or pregnancy',
      'Those with separated or weakened abdominal muscles (diastasis recti) causing a rounded abdomen that does not respond to exercise',
      'Individuals who are at or near their goal weight and not planning further pregnancies',
      'Non-smokers in good general health — smoking significantly impairs healing',
    ],
    whatToExpect: [
      {
        step: 'Consultation & Planning',
        duration: '1–2 hours',
        detail:
          'Your surgeon assesses the degree of skin excess, muscle separation, and fat distribution. The planned incision location and length are discussed. Liposuction of adjacent areas is frequently incorporated into the plan.',
      },
      {
        step: 'Surgery',
        duration: '2–4 hours',
        detail:
          'Performed under general anesthesia. A hip-to-hip incision is made low on the abdomen. Excess skin is removed, abdominal muscles are sutured together if separated, and the navel is repositioned. Liposuction may be performed simultaneously on the flanks.',
      },
      {
        step: 'Recovery',
        duration: '2–3 weeks significant restriction; full activity at 6 weeks',
        detail:
          'Drains are typically placed for 7–14 days. Sleeping in a slightly bent-forward position is required for 1–2 weeks to reduce tension on the incision. A compression garment is worn for 6 weeks. Heavy lifting and strenuous exercise are restricted for 6 weeks.',
      },
    ],
    whyKorea: [
      'Korean plastic surgeons routinely combine abdominoplasty with liposuction of the flanks, waist, and back in a single session for comprehensive body contouring results',
      'International patients benefit from structured recovery programs at Korean clinics, with nursing support during the critical early healing phase',
      'Tummy tuck procedures in Korea are priced significantly below equivalent quality in Western private practice',
    ],
    faqs: [
      {
        question: 'Will there be a visible scar after a tummy tuck?',
        answer:
          'Yes. A tummy tuck always leaves a horizontal scar that runs across the lower abdomen from hip to hip. The incision is placed deliberately low so that the scar falls below the waistline of underwear or swimwear. Scars fade significantly over 12–18 months with appropriate care (silicone sheets, sun protection).',
      },
      {
        question: 'Can I have a tummy tuck if I plan to have more children?',
        answer:
          'It is advisable to complete your family before undergoing abdominoplasty. A subsequent pregnancy will stretch the repaired abdominal muscles and tightened skin, potentially reversing the results and requiring revision surgery. This is not a contraindication, but the timing consideration is important to discuss with your surgeon.',
      },
      {
        question: 'What is the difference between a full tummy tuck and a mini tummy tuck?',
        answer:
          'A full tummy tuck addresses the entire abdomen — both above and below the navel — and includes navel repositioning. A mini tummy tuck addresses only the lower abdomen below the navel with a shorter incision, suitable for patients with mild lower skin excess only. Most patients benefit from a full tummy tuck for complete correction.',
      },
    ],
  },

  'dental-implant-surgery': {
    candidateFor: [
      'Adults missing one or more teeth who want a permanent, stable tooth replacement',
      'Those with adequate jawbone density (or who are candidates for bone grafting prior to implant placement)',
      'Individuals with well-controlled general health — systemic conditions affecting healing require specialist review',
      'Non-smokers or those committed to quitting, as smoking impairs osseointegration',
    ],
    whatToExpect: [
      {
        step: 'Digital Assessment & Surgical Guide Fabrication',
        duration: '1–2 appointments',
        detail:
          'A CBCT 3D scan is taken. Implant positions are planned digitally. A custom surgical guide template is fabricated to direct the drill with precision during surgery.',
      },
      {
        step: 'Implant Placement Surgery',
        duration: '30–90 minutes per implant',
        detail:
          'The surgical guide is placed over the jaw and implants are inserted through the guide holes under local anesthesia. Digital guidance eliminates guesswork, reducing the risk of nerve or sinus proximity issues.',
      },
      {
        step: 'Healing & Crown Phase',
        duration: '3–6 months osseointegration; crown fitting at follow-up',
        detail:
          'The implant integrates with the jawbone over 3–6 months. A scan file and crown specifications from the Korean clinic can be sent to your home dentist for final crown fabrication — minimising the need for a second international trip.',
      },
    ],
    whyKorea: [
      'Korean dental implant brands are manufactured to the same quality standards as European and American brands and are widely trusted in clinics across Asia, Europe, and beyond',
      'Computer-guided implant surgery is standard in Korean dental clinics, improving accuracy and reducing surgical time',
      'Korean dental implant surgery costs 40–60% less than equivalent quality in Western European or North American clinics',
    ],
    faqs: [
      {
        question: 'What makes computer-guided implant surgery different from freehand placement?',
        answer:
          'Computer-guided implant surgery uses a CBCT scan and digital planning software to design the optimal implant position before surgery. A printed surgical guide then directs the drill during the procedure, improving accuracy and reducing the risk of complications such as nerve or sinus involvement. It is particularly valuable in complex or multiple-implant cases.',
      },
      {
        question: 'Can I complete my dental implant treatment in one trip to Korea?',
        answer:
          'In immediate-loading cases (where a temporary crown is placed on the same day as implant surgery), patients can leave with functioning provisional teeth in one visit. The permanent crown is placed after osseointegration — this can be arranged with a local dentist using scan files and specifications from the Korean clinic, avoiding the need for a second long-haul trip.',
      },
      {
        question: 'What are Korean implant brands and are they reliable?',
        answer:
          'Osstem, Dentium, Neobiotech, Megagen, and Genoss are among the leading Korean implant manufacturers. Osstem is the 4th largest implant brand globally by market share. These brands carry CE certification, are used in clinics across 80+ countries, and are backed by long-term clinical data. They are comparable in quality and longevity to European and American brands.',
      },
    ],
  },
}
