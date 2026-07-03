#!/usr/bin/env node
// Auto-generated 2026-07-03 — Track A content batch
const fs = require('fs');
const path = require('path');

const WORKTREE = path.resolve(__dirname, '..');
const SIDECAR_DIR = path.join(WORKTREE, 'lib', 'data', 'treatment-content');
const INLINE_QUERIES = path.join(WORKTREE, 'scripts', 'treatment-inline-queries.json');

// ── Read ACL from saved output ──────────────────────────────────────────────
const aclRaw = JSON.parse(fs.readFileSync(
  'C:/Users/Lenovo/Desktop/Claude cowork/startups/kmedtour/outputs/acl-reconstruction-sidecar.json',
  'utf8'
));
const aclSidecar = aclRaw[0];

// ── Define the other 7 sidecars ─────────────────────────────────────────────
const sidecars = [

// ── 1. HIP REPLACEMENT ──────────────────────────────────────────────────────
{
  slug: "hip-replacement",
  shortDescription: "Surgery to replace a damaged hip joint with a prosthetic implant, relieving pain and restoring mobility.",
  quickAnswer: [
    "**Hip replacement (total hip arthroplasty)** removes the damaged ball and socket of the hip joint and replaces them with prosthetic components — typically a metal or ceramic ball on a titanium stem, paired with a polyethylene or ceramic cup — restoring smooth, pain-free movement.",
    "**Best candidates** are adults with severe hip arthritis, avascular necrosis, or hip fracture causing persistent pain, significant mobility loss, or an inability to manage daily activities despite conservative treatment.",
    "**Recovery in Korea spans 14 days:** walking with an aid typically begins within a day of surgery; most patients return to independent indoor walking within weeks, with full functional recovery continuing over months.",
    "**Typical cost in Korea: $15,000–$30,000 USD**, depending on implant type and fixation method, bilateral versus unilateral surgery, and hospital tier."
  ],
  keyFacts: [
    { label: "Procedure time", value: "1–2.5 hours" },
    { label: "Anesthesia", value: "General or spinal" },
    { label: "Hospital stay", value: "3–5 days" },
    { label: "Recommended stay in Korea", value: "14 days" },
    { label: "Recovery", value: "Walking with an aid within days; functional return to daily activities over weeks to months" },
    { label: "Typical cost in Korea", value: "$15,000–$30,000 USD" }
  ],
  sections: {
    overview: "**Hip replacement** removes the worn or damaged surfaces of the hip joint and replaces them with prosthetic components designed to restore smooth, pain-free movement. Patients from Africa, the Middle East, and Southeast Asia choose Korea for this procedure because accredited hospitals combine experienced orthopaedic teams, modern implant options, and structured post-operative rehabilitation within one coordinated pathway.\n\nThe hip joint is a ball-and-socket joint where the rounded head of the femur (thigh bone) meets the acetabulum (socket) of the pelvis. When cartilage covering these surfaces wears away — most often from **osteoarthritis**, **avascular necrosis**, or **inflammatory arthritis** — bone rubs on bone, causing pain, stiffness, and progressive loss of function.\n\n**Total hip replacement** involves:\n\n- Removing the worn femoral head and damaged socket lining\n- Fixing a titanium or cobalt-chrome stem into the femur\n- Attaching a ceramic or metal ball to the stem\n- Placing a prosthetic cup into the cleaned acetabulum, usually lined with polyethylene or ceramic\n\nModern implants are designed to last many years under normal use, though outcomes depend on activity level, body weight, and implant selection.\n\nKmedTour coordinates the full journey — pre-arrival imaging review, hospital admission, interpreter support, and a written rehabilitation plan — so that recovery continues safely once you return home.",
    candidacy: "You may be a candidate for hip replacement if you have confirmed hip joint damage causing:\n\n- Persistent hip or groin pain not adequately controlled with medication or physiotherapy\n- Significant stiffness limiting daily activities such as walking, climbing stairs, or putting on shoes\n- Hip pain that disrupts sleep\n- Mobility loss affecting independence or quality of life\n\n**Common underlying conditions:**\n\n- **Osteoarthritis** — progressive cartilage loss from wear\n- **Avascular necrosis** — bone death due to disrupted blood supply\n- **Rheumatoid or inflammatory arthritis**\n- **Post-traumatic arthritis** following a prior fracture\n- **Hip dysplasia** causing early joint damage\n\n**Before approving surgery, the team reviews:**\n\n- General cardiovascular fitness for anaesthesia\n- Diabetes control and wound-healing capacity\n- Body weight (very high BMI may affect implant longevity and anaesthetic risk)\n- Active infection anywhere in the body (must be cleared before surgery)\n- Bone quality (imaging and history of osteoporosis)\n\nA pre-travel video consultation with your recent X-rays and MRI allows the surgeon to assess the joint, discuss implant options, and confirm suitability before you book travel.",
    procedure_steps: "Hip replacement is performed under **general or spinal anaesthesia** and typically takes one to two and a half hours.\n\n**Surgical approach:**\nThe surgeon accesses the hip joint through an incision, most commonly via a **posterior** or **anterolateral approach**. Minimally invasive approaches use smaller incisions and aim to preserve surrounding muscles where anatomy allows.\n\n**Preparing the femur:**\nThe damaged femoral head is carefully removed. The femoral canal is shaped using specialised instruments, and a metal stem — **cementless** (press-fit) or **cemented** — is fixed into the canal. A ceramic or metal ball is attached to the top of the stem.\n\n**Preparing the acetabulum:**\nThe socket is cleared of damaged cartilage and shaped to accept the prosthetic cup. The cup is fixed into the pelvis — again cementless or cemented — and a liner (polyethylene or ceramic) is inserted.\n\n**Assembly and stability check:**\nThe ball is seated in the cup, the hip is moved through its full range, and leg length and stability are confirmed. The incision is closed in layers and dressed.\n\nBlood-thinning medication and compression devices begin to reduce clot risk. Early physiotherapy — often starting the same day — focuses on moving the hip and getting you upright safely.",
    recovery_timeline: "Recovery begins within hours of surgery and continues for months. The structured 14-day Korea stay supports early progress before you fly home.\n\n**Day 1 (in hospital):**\n\n- Physiotherapy typically begins on the day of surgery or the morning after\n- Standing and early walking with a frame or crutches under physiotherapist guidance\n- Focus: weight-bearing as tolerated, hip precautions, preventing clots\n\n**Days 2–5 (inpatient):**\n\n- Progressing to walking greater distances\n- Stair practice and sit-to-stand training before discharge from hospital\n- Wound monitoring and pain management\n\n**Days 6–14 (pre-departure):**\n\n- Outpatient physiotherapy continues at the hospital or rehabilitation centre\n- Walking distance and confidence increase\n- Surgeon confirms wound healing and clearance for long-haul flight\n- KmedTour provides a **written rehabilitation plan** and operative summary for your home physiotherapist\n\n**Months 1 and beyond (at home):**\n\n- Most patients progress from walking aids to independent walking over several weeks\n- Full functional recovery — including return to low-impact activities — typically over months\n- Hip precautions (avoiding extremes of rotation and flexion) apply in the early phase; your surgeon specifies duration\n\nArrange a local orthopaedic review after returning. Report fever, increasing wound redness, sudden severe pain, or calf swelling promptly.",
    cost_breakdown: "The estimated cost for hip replacement through KmedTour ranges from **$15,000 to $30,000 USD**. Where you fall in this range depends on:\n\n- Implant type: material pairing (ceramic-on-polyethylene, ceramic-on-ceramic, metal-on-polyethylene) and brand tier\n- Fixation method: cementless versus cemented\n- Unilateral versus bilateral (both hips) surgery\n- Hospital tier and room type\n- Length of inpatient stay\n\n**What the quoted price generally covers:**\n\n- Surgeon, assistant, and anaesthesia fees\n- Operating room and implant costs\n- Inpatient hospital stay (typically 3–5 nights)\n- Standard medications during admission\n- Inpatient physiotherapy sessions\n- Pre-operative blood tests and imaging on arrival\n\n**What is typically not included:**\n\n- International flights and visa fees\n- Accommodation before and after the hospital stay\n- Meals outside the hospital\n- Walking aids for home use\n- Extended rehabilitation and follow-up care at home\n\nKmedTour provides a **written, itemised quotation** after the surgeon reviews your imaging, so you understand exactly what is covered before committing.",
    why_korea: "Korea is a well-established destination for orthopaedic surgery, with hospitals accredited under national and international standards and operating within a system regulated by the **Ministry of Health and Welfare**.\n\n**Accreditation and oversight:**\n\n- **KOIHA** (Korean Organisation for International Healthcare Accreditation) sets patient-safety and quality benchmarks for hospitals treating international patients\n- **KHIDI's Medical Korea programme** supports access to accredited facilities for foreign patients\n- These frameworks reflect country-level governance, not just individual hospital reputation\n\n**Clinical approach:**\nKorean orthopaedic teams at accredited hospitals perform high volumes of hip replacements using modern implant systems and established fixation techniques. Integrated physiotherapy begins the day of surgery, shortening hospital stay while maintaining structured early rehabilitation.\n\n**International patient infrastructure:**\nDedicated international patient departments provide interpreter services in English, Arabic, and other languages, structured discharge planning, and coordination with the patient's home medical team.\n\nKmedTour adds end-to-end coordination — from pre-arrival imaging review and hospital matching to a written rehabilitation handover — so care continues without interruption once you return home."
  },
  costTable: [
    { item: "Total hip replacement — standard implant", cost: "$15,000–$22,000" },
    { item: "Total hip replacement — premium ceramic-on-ceramic implant", cost: "$22,000–$30,000" },
    { item: "Bilateral hip replacement (both hips, same admission)", cost: "$25,000–$45,000" },
    { item: "Hospital stay (3–5 nights, standard room)", cost: "Typically included in package" },
    { item: "Inpatient physiotherapy during admission", cost: "Typically included in package" }
  ],
  callouts: [],
  keyTakeaways: [
    "Hip replacement removes worn joint surfaces and replaces them with prosthetic components; implant choice — material pairing, fixation method — is discussed with the surgeon before travel based on your imaging and activity goals.",
    "Early physiotherapy begins the day of or the day after surgery; the 14-day Korea stay supports early mobilisation before the long-haul flight, and KmedTour provides a written rehabilitation plan for your home physiotherapist.",
    "Korean hospitals accredited under KOIHA and the Medical Korea programme combine experienced orthopaedic teams, integrated rehabilitation, and dedicated international patient support.",
    "Costs range from $15,000 to $30,000 USD depending on implant type, fixation, and whether both hips are treated; an itemised quote is provided after the surgeon reviews your imaging."
  ],
  entities: [
    { name: "Hip replacement", url: "https://en.wikipedia.org/wiki/Hip_replacement" },
    { name: "Osteoarthritis", url: "https://en.wikipedia.org/wiki/Osteoarthritis" },
    { name: "Avascular necrosis", url: "https://en.wikipedia.org/wiki/Avascular_necrosis" },
    { name: "Medical tourism in South Korea", url: "https://en.wikipedia.org/wiki/Medical_tourism_in_South_Korea" },
    { name: "Korean Organisation for International Healthcare Accreditation", url: "https://en.wikipedia.org/wiki/Korean_Organisation_for_International_Healthcare_Accreditation" }
  ],
  faqs: [
    {
      q: "How long will the implant last?",
      a: "Modern hip implants are designed for long service life under normal use, and registry data from multiple countries show the majority of implants functioning well many years after surgery. Longevity depends on factors including activity level, body weight, implant type, and fixation. High-impact activities — such as running or jumping — can accelerate wear and are generally discouraged after hip replacement. Your surgeon will discuss realistic expectations and activity guidelines based on your specific implant and health profile."
    },
    {
      q: "What are hip precautions, and how long do they apply?",
      a: "Hip precautions are movement restrictions designed to prevent dislocation while the soft tissues heal around the new joint. Common restrictions include avoiding bending the hip past a right angle, crossing the legs, or rotating the foot excessively inward or outward. The precautions typically apply for the first several weeks, though the exact period depends on the surgical approach used — some approaches are associated with lower dislocation risk and shorter restriction periods. Your surgeon will specify what applies to you before discharge."
    },
    {
      q: "Is it safe to fly home after hip replacement?",
      a: "Long-haul flights carry an elevated risk of deep-vein thrombosis (DVT) after lower-limb surgery. Most surgeons advise against flying until the immediate post-operative phase is complete and early mobilisation is well established. The 14-day Korea stay is structured in part to allow this clearance period. Before departure, you will receive guidance on compression stockings, hydration, and ankle exercises during the flight, as well as any prescribed blood-thinning medication. Always confirm flying clearance with your surgeon before booking your return flight."
    },
    {
      q: "Can both hips be replaced at the same time?",
      a: "Simultaneous bilateral hip replacement (both hips in one operation) is performed at some centres and may suit patients who have significant disease in both hips and are otherwise fit for a longer procedure and anaesthetic. It reduces the total number of hospital admissions and travel trips but involves a longer surgery and a more demanding early recovery. Staged bilateral replacement — one hip, then the other after full recovery — is more common. Your surgeon will assess which approach is appropriate based on your imaging, overall health, and fitness for anaesthesia."
    },
    {
      q: "What happens to rehabilitation after I return home?",
      a: "Before leaving Korea, KmedTour provides a written, staged rehabilitation plan alongside your operative summary, implant details, and hip precaution instructions. This document is designed to be handed to a physiotherapist in your home country so the programme continues without interruption. You should arrange a local orthopaedic review as soon as possible after returning. If you develop fever, increasing wound redness, sudden severe hip pain, or swelling in the calf at any point, seek medical attention immediately."
    }
  ],
  references: []
},

// ── 2. SPINAL FUSION ────────────────────────────────────────────────────────
{
  slug: "spinal-fusion",
  shortDescription: "Surgery that permanently joins two or more vertebrae to eliminate painful motion and stabilise the spine.",
  quickAnswer: [
    "**Spinal fusion** permanently connects two or more vertebrae using bone graft and fixation hardware — rods, screws, or cages — eliminating the painful movement between them while maintaining overall spinal function above and below.",
    "**Best candidates** are adults with degenerative disc disease, spondylolisthesis, spinal stenosis causing nerve compression, or spinal instability that has not responded to extended conservative treatment including physiotherapy and injections.",
    "**Korea stay is 7–14 days:** patients typically stand and begin walking within days of surgery; hospital stay is usually 5–7 nights, with supervised physiotherapy continuing before departure.",
    "**Typical cost in Korea: $18,000–$40,000 USD**, depending on the number of levels fused, the surgical approach, and implant selection."
  ],
  keyFacts: [
    { label: "Procedure time", value: "2–5 hours (varies with levels fused)" },
    { label: "Anesthesia", value: "General" },
    { label: "Hospital stay", value: "5–7 days" },
    { label: "Recommended stay in Korea", value: "7–14 days" },
    { label: "Recovery", value: "Walking within days; return to sedentary work over weeks; full fusion solidifies over months" },
    { label: "Typical cost in Korea", value: "$18,000–$40,000 USD" }
  ],
  sections: {
    overview: "**Spinal fusion** permanently connects two or more vertebrae, eliminating the painful motion between them while preserving function in the rest of the spine. Patients from Africa, the Middle East, and Southeast Asia choose Korea for spinal surgery because accredited hospitals combine experienced spine teams, modern implant systems, and intraoperative neuromonitoring within coordinated care pathways.\n\nBetween each vertebra sits an **intervertebral disc** — a cushion that absorbs load and allows movement. When discs degenerate, collapse, or shift out of position, they can cause:\n\n- **Axial pain** — deep aching in the back or neck\n- **Radiculopathy** — shooting pain, numbness, or weakness down an arm or leg from nerve compression\n- **Myelopathy** — spinal cord compression causing weakness or coordination problems\n\nFusion works by joining the painful motion segment so that load is shared across solid bone rather than through a diseased disc or unstable joint. Bone graft — from the patient's own body, a donor, or a synthetic source — fills the space and gradually turns into solid bone over months.\n\nModern approaches include **TLIF** (transforaminal), **PLIF** (posterior), **ALIF** (anterior), and **XLIF/LLIF** (lateral) — the right technique depends on the level and cause of your problem.\n\nKmedTour coordinates pre-arrival imaging review, interpreter support, and a written physiotherapy handover plan.",
    candidacy: "You may be a candidate for spinal fusion if you have a confirmed spinal condition causing persistent symptoms not resolved by conservative care:\n\n- **Degenerative disc disease** with confirmed disc collapse and axial pain\n- **Spondylolisthesis** (vertebral slippage) causing instability or nerve compression\n- **Spinal stenosis** with leg symptoms (claudication, weakness, numbness) not controlled by injections\n- **Disc herniation** with persistent nerve symptoms after adequate conservative management\n- **Spinal instability** from prior surgery, trauma, or tumour\n\n**Conservative care that should typically be tried first:**\n\nPhysiotherapy, structured pain management, and image-guided injections over an adequate period. Fusion is not first-line treatment for back pain without clear structural cause.\n\n**Before approving surgery, the team reviews:**\n\n- MRI (and CT where needed) confirming the structural problem at the intended level\n- Cardiovascular fitness for general anaesthesia\n- Diabetes control and smoking history (smoking significantly impairs fusion and is a contraindication at many centres)\n- Bone density (osteoporosis affects implant fixation)\n- Active infection\n\nA pre-travel video consultation with your recent imaging allows the spine surgeon to assess your case, discuss the approach, and confirm suitability before you book.",
    procedure_steps: "Spinal fusion is performed under **general anaesthesia**. Procedure length varies from about two hours for a single-level fusion to five or more hours for multi-level or revision cases.\n\n**Approach selection:**\nThe surgeon chooses the approach based on the location and nature of your problem:\n\n- **Posterior (PLIF/TLIF):** approach from the back; most common for lumbar fusion\n- **Anterior (ALIF):** approach from the front of the abdomen; allows a larger disc space cage\n- **Lateral (XLIF/LLIF):** approach from the side through a small flank incision; less blood loss for certain cases\n\n**Decompression:**\nIf nerve compression is present, the surgeon removes the offending material — disc fragment, bone spur, or thickened ligament — first, to relieve nerve pressure.\n\n**Implant placement:**\nA cage (titanium or PEEK) filled with bone graft is placed in the prepared disc space to restore height and alignment. Pedicle screws and connecting rods fix the segment above and below the fusion level.\n\n**Bone grafting:**\nBone graft provides the biological scaffold for fusion. Options include:\n\n- Autograft from the patient's own iliac crest or local bone\n- Allograft (donor bone)\n- Synthetic bone substitute\n\n**Intraoperative neuromonitoring (IONM)** continuously checks nerve function throughout the procedure.\n\nThe incision is closed and a drain may be placed briefly. Early mobilisation typically begins the next day.",
    recovery_timeline: "Recovery begins within 24 hours of surgery and continues for many months as the bone fusion solidifies. The Korea stay supports the critical early phase.\n\n**Day 1 (in hospital):**\n\n- Most patients stand and take first steps with physiotherapist support within 24 hours\n- Pain is managed with intravenous and oral medication\n- A brace may be prescribed — wear guidance is surgeon-specific\n\n**Days 2–7 (inpatient):**\n\n- Progressive walking, stair practice, and safe movement education\n- Drain removed (if placed) within 2 days\n- Wound monitoring and swelling management\n\n**Days 7–14 (pre-departure):**\n\n- Continued physiotherapy focused on safe movement, gentle core activation, and walking endurance\n- Surgeon confirms wound status and clears long-haul flight\n- KmedTour provides a **written rehabilitation plan**, operative summary, and implant details for your home team\n\n**Months 1–3 and beyond (at home):**\n\n- Avoid heavy lifting, bending, and twisting in the early months — your surgeon specifies exact restrictions\n- Bone fusion solidifies gradually over several months; imaging at follow-up confirms progress\n- Return to sedentary work: typically several weeks; manual or physical work: longer, surgeon-guided\n- Smoking must be avoided completely — it is one of the most consistent predictors of fusion failure\n\nArrange a local spinal or orthopaedic review after returning. Report new weakness, numbness, bladder or bowel changes, fever, or wound problems promptly.",
    cost_breakdown: "The estimated cost for spinal fusion through KmedTour ranges from **$18,000 to $40,000 USD**. Where you fall in this range depends primarily on:\n\n- Number of levels fused (single-level vs multi-level)\n- Surgical approach (posterior, anterior, or combined)\n- Implant selection: cage material, pedicle screw system, bone graft type\n- Whether a decompression procedure is performed at the same time\n- Hospital stay length\n\n**What the quoted price generally covers:**\n\n- Surgeon, assistant, and anaesthesia fees\n- Operating room, implants, and intraoperative neuromonitoring\n- Inpatient hospital stay (typically 5–7 nights)\n- Standard medications, blood transfusion if needed, drain management\n- Inpatient physiotherapy during admission\n- Pre-operative imaging review and tests on arrival\n\n**What is typically not included:**\n\n- International flights and visa fees\n- Accommodation before and after the hospital stay\n- Post-discharge brace cost\n- Extended rehabilitation and follow-up at home\n\nKmedTour provides a **written, itemised quotation** after the surgeon reviews your imaging.",
    why_korea: "Korea is an established destination for complex spinal surgery, with hospitals accredited under national and international standards and regulated by the **Ministry of Health and Welfare**.\n\n**Accreditation and oversight:**\n\n- **KOIHA** (Korean Organisation for International Healthcare Accreditation) sets quality and safety benchmarks for hospitals treating international patients\n- **KHIDI's Medical Korea programme** supports foreign patient access to accredited facilities\n- These frameworks reflect country-level governance, not just individual hospital reputation\n\n**Clinical approach:**\nAccredited Korean hospitals offer a range of fusion techniques including minimally invasive approaches that reduce muscle damage and aim to shorten inpatient stay. Intraoperative neuromonitoring is standard at major centres. Physiotherapy is integrated into the care pathway from the first day after surgery.\n\n**International patient infrastructure:**\nDedicated international patient departments at accredited hospitals provide interpreter services, structured discharge planning, and coordination with the patient's home medical team.\n\nKmedTour adds pre-arrival imaging review, hospital matching, and a written rehabilitation handover for your home physiotherapist — so care planned in Korea continues after you return."
  },
  costTable: [
    { item: "Single-level lumbar fusion (TLIF or PLIF)", cost: "$18,000–$26,000" },
    { item: "Two-level lumbar fusion", cost: "$24,000–$34,000" },
    { item: "Three or more levels / complex reconstruction", cost: "$32,000–$40,000+" },
    { item: "Cervical fusion (1–2 levels, ACDF)", cost: "$18,000–$28,000" },
    { item: "Hospital stay (5–7 nights, standard room)", cost: "Typically included in package" }
  ],
  callouts: [],
  keyTakeaways: [
    "Spinal fusion permanently joins painful motion segments using bone graft and fixation hardware; the surgical approach — posterior, anterior, or lateral — is selected based on your specific condition and imaging.",
    "Bone fusion solidifies over months: early restrictions on bending, lifting, and twisting protect the implants while the graft matures — and smoking must be stopped completely, as it is a leading cause of fusion failure.",
    "Korean hospitals accredited under KOIHA combine experienced spine teams, intraoperative neuromonitoring, minimally invasive options, and integrated physiotherapy within international-patient care pathways.",
    "Costs range from $18,000 to $40,000 USD depending on levels fused, approach, and implants; an itemised quote is provided after the surgeon reviews your imaging."
  ],
  entities: [
    { name: "Spinal fusion", url: "https://en.wikipedia.org/wiki/Spinal_fusion" },
    { name: "Intervertebral disc", url: "https://en.wikipedia.org/wiki/Intervertebral_disc" },
    { name: "Spondylolisthesis", url: "https://en.wikipedia.org/wiki/Spondylolisthesis" },
    { name: "Spinal stenosis", url: "https://en.wikipedia.org/wiki/Spinal_stenosis" },
    { name: "Medical tourism in South Korea", url: "https://en.wikipedia.org/wiki/Medical_tourism_in_South_Korea" },
    { name: "Korean Organisation for International Healthcare Accreditation", url: "https://en.wikipedia.org/wiki/Korean_Organisation_for_International_Healthcare_Accreditation" }
  ],
  faqs: [
    {
      q: "How long does it take for a spinal fusion to fully heal?",
      a: "Bone fusion is a gradual biological process. The implants provide immediate mechanical stability, but the bone graft takes many months to fully solidify into mature bone — a process confirmed by follow-up imaging. Early restrictions on bending, twisting, and lifting protect the hardware while the graft matures. Your surgeon will specify activity restrictions and follow-up imaging timelines based on the number of levels fused and the bone graft used."
    },
    {
      q: "Will fusion cause problems in the vertebrae above and below?",
      a: "Adjacent segment disease — accelerated wear at the levels next to a fusion — is a recognised long-term consideration. It occurs because fused segments transfer more load to neighbouring discs. The risk is higher with multi-level fusions and in patients who already have degeneration at adjacent levels. The surgeon selects the minimum number of levels required to address your problem, and post-operative physiotherapy focuses on strengthening surrounding muscles to distribute load effectively. Most patients with adjacent segment changes are managed without further surgery."
    },
    {
      q: "Can I fly long-haul after spinal fusion?",
      a: "Flying is generally possible several days after surgery once the immediate post-operative phase has passed, early mobilisation is established, and the surgeon has confirmed wound integrity. Long-haul flights after any spinal surgery carry some risk of blood clots; you will receive guidance on compression stockings, staying hydrated, and gentle movement during the flight. Confirm flying clearance with your surgeon before booking your return ticket."
    },
    {
      q: "What happens if smoking is not stopped before or after surgery?",
      a: "Smoking significantly impairs bone healing by reducing blood flow to the graft site and interfering with the cells responsible for new bone formation. In spinal fusion, smoking is one of the most consistent predictors of failed fusion (pseudoarthrosis), where the graft fails to solidify into solid bone. Many accredited Korean centres require documented smoking cessation before offering elective fusion surgery. If you smoke, stopping — ideally several weeks or more before surgery — is one of the most important things you can do to protect the outcome."
    },
    {
      q: "What rehabilitation happens after I return home?",
      a: "Before leaving Korea, KmedTour provides a written, staged rehabilitation plan alongside your operative summary, implant details, and activity restrictions. The plan covers early mobilisation, safe posture and movement, gradual core strengthening, and return-to-work guidance — structured so a physiotherapist in your home country can continue without gaps. Arrange a local spinal or orthopaedic review as soon as possible after returning. Report any new weakness, numbness, bladder or bowel changes, fever, or wound discharge immediately."
    }
  ],
  references: []
},

// ── 3. IVF TREATMENT ────────────────────────────────────────────────────────
{
  slug: "ivf-treatment",
  shortDescription: "Assisted reproductive technology where eggs are fertilised outside the body and resulting embryos transferred to the uterus.",
  quickAnswer: [
    "**IVF (in vitro fertilisation)** stimulates the ovaries to produce multiple eggs, retrieves them under sedation, fertilises them in a laboratory with sperm, and transfers one or more resulting embryos to the uterus to establish a pregnancy.",
    "**Best candidates** are individuals or couples with tubal factor infertility, unexplained infertility, male-factor infertility, endometriosis, ovulatory disorders, or previous failed intrauterine insemination (IUI) cycles.",
    "**A full IVF cycle in Korea takes approximately 30 days** from the start of ovarian stimulation through egg retrieval, fertilisation, embryo culture, and transfer — with monitoring appointments throughout.",
    "**Typical cost in Korea: $8,000–$15,000 USD per cycle**, depending on stimulation protocol, genetic testing of embryos, and whether donor eggs or sperm are used."
  ],
  keyFacts: [
    { label: "Cycle duration", value: "Approximately 30 days (stimulation through transfer)" },
    { label: "Egg retrieval procedure", value: "15–30 minutes under sedation" },
    { label: "Embryo transfer", value: "5–10 minutes (no anaesthesia required)" },
    { label: "Recommended stay in Korea", value: "Approximately 30 days for a fresh cycle" },
    { label: "Pregnancy test", value: "Blood test approximately 10–14 days after transfer" },
    { label: "Typical cost in Korea", value: "$8,000–$15,000 USD per cycle" }
  ],
  sections: {
    overview: "**IVF (in vitro fertilisation)** stimulates the ovaries to produce multiple mature eggs, retrieves them under sedation, fertilises them with sperm in a laboratory, cultures the resulting embryos, and transfers one or more back to the uterus to establish a pregnancy. Patients from Africa, the Middle East, and Southeast Asia choose Korea for fertility treatment because accredited clinics combine experienced embryology teams, modern laboratory technology, and comprehensive cycle monitoring within structured international-patient pathways.\n\nA full IVF cycle progresses through several overlapping stages:\n\n- **Ovarian stimulation** (10–14 days of daily hormone injections) to grow multiple follicles\n- **Monitoring** (multiple ultrasound and blood-hormone appointments during stimulation)\n- **Egg retrieval** (a brief sedated procedure once follicles reach the target size)\n- **Fertilisation** in the embryology laboratory — conventional insemination or **ICSI** (intracytoplasmic sperm injection, where a single sperm is injected directly into each egg)\n- **Embryo culture** (5–6 days to blastocyst stage)\n- **Optional genetic testing** (**PGT-A** or **PGT-M**) to assess embryo chromosomal status or inherited conditions before transfer\n- **Embryo transfer** — a brief, typically pain-free procedure; surplus good-quality embryos are frozen for future use\n\nKmedTour coordinates the full journey — clinic matching, appointment scheduling, interpreter support, and local accommodation guidance.",
    candidacy: "IVF may be recommended for:\n\n- **Tubal factor infertility** — blocked, damaged, or absent fallopian tubes\n- **Male-factor infertility** — low sperm count, poor motility, or abnormal morphology (ICSI is used in these cases)\n- **Unexplained infertility** — a couple or individual who has not conceived after a defined period of trying without a clear cause identified\n- **Endometriosis** affecting fertilisation or implantation\n- **Ovulatory disorders** not resolved with simpler treatments\n- **Diminished ovarian reserve** — lower egg number or quality, where stimulation aims to retrieve the best available eggs\n- **Prior failed IUI** cycles\n- **Single parents or same-sex couples** using donor gametes where legally permitted\n\n**Before starting a cycle, the clinic typically conducts:**\n\n- Day-2 or day-3 baseline blood tests (FSH, LH, AMH, oestradiol) and antral follicle count (AFC) ultrasound — to assess ovarian reserve and plan stimulation\n- Semen analysis (if male partner involved)\n- Uterine assessment (saline sonogram or hysteroscopy) to confirm the uterine cavity is clear\n- General health screening including blood group, infection screening, and thyroid function\n\nA pre-travel consultation with recent test results allows the reproductive specialist to propose a stimulation protocol and realistic success expectation before you travel.",
    procedure_steps: "IVF is a multi-step process spanning approximately 30 days.\n\n**Ovarian stimulation (Days 1–10 to 14):**\nDaily self-administered hormone injections (FSH, sometimes with LH) stimulate the ovaries to grow multiple follicles. Monitoring appointments — typically every 2–3 days — use transvaginal ultrasound and blood tests to track follicle growth and hormone levels and adjust the dose.\n\n**Trigger injection:**\nWhen the lead follicles reach the target size, a trigger injection (hCG or GnRH agonist) matures the eggs ready for retrieval, timed precisely 36 hours before the procedure.\n\n**Egg retrieval:**\nPerformed under **light intravenous sedation** in the procedure room. Using transvaginal ultrasound guidance, the embryologist aspirates fluid and eggs from each mature follicle through a fine needle — typically taking 15–30 minutes. Recovery in a monitored area follows.\n\n**Laboratory: fertilisation and culture:**\n\n- Retrieved eggs are evaluated and mature eggs are fertilised — by conventional insemination or **ICSI**\n- Fertilised eggs (zygotes) are cultured in the laboratory over 5–6 days to reach the blastocyst stage\n- The embryologist grades each blastocyst for quality\n\n**Optional: PGT-A/PGT-M (genetic testing):**\nA small cell sample (biopsy) from each blastocyst is sent for chromosomal or gene analysis. Results take about one week. Only chromosomally normal embryos are transferred.\n\n**Embryo transfer:**\nA thin catheter passes through the cervix (no anaesthesia needed) and one embryo — selected for best quality — is placed into the uterus. Excess good-quality embryos are vitrified (flash-frozen) for future cycles. A short rest period follows; most clinics advise normal activity from the same day.\n\n**Pregnancy test:**\nA blood beta-hCG test is performed approximately 10–14 days after transfer to confirm whether implantation has occurred.",
    recovery_timeline: "IVF does not require surgical recovery in the conventional sense, but the stimulation phase and post-retrieval period involve rest and monitoring.\n\n**Stimulation phase (approximately Days 1–12):**\n\n- Daily injections — self-administered after instruction\n- Clinic monitoring every 2–3 days; build appointments into your Korea schedule\n- Mild bloating or pelvic heaviness is common as follicles grow\n\n**Egg retrieval day:**\n\n- Sedation means you will need an escort and should not drive\n- Mild cramping and spotting are common and resolve within a day or two\n- Ovarian hyperstimulation syndrome (OHSS) — significant bloating, pain, or rapid weight gain — should be reported promptly; severe OHSS is uncommon but requires monitoring\n\n**Embryo culture phase (Days 1–5 after retrieval):**\n\n- No procedure; the laboratory cultures the embryos and the team provides daily updates\n\n**Transfer day:**\n\n- A brief, typically comfortable procedure; most patients return to light activity the same day\n- The two-week wait for the pregnancy test can be emotionally demanding — the clinic team is available for support\n\n**After the pregnancy test:**\n\n- If positive: early pregnancy monitoring begins; the clinic coordinates handover of records to your home obstetrician\n- If negative: the team discusses the results, remaining frozen embryos, and options for a subsequent frozen embryo transfer (FET) cycle",
    cost_breakdown: "The estimated cost for one IVF cycle through KmedTour ranges from **$8,000 to $15,000 USD**. Where you fall in this range depends on:\n\n- Stimulation protocol and medication cost (medications are often the single largest variable cost)\n- Whether ICSI is needed (typically adds a fee to standard insemination)\n- Optional genetic testing: PGT-A (chromosomal screening) or PGT-M (specific gene testing) significantly increases cost\n- Whether donor eggs or donor sperm are used (donor cycles cost more and have different availability by clinic)\n- Number of monitoring visits and ultrasounds during stimulation\n\n**What the quoted price generally covers:**\n\n- Reproductive specialist consultations\n- Ultrasound monitoring during stimulation\n- Egg retrieval procedure and sedation\n- Embryology laboratory fees (fertilisation, culture, embryo grading)\n- Embryo transfer procedure\n- Vitrification and storage of surplus embryos (first year typically included)\n\n**What is typically not included:**\n\n- Stimulation medications (substantial cost — discuss with the clinic)\n- PGT-A or PGT-M testing\n- Donor egg or sperm fees\n- Flights, accommodation, and living costs during the ~30-day stay\n- Subsequent frozen embryo transfer (FET) cycles\n\nKmedTour provides a **written, itemised quotation** so you understand the full cost breakdown before committing.",
    why_korea: "Korea has a well-developed fertility sector with clinics operating under regulatory frameworks overseen by the **Ministry of Health and Welfare**. Korea's healthcare system has fostered embryology laboratory standards and clinical practices that many international patients find competitive both in quality and cost.\n\n**Accreditation and oversight:**\n\n- **KOIHA** accreditation covers hospitals and clinics treating international patients and sets quality benchmarks\n- **KHIDI's Medical Korea programme** supports foreign patient access to accredited fertility centres\n\n**Clinical and laboratory approach:**\nAccredited Korean fertility clinics offer the full range of IVF technologies: standard insemination, ICSI, blastocyst culture, vitrification, and embryo genetic testing. Clinics typically offer high monitoring frequency during stimulation — important for adjusting protocols promptly and minimising OHSS risk.\n\n**International patient infrastructure:**\nDedicated international patient coordinators provide scheduling support across the 30-day cycle, interpreter services, and coordination with home-country obstetricians for ongoing pregnancy care.\n\nKmedTour matches patients with an appropriate clinic based on diagnosis, test results, and clinical needs — and coordinates the full stay including accommodation guidance and appointment scheduling."
  },
  costTable: [
    { item: "IVF cycle — standard (without genetic testing)", cost: "$8,000–$11,000" },
    { item: "IVF with ICSI", cost: "$9,000–$12,000" },
    { item: "IVF with ICSI + PGT-A (chromosomal screening)", cost: "$11,000–$15,000" },
    { item: "Stimulation medications (estimated, varies)", cost: "$1,500–$3,500 additional" },
    { item: "Frozen embryo transfer (FET) cycle — subsequent cycle", cost: "$2,000–$4,000 additional" }
  ],
  callouts: [],
  keyTakeaways: [
    "A full IVF cycle spans approximately 30 days in Korea — stimulation, monitoring, egg retrieval, embryo culture, and transfer — and surplus good-quality embryos are vitrified for potential future frozen cycles.",
    "Stimulation medications are often the largest variable cost and are usually billed separately; ICSI, genetic testing (PGT-A/M), and donor gametes each add significant additional fees that should be confirmed in writing before committing.",
    "Korean fertility clinics accredited under KOIHA and the Medical Korea programme offer the full range of IVF technologies with dedicated international patient coordinators and high monitoring frequency during stimulation.",
    "Costs range from $8,000 to $15,000 USD per cycle depending on protocol, ICSI, and testing; an itemised quote is provided before you travel."
  ],
  entities: [
    { name: "In vitro fertilisation", url: "https://en.wikipedia.org/wiki/In_vitro_fertilisation" },
    { name: "Intracytoplasmic sperm injection", url: "https://en.wikipedia.org/wiki/Intracytoplasmic_sperm_injection" },
    { name: "Preimplantation genetic testing", url: "https://en.wikipedia.org/wiki/Preimplantation_genetic_testing" },
    { name: "Ovarian hyperstimulation syndrome", url: "https://en.wikipedia.org/wiki/Ovarian_hyperstimulation_syndrome" },
    { name: "Medical tourism in South Korea", url: "https://en.wikipedia.org/wiki/Medical_tourism_in_South_Korea" },
    { name: "Korean Organisation for International Healthcare Accreditation", url: "https://en.wikipedia.org/wiki/Korean_Organisation_for_International_Healthcare_Accreditation" }
  ],
  faqs: [
    {
      q: "What is the difference between IVF and ICSI?",
      a: "In standard IVF, mature eggs are placed together with a prepared sperm sample in a culture dish and fertilisation occurs naturally. In ICSI (intracytoplasmic sperm injection), the embryologist selects a single sperm and injects it directly into each mature egg under a microscope. ICSI is used when semen analysis shows significant abnormalities in count, motility, or morphology, or when prior IVF cycles have had unexpectedly low fertilisation. It adds a laboratory fee but does not change the retrieval or transfer procedures."
    },
    {
      q: "How many embryos will be transferred?",
      a: "Most accredited Korean clinics follow evidence-based guidance recommending single embryo transfer (SET) in appropriate patients — transferring one high-quality blastocyst at a time. This approach substantially reduces the risk of twin or higher-order pregnancy, which carries significant maternal and neonatal risks. Surplus good-quality blastocysts are vitrified for subsequent frozen embryo transfer (FET) cycles. The decision on how many to transfer is made with the reproductive specialist based on your age, embryo quality, and reproductive history."
    },
    {
      q: "What is ovarian hyperstimulation syndrome (OHSS) and how is it managed?",
      a: "OHSS is a response to stimulation hormones in which the ovaries become swollen and fluid can leak into the abdomen. Mild OHSS — bloating, pelvic discomfort — is relatively common and resolves on its own. Moderate OHSS involves more significant swelling and discomfort. Severe OHSS — very large ovaries, significant fluid accumulation, difficulty breathing, reduced urine output — is uncommon and requires medical management. Risk is higher in patients with polycystic ovarian morphology or very high antral follicle counts. Frequent monitoring during stimulation allows dose adjustment to reduce risk, and trigger type can be modified. If OHSS is suspected, the clinic should be contacted immediately."
    },
    {
      q: "Can I do a frozen embryo transfer (FET) from Korea if I don't want to stay for the fresh transfer?",
      a: "Yes. Some patients choose to freeze all embryos after retrieval — a 'freeze-all' strategy — and return for a frozen embryo transfer in a subsequent cycle. This approach is particularly used when OHSS risk is elevated, or when genetic testing (PGT-A/M) is planned (embryo biopsy results take about a week, requiring a frozen cycle anyway). A frozen embryo transfer cycle is shorter and typically less expensive than a fresh IVF cycle. Discuss the freeze-all option with your reproductive specialist at the pre-travel consultation."
    },
    {
      q: "How do I continue care after returning home?",
      a: "If the pregnancy test is positive, KmedTour coordinates transfer of all records — including your monitoring reports, embryology results, transfer details, and early scan images — to your home obstetrician. Early pregnancy monitoring (first trimester scans, beta-hCG follow-up) should be arranged in your home country promptly. If the cycle is unsuccessful, the team reviews the results with you, discusses any frozen embryos remaining, and helps plan whether a frozen embryo transfer cycle in Korea is appropriate."
    }
  ],
  references: []
},

// ── 4. EGG FREEZING ─────────────────────────────────────────────────────────
{
  slug: "egg-freezing",
  shortDescription: "Oocyte cryopreservation — freezing mature eggs to preserve fertility for use at a future time.",
  quickAnswer: [
    "**Egg freezing (oocyte cryopreservation)** uses ovarian stimulation and a brief egg-retrieval procedure to collect mature eggs, which are then vitrified (flash-frozen) and stored in liquid nitrogen — pausing their biological age for use in a future IVF cycle.",
    "**Best candidates** are women who wish to delay childbearing for personal or professional reasons, those about to undergo chemotherapy or radiation that may damage ovarian function, or those with conditions associated with early ovarian decline.",
    "**The Korea stay is approximately 14 days**, covering stimulation, monitoring appointments, and the retrieval procedure — no transfer is performed during the egg-freezing cycle itself.",
    "**Typical cost in Korea: $3,000–$6,000 USD per cycle**, plus medication costs and annual storage fees."
  ],
  keyFacts: [
    { label: "Cycle duration", value: "Approximately 14 days (stimulation through retrieval)" },
    { label: "Egg retrieval procedure", value: "15–30 minutes under sedation" },
    { label: "Recommended stay in Korea", value: "~14 days" },
    { label: "Storage", value: "Vitrified eggs stored in liquid nitrogen; annual storage fee applies" },
    { label: "Future use", value: "Eggs thawed and used in a future IVF cycle" },
    { label: "Typical cost in Korea", value: "$3,000–$6,000 USD per cycle (plus medications and storage)" }
  ],
  sections: {
    overview: "**Egg freezing (oocyte cryopreservation)** collects mature eggs during a stimulated cycle, vitrifies them using rapid-freeze technology, and stores them in liquid nitrogen — pausing their biological age. When you are ready to attempt pregnancy, the eggs are thawed, fertilised, and transferred in an IVF cycle.\n\nPatients from Africa, the Middle East, and Southeast Asia choose Korean fertility clinics for egg freezing because accredited centres offer **vitrification** (flash-freezing that avoids ice crystal formation and significantly improves egg survival rates compared to older slow-freeze methods), experienced embryology teams, and competitive pricing relative to Western clinics.\n\nThe egg-freezing process follows the same initial stages as a full IVF cycle:\n\n- **Ovarian stimulation** (daily hormone injections for approximately 10–12 days)\n- **Monitoring appointments** (ultrasound and blood tests every 2–3 days)\n- **Trigger injection** to mature the eggs\n- **Egg retrieval** under sedation\n- **Vitrification** of mature eggs in the embryology laboratory\n\nNo embryo transfer occurs during the egg-freezing cycle. The eggs remain stored until you return for a future IVF attempt.\n\nKmedTour coordinates clinic matching, appointment scheduling, interpreter support, and local accommodation guidance for the approximately 14-day stay.",
    candidacy: "Egg freezing may be appropriate for:\n\n- **Elective fertility preservation** — women who wish to delay childbearing for personal, professional, or relationship reasons while protecting egg quality\n- **Medical fertility preservation before cancer treatment** — chemotherapy, radiation, or surgery that may damage ovarian function; timing here is urgent and the clinic can prioritise scheduling\n- **Conditions associated with early ovarian decline** — such as Turner syndrome (mosaic forms), BRCA gene mutations (when bilateral salpingo-oophorectomy is planned), or a family history of early menopause\n- **Prior to gender-affirming hormone treatment** — to preserve fertility before hormonal changes affect egg quality\n\n**Ovarian reserve assessment is central to candidacy:**\n\nThe clinic will review:\n\n- **AMH (anti-Müllerian hormone)** blood test — a marker of ovarian reserve\n- **Antral follicle count (AFC)** on baseline ultrasound — counts the small follicles visible at the start of the cycle\n- **Day-2/3 FSH and oestradiol** — additional reserve markers\n\nThese results help the clinic predict how many eggs are likely to be retrieved. The number of mature eggs needed for a reasonable future chance of pregnancy depends on your age and goals — the reproductive specialist will discuss realistic expectations based on your reserve assessment.\n\nA pre-travel video consultation with recent AMH results and an AFC ultrasound allows a personalised plan before you travel.",
    procedure_steps: "The egg-freezing cycle follows the same first stages as an IVF cycle, with vitrification at the end instead of transfer.\n\n**Ovarian stimulation (approximately Days 1–12):**\nDaily self-administered hormone injections stimulate the ovaries to grow multiple follicles. Monitoring appointments every 2–3 days track follicle growth and hormone levels.\n\n**Trigger injection:**\nWhen follicles reach the target size, a trigger injection times final egg maturation precisely 36 hours before retrieval.\n\n**Egg retrieval (approximately Day 14):**\nUnder **light intravenous sedation**, the embryologist uses transvaginal ultrasound guidance to aspirate each mature follicle through a fine needle. The procedure typically takes 15–30 minutes.\n\n**Vitrification:**\nMature eggs (MII stage) are identified in the laboratory and vitrified — flash-frozen using cryoprotectant solutions and stored in liquid nitrogen straws. Immature eggs cannot be vitrified and are not stored.\n\n**After retrieval:**\nYou receive a report of how many mature eggs were collected and vitrified. Mild cramping or bloating may follow retrieval and typically resolves within a day or two. A brief recovery observation period follows before discharge.\n\n**Future use:**\nWhen you are ready to attempt pregnancy, a **frozen embryo transfer (FET) cycle** thaws the eggs, fertilises them (usually with ICSI), cultures the resulting embryos, and transfers one to the uterus.",
    recovery_timeline: "Egg freezing does not require surgical recovery in the conventional sense, but the stimulation phase has a structured monitoring schedule and the retrieval day involves sedation.\n\n**Stimulation phase (approximately Days 1–12):**\n\n- Daily injections — self-administered after clinic instruction on day one\n- Monitoring appointments every 2–3 days — plan your Korea schedule to include these\n- Increasing fullness or bloating as follicles grow is common and expected\n- Report significant abdominal pain, rapid weight gain, or difficulty breathing promptly (these may indicate OHSS)\n\n**Retrieval day:**\n\n- You will need an escort; do not drive after sedation\n- Mild cramping and light spotting are common and resolve quickly\n- Most patients rest the retrieval day and resume normal activity the following day\n\n**After retrieval:**\n\n- Your normal menstrual cycle resumes after the next period\n- Egg-freezing does not affect future natural fertility\n- The clinic provides a written report of eggs retrieved and vitrified before you leave\n\n**Storage:**\n\n- Eggs are stored in the clinic's liquid nitrogen tanks under regulated conditions\n- Annual storage fees apply — confirm the clinic's storage terms and what happens if you wish to transfer eggs internationally in the future",
    cost_breakdown: "The estimated cost for one egg-freezing cycle through KmedTour ranges from **$3,000 to $6,000 USD**. This covers the clinic procedure costs but excludes medication and storage fees, which are significant:\n\n**What the cycle fee generally covers:**\n\n- Reproductive specialist consultations\n- Ultrasound monitoring during stimulation\n- Egg retrieval procedure and sedation\n- Embryology laboratory fees: egg identification, maturity assessment, and vitrification\n- First-year egg storage (confirm with clinic)\n\n**Key additional costs:**\n\n- **Stimulation medications:** typically $1,500–$3,000 depending on protocol and ovarian reserve\n- **Annual egg storage fees** after the first year\n- **Future FET cycle cost** when you return to use the eggs (typically $2,000–$5,000 plus medications)\n- International flights, accommodation, and living costs during the ~14-day stay\n\nMultiple cycles are sometimes needed to collect enough eggs — the reproductive specialist will discuss realistic targets based on your ovarian reserve before you decide to travel.\n\nKmedTour provides a **written, itemised quotation** so you understand the full financial picture.",
    why_korea: "Korean fertility clinics have adopted **vitrification** as the standard freezing method, replacing older slow-freeze techniques. Vitrification dramatically improves egg survival on thaw and is now standard at accredited international fertility centres.\n\n**Accreditation and oversight:**\n\n- **KOIHA** (Korean Organisation for International Healthcare Accreditation) sets quality and safety benchmarks for clinics treating international patients\n- **KHIDI's Medical Korea programme** supports foreign patient access to accredited fertility centres\n\n**Clinical and laboratory approach:**\nAccredited clinics offer individual stimulation protocol design based on ovarian reserve testing, frequent monitoring during stimulation to minimise OHSS risk, and experienced embryology teams for vitrification and future thaw procedures.\n\n**International patient infrastructure:**\nDedicated international patient coordinators handle scheduling across the monitoring-intensive 14-day cycle, provide interpreter services, and coordinate records transfer for future use in the patient's home country.\n\nKmedTour matches patients to an appropriate clinic based on their reserve assessment, discusses realistic outcome expectations, and coordinates the full stay."
  },
  costTable: [
    { item: "Egg-freezing cycle — clinic fee (monitoring, retrieval, vitrification)", cost: "$3,000–$6,000" },
    { item: "Stimulation medications (estimated — varies by protocol)", cost: "$1,500–$3,000 additional" },
    { item: "Annual egg storage fee (after first year)", cost: "Clinic-specific; confirm in writing" },
    { item: "Future FET cycle to use frozen eggs", cost: "$2,000–$5,000 additional" },
    { item: "Second egg-freezing cycle (if needed for egg target)", cost: "$3,000–$6,000 additional" }
  ],
  callouts: [],
  keyTakeaways: [
    "Egg freezing uses vitrification — flash-freeze technology — to preserve mature eggs collected during a stimulated cycle; the Korea stay is approximately 14 days for stimulation, monitoring, and retrieval, with no transfer performed during this cycle.",
    "Stimulation medications add $1,500–$3,000 to the cycle fee, and annual storage costs apply; multiple cycles are sometimes needed to reach a meaningful egg number — discuss realistic targets based on your AMH and AFC at the pre-travel consultation.",
    "Korean fertility clinics accredited under KOIHA use vitrification as the standard method and offer individual protocol design with frequent monitoring to manage OHSS risk.",
    "Costs are $3,000–$6,000 per cycle for clinic fees, plus medications and storage; a future frozen embryo transfer cycle will incur additional costs when you return to use the eggs."
  ],
  entities: [
    { name: "Oocyte cryopreservation", url: "https://en.wikipedia.org/wiki/Oocyte_cryopreservation" },
    { name: "Vitrification (cryopreservation)", url: "https://en.wikipedia.org/wiki/Vitrification_(cryopreservation)" },
    { name: "Anti-Müllerian hormone", url: "https://en.wikipedia.org/wiki/Anti-M%C3%BCllerian_hormone" },
    { name: "Ovarian hyperstimulation syndrome", url: "https://en.wikipedia.org/wiki/Ovarian_hyperstimulation_syndrome" },
    { name: "Medical tourism in South Korea", url: "https://en.wikipedia.org/wiki/Medical_tourism_in_South_Korea" },
    { name: "Korean Organisation for International Healthcare Accreditation", url: "https://en.wikipedia.org/wiki/Korean_Organisation_for_International_Healthcare_Accreditation" }
  ],
  faqs: [
    {
      q: "How many eggs do I need to freeze?",
      a: "The number of eggs needed for a reasonable chance of future pregnancy depends on your age at the time of freezing and your personal pregnancy goals. Younger women's eggs have a higher chance of leading to a successful pregnancy after thaw and fertilisation. The reproductive specialist will use your ovarian reserve markers — AMH, antral follicle count, and age — to estimate how many eggs one cycle is likely to produce and how many you would need to feel confident about your future options. Some women complete one cycle and feel satisfied; others choose to return for additional cycles if the first did not yield their target number."
    },
    {
      q: "Does egg freezing affect future natural fertility?",
      a: "No. The stimulation cycle and retrieval do not deplete the overall ovarian reserve in a clinically meaningful way. Ovaries contain a large pool of follicles at birth; each stimulation cycle recruits follicles from the pool that would otherwise be lost in that natural cycle. Multiple stimulation cycles in a short time are generally safe but should be discussed with the reproductive specialist based on your reserve and response. Your normal menstrual cycle resumes after the next period following retrieval."
    },
    {
      q: "How long can eggs be stored?",
      a: "Vitrified eggs can be stored for many years. Most regulatory frameworks in countries where fertility preservation is practised permit storage for a defined period — commonly five to ten years, with options to extend. Because storage regulations differ by country, it is important to understand the Korean clinic's specific storage policies and what your options are if you wish to transport eggs to another country for use in the future. Confirm all storage terms, annual fees, and international transport arrangements in writing before proceeding."
    },
    {
      q: "What happens when I want to use my frozen eggs?",
      a: "When you are ready to attempt pregnancy, you return for a frozen embryo transfer (FET) cycle. The frozen eggs are thawed — typically one cohort at a time — and fertilised using ICSI. The resulting embryos are cultured for several days, and one blastocyst is selected for transfer. Unused fertilised eggs (embryos) can be re-frozen as embryos. The FET cycle is shorter and less intensive than a full stimulation cycle: the uterus is prepared with hormonal medications over approximately two weeks, after which transfer occurs."
    },
    {
      q: "Is there an age limit for egg freezing?",
      a: "Egg freezing is most effective when done at a younger age, when egg quality and ovarian reserve are higher. Most accredited clinics set an upper age limit for elective egg freezing — commonly in the early-to-mid forties — based on the significant decline in egg quality and quantity that occurs with age. At older ages, the likelihood of retrieving viable eggs and achieving a successful future pregnancy decreases substantially, and the clinic should give you a frank assessment of realistic outcomes based on your reserve markers before you proceed."
    }
  ],
  references: []
},

// ── 5. HEALTH SCREENING ─────────────────────────────────────────────────────
{
  slug: "health-screening",
  shortDescription: "Comprehensive executive health checkup detecting disease early with full-body imaging, lab work, and specialist review.",
  quickAnswer: [
    "**Comprehensive health screening** in Korea is a structured one- or two-day programme of blood tests, imaging (endoscopy, CT, MRI, ultrasound), cardiac assessment, cancer markers, and specialist consultations — designed to detect disease at an early, treatable stage.",
    "**Suitable for anyone** aged 30 and over who wants a thorough baseline health assessment, those with risk factors for common chronic diseases, or executives and professionals seeking a complete annual health review not available at this depth in their home country.",
    "**The programme takes 1–2 days** in a dedicated health screening centre; results are reviewed by specialists and provided in a comprehensive report before you leave, often the same day or the next morning.",
    "**Typical cost in Korea: $500–$3,000 USD**, depending on the package tier, add-on tests, and whether specialist consultations are included."
  ],
  keyFacts: [
    { label: "Programme duration", value: "1–2 days" },
    { label: "Recommended Korea stay", value: "2–3 days (to allow results review)" },
    { label: "Fasting required", value: "Yes — typically 8–12 hours before the programme" },
    { label: "Results delivery", value: "Written report same day or following morning; specialist review included" },
    { label: "Key components", value: "Bloods, imaging (CT/MRI/ultrasound), endoscopy, cardiac assessment, cancer markers" },
    { label: "Typical cost in Korea", value: "$500–$3,000 USD" }
  ],
  sections: {
    overview: "**Comprehensive health screening** in Korea is a structured assessment programme delivered in a dedicated screening centre, combining laboratory tests, full-body imaging, endoscopy, cardiac tests, and specialist review within one or two days. Patients from Africa, the Middle East, and Southeast Asia travel to Korea for screening because accredited centres offer a depth of assessment — including upper and lower endoscopy, low-dose CT, and MRI — that is not routinely available in a single appointment at home, with results reviewed by specialists and delivered before you leave.\n\nA standard comprehensive programme typically includes:\n\n- **Blood and urine panels:** full blood count, metabolic panel, liver and kidney function, lipid profile, thyroid, fasting glucose, HbA1c, cancer markers (AFP, CEA, PSA for men, CA-125 for women — at appropriate tiers)\n- **Cardiac assessment:** resting ECG, blood pressure, sometimes exercise treadmill test or echocardiogram\n- **Upper endoscopy (gastroscopy):** direct visualisation of the oesophagus, stomach, and duodenum for ulcers, gastritis, and early gastric cancer\n- **Lower endoscopy (colonoscopy):** direct visualisation of the colon for polyps and early colorectal cancer — available at higher-tier packages\n- **Imaging:** low-dose chest CT, abdominal ultrasound, and depending on tier — MRI (brain, abdomen, or musculoskeletal) and CT angiography\n- **Bone density (DEXA scan)**\n- **Specialist consultations** to review findings before discharge\n\nKmedTour matches patients to a centre suited to their tier, age, sex, and risk profile, and coordinates the scheduling, transport, and results-review appointment.",
    candidacy: "Health screening is appropriate for a wide range of adults:\n\n- Anyone aged **30 and above** seeking a comprehensive health baseline not available at equivalent depth in their home country\n- Those with **family history** of cancer (colorectal, gastric, breast, prostate, lung), cardiovascular disease, or diabetes\n- Adults with **existing risk factors**: smoking history, hypertension, high cholesterol, elevated BMI, high alcohol intake\n- **Executives and professionals** who want a thorough annual review as part of occupational health management\n- Those preparing for **major surgery or procedures** who want a complete pre-operative health picture\n- Adults with **persistent unexplained symptoms** (fatigue, weight change, abdominal discomfort) where a thorough screen is the starting point\n\n**What to prepare before travel:**\n\n- A list of current medications (some affect test results or require dose adjustment around the programme)\n- Previous screening results or medical records if available — allows comparison\n- Family history of specific cancers or heart disease\n- Specific concerns or symptoms to ensure they are covered by the chosen package\n\nKmedTour coordinates a pre-travel briefing to match you to the right package tier and flag any add-on tests relevant to your profile.",
    procedure_steps: "A standard comprehensive health screening programme is delivered across one to two days in a dedicated screening centre.\n\n**Before the programme:**\n\n- **Fasting for 8–12 hours** before the start — water is permitted\n- Arrive at the scheduled time; a coordinator guides you through each station\n\n**Day 1 — morning (core testing):**\n\n- **Blood draw and urine sample** — full panels processed in the centre laboratory\n- **Blood pressure, height, weight, BMI, body composition**\n- **Vision and hearing tests**\n- **Resting ECG** — cardiac rhythm assessment\n- **Chest X-ray** or low-dose chest CT\n- **Abdominal ultrasound** — liver, gallbladder, kidneys, pancreas, spleen\n- **Upper endoscopy (gastroscopy)** under light sedation — stomach and duodenum\n- **Bone density (DEXA)**\n\n**Day 1 — afternoon (tier-dependent add-ons):**\n\n- Colonoscopy (requires bowel prep the day before — confirm with centre)\n- Echocardiogram or exercise treadmill test\n- Mammography and pelvic ultrasound (women)\n- Prostate ultrasound (men)\n- MRI brain, abdomen, or other region\n\n**Results review:**\n\n- Laboratory results are typically available the same afternoon or morning of Day 2\n- A specialist physician reviews all findings with you in a consultation\n- You receive a written, structured health report to take home",
    recovery_timeline: "Health screening does not involve surgery and requires no physical recovery. However, some components have specific post-procedure considerations.\n\n**After upper endoscopy (gastroscopy):**\n\n- Light sedation is used; you should not drive for the rest of the day\n- Mild throat discomfort or bloating may follow; resolves quickly\n- Eating resumes a short time after the procedure\n\n**After colonoscopy (if included):**\n\n- Sedation is used; do not drive for the rest of the day\n- Bloating from the air used during the procedure is common and resolves within hours\n- Normal diet resumes the same day\n\n**After the screening programme:**\n\n- Await the specialist results review (same day or morning of Day 2)\n- Review your written report with the specialist; ask about any abnormal results, recommended follow-up, or referrals\n- KmedTour coordinates translation of the report and, if needed, warm handover to a specialist in Korea or recommendations for follow-up at home\n\n**Planning your Korea stay:**\n\n- Allow 2–3 days in Korea to ensure you receive and review all results before flying home\n- If a finding requires urgent follow-up — such as a biopsy of a suspicious gastric lesion — the centre can usually arrange this within your stay",
    cost_breakdown: "The cost of health screening through KmedTour ranges from **$500 to $3,000 USD**, depending on the package tier and add-on tests selected.\n\n**Standard tier ($500–$1,000):**\n\n- Blood and urine panels, resting ECG, chest X-ray, abdominal ultrasound, upper endoscopy, basic cancer markers, DEXA, results review\n\n**Comprehensive tier ($1,000–$2,000):**\n\n- Everything above plus low-dose chest CT, colonoscopy, echocardiogram or treadmill test, expanded cancer marker panel, mammography (women), prostate ultrasound (men)\n\n**Premium / executive tier ($2,000–$3,000):**\n\n- Everything above plus MRI (brain and/or abdomen), CT angiography, full cardiac assessment, genetic cancer risk panel, extended specialist consultations, VIP room service\n\n**What is typically not included:**\n\n- Biopsies or pathology from endoscopy findings (billed separately if needed)\n- Treatment or additional procedures if a significant finding requires same-trip intervention\n- International flights, accommodation, and meals\n\nKmedTour provides a **written itemised quote** based on your age, sex, family history, and specific concerns so you choose the right tier.",
    why_korea: "Korea has a strong national screening culture, with the government running its own health screening programme for insured residents. This has created a large, experienced sector of dedicated health screening centres with high throughput and standardised protocols.\n\n**Accreditation and oversight:**\n\n- **KOIHA** (Korean Organisation for International Healthcare Accreditation) sets quality benchmarks for centres treating international patients\n- **KHIDI's Medical Korea programme** supports foreign patient access\n\n**Clinical approach:**\nDedicated health screening centres in Korea handle high volumes of comprehensive programmes efficiently, combining laboratory, imaging, endoscopy, and specialist review in one facility and one or two days — a model less common in many other healthcare systems. Early detection of gastric cancer — which is more common in Korean and East Asian populations and for which Korea has well-established screening protocols — is a particular strength.\n\n**International patient infrastructure:**\nAccredited centres have international patient departments with interpreter services, English-language reports, and dedicated coordinators who guide you through the programme and arrange results review consultations.\n\nKmedTour matches patients to the appropriate centre and tier, coordinates scheduling, and arranges warm handover of results to your home physician."
  },
  costTable: [
    { item: "Standard health screening package", cost: "$500–$1,000" },
    { item: "Comprehensive health screening package", cost: "$1,000–$2,000" },
    { item: "Premium / executive health screening package", cost: "$2,000–$3,000" },
    { item: "Biopsy from endoscopy finding (if needed)", cost: "Additional — varies" },
    { item: "Add-on MRI (brain or abdomen)", cost: "$300–$800 additional" }
  ],
  callouts: [],
  keyTakeaways: [
    "Korean health screening centres deliver blood work, imaging (CT, MRI, ultrasound), upper and lower endoscopy, cardiac assessment, and specialist results review within one or two days — a depth of assessment rarely available in a single appointment elsewhere.",
    "Package tiers range from standard ($500–$1,000) to premium executive ($2,000–$3,000); your age, sex, family history, and specific risk factors determine which tier is appropriate.",
    "Allow 2–3 days in Korea to complete the programme and receive a full specialist results review before flying home.",
    "Korea's well-developed national screening culture has produced high-volume, efficient screening centres accredited under KOIHA with dedicated international patient coordinators."
  ],
  entities: [
    { name: "Medical examination", url: "https://en.wikipedia.org/wiki/Medical_examination" },
    { name: "Endoscopy", url: "https://en.wikipedia.org/wiki/Endoscopy" },
    { name: "Cancer screening", url: "https://en.wikipedia.org/wiki/Cancer_screening" },
    { name: "Colonoscopy", url: "https://en.wikipedia.org/wiki/Colonoscopy" },
    { name: "Medical tourism in South Korea", url: "https://en.wikipedia.org/wiki/Medical_tourism_in_South_Korea" },
    { name: "Korean Organisation for International Healthcare Accreditation", url: "https://en.wikipedia.org/wiki/Korean_Organisation_for_International_Healthcare_Accreditation" }
  ],
  faqs: [
    {
      q: "Do I need to fast before health screening?",
      a: "Yes. Most health screening programmes require fasting for 8–12 hours before the start of the programme to ensure accurate blood glucose, lipid, and liver enzyme results, and to allow endoscopy with a clear stomach. Water is typically permitted. Some centres allow a small amount of plain water with essential medications. You will receive specific fasting instructions when your appointment is confirmed. If colonoscopy is included in your package, a bowel-preparation regimen is required the day before — the centre will provide instructions."
    },
    {
      q: "What happens if the screening finds something abnormal?",
      a: "Abnormal findings are discussed with you during the specialist results review on the same day or the morning of Day 2. Minor findings — such as a small benign cyst, slightly elevated cholesterol, or a polyp removed during colonoscopy — are explained and included in your report with follow-up recommendations. Significant findings requiring further investigation — such as a suspicious gastric lesion requiring biopsy, or a cardiac abnormality — can often be addressed within your Korea stay if arranged promptly. KmedTour coordinates warm handover to the appropriate specialist and, if needed, facilitates same-trip follow-up."
    },
    {
      q: "Is colonoscopy included in all packages?",
      a: "Colonoscopy is usually included from the comprehensive tier upward, not in basic packages. It requires bowel preparation the day before, is performed under sedation, and adds meaningful value for colorectal cancer risk assessment — particularly from age 45 onward, or earlier with a family history. Upper endoscopy (gastroscopy) is included in most tiers. If colonoscopy is important to you, confirm it is in your chosen package before committing."
    },
    {
      q: "Can I get an MRI during the screening?",
      a: "MRI is included in premium tier packages and is available as a paid add-on in lower tiers. Brain MRI, abdominal MRI, and musculoskeletal MRI are the most commonly offered. MRI adds time to the programme (typically 45–90 minutes per region) and cost. If you have specific concerns — unexplained headaches, a family history of aneurysm, joint pain — discuss the appropriate MRI sequences with KmedTour before your package is finalised."
    },
    {
      q: "How do I share the results with my doctor at home?",
      a: "You will receive a structured written report — typically in English for international patients at accredited centres — covering every test performed, flagging abnormal values, and including specialist interpretation and follow-up recommendations. KmedTour arranges translation if needed and can coordinate a formal handover letter to your home physician summarising the key findings. The report is designed to be useful to a doctor who was not present at the screening."
    }
  ],
  references: []
},

// ── 6. HAIR TRANSPLANT ──────────────────────────────────────────────────────
{
  slug: "hair-transplant",
  shortDescription: "Surgical transfer of hair follicles from a donor area to restore hair in thinning or bald regions of the scalp.",
  quickAnswer: [
    "**Hair transplant surgery** moves healthy, genetically resistant hair follicles from a donor area (usually the back and sides of the scalp) to thinning or bald recipient areas, where they establish permanent growth.",
    "**Best candidates** are adults with stable androgenetic alopecia (pattern hair loss) with adequate donor hair density at the back and sides of the scalp, and realistic expectations about coverage achievable in one session.",
    "**The Korea stay is approximately 5 days:** the procedure is performed in one day (typically 6–10 hours) under local anaesthesia, and the clinic reviews healing before you fly.",
    "**Typical cost in Korea: $3,500–$12,000 USD**, depending on the technique used, the number of grafts transplanted, and the clinic tier."
  ],
  keyFacts: [
    { label: "Procedure time", value: "6–10 hours (depending on graft number)" },
    { label: "Anesthesia", value: "Local anaesthesia (scalp); no general anaesthesia required" },
    { label: "Hospital stay", value: "Day procedure — no overnight stay usually required" },
    { label: "Recommended stay in Korea", value: "5 days (procedure + healing check before flight)" },
    { label: "Recovery", value: "Grafts shed at 2–8 weeks; new growth visible from ~3–4 months; full result at 12–18 months" },
    { label: "Typical cost in Korea", value: "$3,500–$12,000 USD" }
  ],
  sections: {
    overview: "**Hair transplant surgery** moves hair follicles from areas of permanent growth — typically the back and sides of the scalp — to regions affected by hair loss. Patients from Africa, the Middle East, and Southeast Asia choose Korea for hair restoration because accredited clinics combine experienced surgical teams, modern extraction techniques, and competitive pricing with dedicated international-patient support.\n\nThe transplanted follicles come from the **permanent donor zone** — a band of scalp where follicles are genetically resistant to dihydrotestosterone (DHT), the hormone responsible for androgenetic hair loss. Because these follicles retain their genetic programming when moved, they continue to grow permanently in the new location.\n\n**Two main techniques are used:**\n\n- **FUE (follicular unit extraction):** individual follicular units are extracted one by one from the donor area using a small punch device, leaving tiny, scattered scars that are virtually invisible once healed. This is the most commonly offered technique for international patients.\n- **FUT (strip/follicular unit transplantation):** a strip of scalp is removed from the donor area, divided into follicular units under magnification, and transplanted. Leaves a linear scar but allows a large number of grafts in one session and preserves follicles well.\n\nChoice of technique depends on the number of grafts needed, donor hair characteristics, and your preference about scarring.\n\nKmedTour coordinates pre-arrival consultation with your scalp photographs, clinic matching, and scheduling.",
    candidacy: "You may be a candidate for hair transplant if you have:\n\n- **Androgenetic alopecia (pattern hair loss)** — male or female pattern — that is stable (not rapidly progressing)\n- **Adequate donor hair density** at the back and sides of the scalp — the donor zone must have enough follicles to provide meaningful coverage without excessive thinning of the donor area\n- **Realistic expectations** about coverage: the number of grafts available is finite, and a very large bald area may require staged sessions or a plan that prioritises the frontal zone\n- **Good general health** for a long local-anaesthesia procedure\n\n**Conditions that affect candidacy:**\n\n- **Diffuse alopecia or extensive donor thinning:** if the donor zone itself is thinning, there may not be enough permanent follicles to donate\n- **Alopecia areata or scarring alopecia:** these are usually not suitable for standard hair transplant — the underlying condition must be stable and managed\n- **Age and progression:** very young patients with rapidly progressing loss may not yet know the full extent of the area that will require coverage\n- **Unrealistic graft expectations:** a limited donor supply means a plan that distributes grafts for the best aesthetic impact, not uniform density everywhere\n\nA pre-travel video consultation with clear scalp photographs (top, front hairline, donor area) allows the clinic to assess density and design a graft plan before you travel.",
    procedure_steps: "Hair transplant is performed under **local anaesthesia** applied to the scalp; you remain awake throughout and can rest, listen to music, or watch content during the long procedure.\n\n**Design and marking:**\nThe surgeon designs the new hairline and recipient areas based on your existing hair pattern, facial proportions, and the number of grafts available. This is discussed and agreed before surgery begins.\n\n**Donor extraction — FUE:**\nThe donor area is shaved and local anaesthetic applied. A small motorised or manual punch device extracts individual follicular units — each containing 1–4 hairs — one by one. Extracted grafts are placed in a chilled holding solution.\n\n**Donor extraction — FUT (if chosen):**\nA strip of scalp is removed from the donor zone. The wound is closed with sutures (linear scar). The strip is divided under magnification into individual follicular units.\n\n**Recipient site preparation:**\nThe surgeon creates thousands of small incisions in the recipient area at the correct angle, direction, and density. This step determines the naturalness of the result.\n\n**Graft placement:**\nTechnicians or the surgeon place each graft into a prepared site. Care is taken to match natural hair direction and avoid damaging existing hair.\n\n**After the procedure:**\nThe scalp is gently washed, and you receive instructions on washing and care for the first 10–14 days. A follow-up check is typically scheduled the next morning before you leave for home.",
    recovery_timeline: "Hair transplant recovery involves two phases: wound healing in the first weeks, and the hair growth cycle over the following year.\n\n**Days 1–3:**\n\n- Scalp may be swollen, tender, or crusty — expected and normal\n- Small scabs form around each graft site\n- Sleep with the head slightly elevated\n- Avoid touching, rubbing, or scratching the recipient area\n- Follow the clinic's washing protocol precisely — usually a very gentle rinse from Day 2 or 3\n\n**Days 3–5 (pre-departure):**\n\n- Clinic reviews the recipient area and donor healing before you fly\n- Most patients are cleared to fly after the early healing check\n- Wear a loose hat for sun and dust protection during travel\n\n**Weeks 2–8 (shedding phase):**\n\n- The transplanted hairs shed — this is normal and expected; the follicles remain in the scalp\n- Do not be alarmed by shedding; it does not mean the transplant has failed\n\n**Months 3–4:**\n\n- New hair growth begins emerging from the transplanted follicles\n- Growth is initially fine and may be slightly wavy before settling\n\n**Months 6–12:**\n\n- Increasing density and thickness as the hairs mature\n\n**Month 12–18:**\n\n- Full result is assessable; the transplanted hairs are now growing permanently\n- If a second session is needed to add density, it is planned at this stage",
    cost_breakdown: "The estimated cost for hair transplant through KmedTour ranges from **$3,500 to $12,000 USD**, with the number of grafts being the primary driver of cost.\n\n**Cost by graft range (FUE technique):**\n\n- 1,000–2,000 grafts: $3,500–$5,500\n- 2,000–3,500 grafts: $5,500–$8,500\n- 3,500–5,000+ grafts: $8,500–$12,000\n\n**What the quoted price generally covers:**\n\n- Surgeon and technician fees\n- Local anaesthesia and scalp preparation\n- All graft extraction, preparation, and placement\n- Post-procedure scalp wash and follow-up check the next morning\n- Written aftercare instructions and graft-care kit\n\n**What is typically not included:**\n\n- International flights and visa costs\n- Accommodation (procedure is outpatient — no hospital stay)\n- Scalp medical treatments (Minoxidil, PRP) that may be recommended alongside transplant\n- Future sessions if staged approach is needed\n\nKmedTour provides a **written, itemised quotation** based on your consultation photographs and graft count estimate before you commit to travel.",
    why_korea: "Korea has a well-developed hair restoration sector, with clinics serving both domestic and international patients. Korean dermatological and plastic surgery training programmes contribute to experienced scalp surgical teams, and the competitive clinic market has driven quality and value.\n\n**Accreditation and oversight:**\n\n- **KOIHA** (Korean Organisation for International Healthcare Accreditation) sets quality and patient-safety benchmarks for clinics treating international patients\n- **KHIDI's Medical Korea programme** supports foreign patient access to accredited facilities\n\n**Clinical approach:**\nAccredited Korean clinics offer FUE and FUT performed by surgeon-led teams with experienced technicians for graft handling and placement. Some clinics offer advanced techniques such as direct hair implantation (DHI) or sapphire blade recipient-site creation. Hairline design is a particular focus — Korean aesthetic sensibilities emphasise natural-looking, age-appropriate designs.\n\n**International patient infrastructure:**\nDedicated international patient coordinators provide photo-based pre-consultation, scheduling, and post-procedure follow-up by video call to monitor early healing.\n\nKmedTour coordinates pre-arrival photo review, clinic matching by technique and tier, and scheduling for the 5-day Korea stay."
  },
  costTable: [
    { item: "Hair transplant — FUE, 1,000–2,000 grafts", cost: "$3,500–$5,500" },
    { item: "Hair transplant — FUE, 2,000–3,500 grafts", cost: "$5,500–$8,500" },
    { item: "Hair transplant — FUE, 3,500–5,000+ grafts", cost: "$8,500–$12,000" },
    { item: "FUT (strip) technique — per graft pricing may differ", cost: "Clinic-specific; typically less per graft than FUE" },
    { item: "PRP scalp treatment (add-on, optional)", cost: "$300–$600 additional" }
  ],
  callouts: [],
  keyTakeaways: [
    "Hair transplant moves genetically DHT-resistant follicles from the donor zone to bald areas, where they grow permanently; FUE (individual extraction) is the most common technique for international patients and leaves no linear scar.",
    "The transplanted hairs shed at 2–8 weeks after surgery — this is normal; new growth emerges from 3–4 months, with the full result visible at 12–18 months.",
    "Cost is primarily driven by graft count ($3,500–$12,000 for 1,000–5,000+ grafts); the number of grafts available from your donor zone is finite — a pre-travel consultation with scalp photographs establishes a realistic plan.",
    "Korean clinics accredited under KOIHA combine experienced surgeon-led teams, modern extraction techniques, and competitive pricing with dedicated international patient support."
  ],
  entities: [
    { name: "Hair transplantation", url: "https://en.wikipedia.org/wiki/Hair_transplantation" },
    { name: "Follicular unit extraction", url: "https://en.wikipedia.org/wiki/Follicular_unit_extraction" },
    { name: "Androgenetic alopecia", url: "https://en.wikipedia.org/wiki/Androgenetic_alopecia" },
    { name: "Dihydrotestosterone", url: "https://en.wikipedia.org/wiki/Dihydrotestosterone" },
    { name: "Medical tourism in South Korea", url: "https://en.wikipedia.org/wiki/Medical_tourism_in_South_Korea" },
    { name: "Korean Organisation for International Healthcare Accreditation", url: "https://en.wikipedia.org/wiki/Korean_Organisation_for_International_Healthcare_Accreditation" }
  ],
  faqs: [
    {
      q: "Is the result permanent?",
      a: "Yes — the transplanted follicles are taken from the permanent donor zone at the back and sides of the scalp, where follicles are genetically resistant to the hormone DHT that causes androgenetic hair loss. When moved to a new location, they retain their genetic programming and continue to grow permanently. However, it is important to understand that hair transplant does not stop the progression of natural hair loss in areas not yet transplanted — so the hair behind and around the transplanted zone may continue to thin over time. Medical treatments such as Minoxidil or finasteride are often recommended alongside transplant to slow ongoing loss."
    },
    {
      q: "What is the difference between FUE and FUT?",
      a: "FUE (follicular unit extraction) extracts individual follicular units one by one from the donor area using a small punch device. It leaves small, scattered scars that are virtually invisible once healed and allows the patient to wear the hair very short. FUT (follicular unit transplantation) removes a strip of scalp from the donor zone, which is then divided under magnification into follicular units. It leaves a linear scar but allows a large number of grafts to be harvested in one session and may preserve follicle integrity better during extraction. The choice depends on graft number needed, scalp laxity, scarring preference, and clinic expertise."
    },
    {
      q: "How many grafts do I need?",
      a: "The number of grafts depends on the extent of the bald or thinning area, the desired density, and the available donor supply. A typical frontal zone restoration may need 1,500–3,000 grafts; treating the crown as well typically requires more. A pre-travel photo consultation with the surgeon allows a graft count estimate based on your Norwood or Ludwig classification and your scalp photographs. The donor zone has a finite supply — very extensive hair loss may require staged sessions or a strategic plan that prioritises the most visible areas."
    },
    {
      q: "What happens during the shedding phase and when will I see results?",
      a: "After transplant, most of the transplanted hairs enter a shedding phase within 2–8 weeks. The hairs fall out, but the follicles remain in the scalp in a dormant phase. This is a normal and expected part of the transplant process and does not mean the procedure has failed. New hair growth begins emerging from the transplanted follicles at around 3–4 months. By 6–9 months, meaningful density is usually visible. The full result — with mature, thickened hairs — is assessable at 12–18 months after surgery."
    },
    {
      q: "Can I fly home a few days after the procedure?",
      a: "Yes — hair transplant is an outpatient procedure under local anaesthesia, and most patients fly home within 4–5 days. The clinic typically reviews the scalp the morning after surgery. Flying too early — within 24–48 hours — is generally not recommended because scalp swelling and graft vulnerability peak in this period and cabin air pressure changes may affect early healing. By Day 4–5, with the first scabs forming and the clinic having confirmed the graft sites, most patients are cleared to travel. Follow the clinic's washing instructions carefully during the flight and avoid touching or compressing the grafts."
    }
  ],
  references: []
},

// ── 7. GASTRIC BYPASS ───────────────────────────────────────────────────────
{
  slug: "gastric-bypass",
  shortDescription: "Bariatric surgery that reduces stomach size and reroutes the digestive tract to achieve significant, sustained weight loss.",
  quickAnswer: [
    "**Roux-en-Y gastric bypass (RYGB)** creates a small stomach pouch and connects it directly to the mid-small intestine, bypassing most of the stomach and the first part of the small bowel — reducing how much you can eat and altering hunger hormones and nutrient absorption.",
    "**Best candidates** are adults with a BMI of 40 or above, or 35 and above with significant obesity-related health conditions such as type 2 diabetes, hypertension, or sleep apnoea, who have not achieved adequate results with sustained lifestyle and medical management.",
    "**The Korea stay is 10–14 days:** surgery is performed laparoscopically (keyhole), hospital stay is typically 3–5 nights, and the programme includes structured dietary counselling before discharge.",
    "**Typical cost in Korea: $12,000–$22,000 USD**, depending on surgical approach, hospital tier, and the length of the all-inclusive care package."
  ],
  keyFacts: [
    { label: "Procedure time", value: "2–3 hours" },
    { label: "Anesthesia", value: "General" },
    { label: "Hospital stay", value: "3–5 days" },
    { label: "Recommended stay in Korea", value: "10–14 days" },
    { label: "Recovery", value: "Light activity within days; return to desk work in several weeks; full activity over months" },
    { label: "Typical cost in Korea", value: "$12,000–$22,000 USD" }
  ],
  sections: {
    overview: "**Roux-en-Y gastric bypass (RYGB)** — the most widely performed form of gastric bypass — creates a small stomach pouch and connects it directly to a section of the small intestine, bypassing most of the stomach and the duodenum. This restricts the volume of food you can eat and significantly alters the hormonal signals that regulate hunger and satiety, producing substantial and sustained weight loss.\n\nPatients from Africa, the Middle East, and Southeast Asia travel to Korea for bariatric surgery because accredited hospitals combine experienced laparoscopic surgical teams, structured pre- and post-operative nutritional support, and competitive pricing within a coordinated international-patient pathway.\n\n**How gastric bypass produces weight loss:**\n\n- **Volume restriction:** the small stomach pouch holds only a small amount of food at a time\n- **Hormonal changes:** bypassing the duodenum alters gut hormone signalling in ways that reduce hunger and improve insulin sensitivity — which is why type 2 diabetes often improves dramatically after the procedure\n- **Malabsorption:** partial bypassing of the small bowel reduces calorie and nutrient absorption — this contributes to weight loss but also requires lifelong nutritional supplementation\n\nKmedTour coordinates pre-arrival medical clearance, hospital matching, dietary counselling coordination, and a structured handover to your home medical team.",
    candidacy: "Gastric bypass is typically considered for adults who meet internationally recognised criteria:\n\n- **BMI of 40 or above** (severe obesity)\n- **BMI of 35 or above** with one or more significant obesity-related conditions:\n  - Type 2 diabetes\n  - Hypertension\n  - Obstructive sleep apnoea\n  - Obesity-related joint disease\n  - Non-alcoholic fatty liver disease\n  - Dyslipidaemia not controlled with medication\n\n**Who is usually not a candidate:**\n\n- Active or untreated substance misuse disorder\n- Uncontrolled severe psychiatric illness\n- Medical conditions making general anaesthesia or major abdominal surgery prohibitively high risk\n- Inability to commit to lifelong nutritional supplementation and follow-up\n\n**Pre-operative evaluation typically includes:**\n\n- Comprehensive metabolic and cardiac workup\n- Endoscopy to assess the upper GI tract before creating the pouch\n- Nutritional assessment and pre-operative dietary counselling\n- Psychological evaluation to confirm readiness and realistic expectations\n- Sleep study if sleep apnoea is suspected\n\nA pre-travel video consultation with recent blood work, BMI, and comorbidity history allows the bariatric team to review candidacy and plan the workup before you arrive.",
    procedure_steps: "Gastric bypass is performed laparoscopically (keyhole surgery) under **general anaesthesia** and typically takes 2–3 hours.\n\n**Access:**\nSeveral small incisions are made in the abdomen. A camera and instruments are inserted.\n\n**Creating the stomach pouch:**\nUsing surgical staplers, the surgeon divides and separates a small pouch from the upper stomach. This pouch holds only a small volume of food.\n\n**Roux limb creation:**\nThe small intestine is divided below the duodenum. The lower segment (the **Roux limb** or alimentary limb) is brought up and connected to the new stomach pouch. Food now flows from the pouch directly into the Roux limb, bypassing most of the stomach, the duodenum, and the upper part of the small intestine.\n\n**Biliopancreatic limb:**\nThe upper portion of the small bowel (carrying bile and digestive enzymes from the stomach remnant and pancreas) is reconnected lower down the small bowel at the **jejunojejunostomy** — allowing digestion to occur when the two streams meet.\n\n**Leak testing:**\nThe connections are checked for leaks by passing coloured fluid through the pouch. Drains may be placed.\n\n**Post-operative monitoring:**\nYou are monitored in recovery and typically moved to a ward that day. Intravenous fluids, clot-prevention measures, and pain management begin immediately.",
    recovery_timeline: "Recovery progresses through several clearly defined stages, with the Korea stay supporting the critical early phase.\n\n**Day 1–2 (in hospital):**\n\n- Recovery from general anaesthesia; intravenous fluids continue\n- Sips of water begin within hours if the team is satisfied with progress\n- First steps out of bed — early mobilisation is important for clot prevention\n\n**Days 2–5 (inpatient):**\n\n- Diet advances gradually: clear liquids → full liquids\n- Pain, nausea, and fatigue are common and managed\n- Drains removed if placed\n- Physiotherapy supports breathing and mobility\n- Clot-prevention injections and compression stockings\n\n**Days 5–14 (pre-departure):**\n\n- Transition to a puréed diet under dietitian guidance\n- Walking distances increase significantly\n- Surgeon confirms wound status and nutritional intake before clearing flight\n- KmedTour provides a **written dietary plan, supplement schedule**, and operative summary for your home team\n\n**Weeks 3–6 (at home):**\n\n- Diet advances from purée to soft foods and then a modified solid diet over weeks\n- Energy levels gradually improve\n- Return to light desk work: typically several weeks after surgery\n\n**Long-term:**\n\n- Lifelong daily nutritional supplements are mandatory: multivitamin, iron, calcium, vitamin D, vitamin B12 minimum\n- Annual blood tests to monitor for nutritional deficiencies\n- Follow-up with a bariatric team, dietitian, and GP at home\n\nReport severe abdominal pain, fever, inability to keep down fluids, or wound changes immediately.",
    cost_breakdown: "The estimated cost for gastric bypass through KmedTour ranges from **$12,000 to $22,000 USD**. Key factors affecting cost:\n\n- Hospital tier and room type\n- Length of inpatient stay\n- Extent of pre-operative workup required on arrival\n- Whether the programme includes extended dietitian support and psychological consultation\n\n**What the quoted price generally covers:**\n\n- Surgeon, assistant, and anaesthesia fees\n- Laparoscopic procedure and operating room\n- Surgical consumables (staplers, mesh if needed)\n- Inpatient hospital stay (typically 3–5 nights)\n- Standard medications during admission\n- Pre-operative endoscopy and blood work on arrival\n- Dietitian consultations during the inpatient stay\n- Discharge dietary plan and supplement guidance\n\n**What is typically not included:**\n\n- International flights and visa fees\n- Accommodation before and after hospital discharge\n- Nutritional supplements for home use (lifelong requirement)\n- Psychological evaluation (may be billed separately)\n- Follow-up appointments and blood tests at home\n\nKmedTour provides a **written, itemised quotation** so you understand the complete financial commitment before committing.",
    why_korea: "Korea is an established destination for minimally invasive abdominal surgery, with experienced laparoscopic surgical teams at accredited hospitals and a healthcare system regulated by the **Ministry of Health and Welfare**.\n\n**Accreditation and oversight:**\n\n- **KOIHA** (Korean Organisation for International Healthcare Accreditation) sets quality and patient-safety benchmarks for hospitals treating international patients\n- **KHIDI's Medical Korea programme** supports foreign patient access to accredited facilities\n\n**Clinical approach:**\nKorean hospitals offering bariatric surgery perform gastric bypass laparoscopically, integrating pre-operative dietary counselling and psychological evaluation into the care pathway. Dedicated dietitians support patients through the critical early dietary stages, and discharge planning includes a structured nutritional protocol for the home phase.\n\n**International patient infrastructure:**\nDedicated international patient departments provide interpreter services, comprehensive pre-operative workup coordination, and structured handover to the patient's home medical team — including the bariatric programme records, nutritional plan, and supplement guidance.\n\nKmedTour adds end-to-end coordination from pre-arrival medical clearance to a written handover package for your home bariatric team, dietitian, and GP."
  },
  costTable: [
    { item: "Roux-en-Y gastric bypass — laparoscopic, standard", cost: "$12,000–$17,000" },
    { item: "Roux-en-Y gastric bypass — laparoscopic, premium hospital tier", cost: "$17,000–$22,000" },
    { item: "Pre-operative upper endoscopy (if not included)", cost: "$300–$600 additional" },
    { item: "Hospital stay (3–5 nights, standard room)", cost: "Typically included in package" },
    { item: "Extended dietitian and psychological consultation package", cost: "$500–$1,500 additional" }
  ],
  callouts: [],
  keyTakeaways: [
    "Roux-en-Y gastric bypass restricts stomach volume, alters gut-hormone signalling that governs hunger and satiety, and partially bypasses the upper small bowel — producing significant and sustained weight loss and often dramatic improvement in type 2 diabetes.",
    "Lifelong daily nutritional supplementation (multivitamin, iron, calcium, vitamin D, B12) is mandatory after bypass — this is a permanent commitment, not an optional extra, and should factor into the long-term cost assessment.",
    "Korean hospitals accredited under KOIHA combine laparoscopic bariatric surgical teams, integrated pre-operative assessment, and dedicated dietitian support for the critical early dietary stages.",
    "Costs range from $12,000 to $22,000 USD depending on hospital tier and programme scope; an itemised quote is provided after pre-operative workup review."
  ],
  entities: [
    { name: "Gastric bypass surgery", url: "https://en.wikipedia.org/wiki/Gastric_bypass_surgery" },
    { name: "Bariatric surgery", url: "https://en.wikipedia.org/wiki/Bariatric_surgery" },
    { name: "Obesity", url: "https://en.wikipedia.org/wiki/Obesity" },
    { name: "Type 2 diabetes", url: "https://en.wikipedia.org/wiki/Type_2_diabetes" },
    { name: "Medical tourism in South Korea", url: "https://en.wikipedia.org/wiki/Medical_tourism_in_South_Korea" },
    { name: "Korean Organisation for International Healthcare Accreditation", url: "https://en.wikipedia.org/wiki/Korean_Organisation_for_International_Healthcare_Accreditation" }
  ],
  faqs: [
    {
      q: "How much weight will I lose after gastric bypass?",
      a: "Weight loss after gastric bypass is substantial but varies by individual. Most patients lose a significant proportion of their excess body weight over the first 12–18 months — with the rate of loss being greatest in the first several months. Long-term success depends on dietary adherence, physical activity, and follow-up with a bariatric team. The procedure is most effective when combined with ongoing lifestyle support, not viewed as a standalone solution. The bariatric team will give you a personalised discussion of expected outcomes based on your starting BMI and comorbidities."
    },
    {
      q: "Will my type 2 diabetes improve after bypass?",
      a: "Type 2 diabetes is one of the conditions that responds most dramatically to gastric bypass. The improvement is often observed very quickly — sometimes before significant weight has been lost — which suggests that the hormonal changes from bypassing the duodenum play a direct role beyond calorie restriction alone. Many patients see significant reductions in blood glucose and may reduce or discontinue diabetes medications under medical supervision. The degree of improvement depends on how long diabetes has been present and how much residual insulin-producing function remains. Discuss this specifically with the bariatric team at your pre-operative consultation."
    },
    {
      q: "Why are nutritional supplements lifelong after bypass?",
      a: "Gastric bypass partially bypasses the duodenum and upper small intestine — the primary sites of iron, calcium, vitamin D, and vitamin B12 absorption. Even with a balanced diet, it becomes very difficult to absorb adequate quantities of these nutrients through the altered anatomy. Deficiencies in iron (causing anaemia), calcium and vitamin D (causing bone density loss), and B12 (causing neurological problems) are well-documented long-term risks without supplementation. Taking the recommended supplements consistently and monitoring blood levels annually are non-negotiable long-term commitments — not optional extras."
    },
    {
      q: "Is gastric bypass reversible?",
      a: "Gastric bypass is considered a permanent procedure. The stomach is divided and the intestine rerouted using surgical staples and sutures. While reversal is technically possible in specialised surgical centres, it is complex, high-risk, and rarely indicated — and the outcomes of reversal are generally poor. Before proceeding, candidates should approach bypass as a lifelong change in anatomy and nutrition, not a reversible intervention. This is why psychological evaluation and realistic expectation-setting are a standard part of the pre-operative assessment."
    },
    {
      q: "How do I manage nutritional follow-up after returning home?",
      a: "Before leaving Korea, KmedTour provides a written dietary progression plan (clear liquids → full liquids → purée → soft foods → modified solids), a supplement schedule, and the bariatric team's operative summary and contact information. You should arrange a follow-up with a bariatric surgeon, dietitian, and your GP within the first weeks of returning. Annual blood tests covering iron, ferritin, folate, B12, calcium, vitamin D, and zinc are the standard minimum for lifelong monitoring. If your home country has limited bariatric follow-up services, KmedTour can advise on telemedicine options for ongoing support."
    }
  ],
  references: []
}

]; // end sidecars array

// ── Add the ACL sidecar (strip _imageScenes) ─────────────────────────────────
const aclClean = Object.fromEntries(
  Object.entries(aclSidecar).filter(([k]) => k !== '_imageScenes')
);
sidecars.push(aclClean);

// ── Build _imageScenes map ────────────────────────────────────────────────────
const imageScenes = {
  "hip-replacement": [
    { q: "hip consultation orthopedic", alt: "Orthopedic surgeon assessing a hip patient in Korea" },
    { q: "hip replacement surgery operating room", alt: "Hip replacement surgery in a Korean operating room" },
    { q: "hip rehabilitation physical therapy", alt: "Hip rehabilitation physical therapy after hip replacement" }
  ],
  "acl-reconstruction": aclSidecar._imageScenes,
  "spinal-fusion": [
    { q: "spine MRI review consultation Seoul", alt: "Spine specialist reviewing MRI scans before spinal fusion in Korea" },
    { q: "minimally invasive spine surgery operating room", alt: "Minimally invasive spinal fusion surgery in a Korean hospital" },
    { q: "spinal rehabilitation physical therapy back", alt: "Physiotherapy for back rehabilitation after spinal fusion" }
  ],
  "ivf-treatment": [
    { q: "fertility specialist consultation clinic Korea", alt: "Fertility specialist consultation at a Korean IVF clinic" },
    { q: "embryology laboratory IVF eggs", alt: "Embryology laboratory with eggs during IVF treatment" },
    { q: "couple fertility clinic happy pregnant", alt: "Happy couple after successful IVF treatment at a Korean clinic" }
  ],
  "egg-freezing": [
    { q: "fertility specialist consultation woman clinic", alt: "Woman consulting with a fertility specialist about egg freezing in Korea" },
    { q: "egg retrieval cryopreservation laboratory", alt: "Egg retrieval and cryopreservation in a fertility laboratory" },
    { q: "woman fertility clinic relaxed confident", alt: "Woman feeling confident after egg freezing at a Korean fertility clinic" }
  ],
  "health-screening": [
    { q: "doctor health checkup review results Korea", alt: "Doctor reviewing comprehensive health screening results with patient in Korea" },
    { q: "MRI CT scan imaging medical center", alt: "MRI and CT scan imaging at a Korean medical screening center" },
    { q: "patient doctor consultation results discussion", alt: "Patient and doctor discussing health screening results" }
  ],
  "hair-transplant": [
    { q: "hair restoration specialist scalp assessment", alt: "Hair restoration specialist assessing scalp before transplant in Korea" },
    { q: "hair follicle transplant surgery scalp", alt: "Hair follicle transplant procedure on scalp at a Korean clinic" },
    { q: "hair growth results before after transplant", alt: "Hair growth results after hair transplant surgery in Korea" }
  ],
  "gastric-bypass": [
    { q: "bariatric surgeon consultation patient obesity", alt: "Bariatric surgeon consulting with patient before gastric bypass in Korea" },
    { q: "laparoscopic abdominal surgery operating room", alt: "Laparoscopic gastric bypass surgery in a Korean operating room" },
    { q: "healthy nutrition food post surgery recovery", alt: "Healthy nutrition foods for recovery after gastric bypass surgery" }
  ]
};

// ── Write sidecar files (without _imageScenes) ───────────────────────────────
let writeCount = 0;
for (const sidecar of sidecars) {
  const { _imageScenes, ...clean } = sidecar;
  const outPath = path.join(SIDECAR_DIR, `${clean.slug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(clean, null, 2), 'utf8');
  writeCount++;
  console.log(`WROTE: ${clean.slug}.json`);
}

// ── Update treatment-inline-queries.json ────────────────────────────────────
const existing = JSON.parse(fs.readFileSync(INLINE_QUERIES, 'utf8'));
for (const [slug, scenes] of Object.entries(imageScenes)) {
  existing[slug] = scenes;
}
fs.writeFileSync(INLINE_QUERIES, JSON.stringify(existing, null, 2), 'utf8');
console.log(`UPDATED: treatment-inline-queries.json (${Object.keys(imageScenes).length} entries merged)`);
console.log(`\nDONE: ${writeCount} sidecars written, inline-queries updated.`);
