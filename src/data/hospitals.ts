export const hospitals = [
  { name: "Lilavati Hospital", city: "Mumbai", lat: 19.0490, lon: 72.8276, tier: "Premium", nabh: true, pmjay: false, cghs: true, kneeMin: 180000, kneeMax: 350000 },
  { name: "Narayana Health City", city: "Bangalore", lat: 12.8991, lon: 77.6136, tier: "Premium", nabh: true, pmjay: true, cghs: true, kneeMin: 120000, kneeMax: 280000 },
  { name: "AIIMS Delhi", city: "Delhi", lat: 28.5672, lon: 77.2100, tier: "Govt", nabh: true, pmjay: true, cghs: true, kneeMin: 60000, kneeMax: 90000 },
  { name: "Fortis Mulund", city: "Mumbai", lat: 19.1724, lon: 72.9560, tier: "Premium", nabh: true, pmjay: false, cghs: true, kneeMin: 200000, kneeMax: 380000 },
  { name: "Apollo Hospitals Chennai", city: "Chennai", lat: 13.0569, lon: 80.2425, tier: "Premium", nabh: true, pmjay: true, cghs: true, kneeMin: 150000, kneeMax: 300000 },
  { name: "KEM Hospital Mumbai", city: "Mumbai", lat: 19.0041, lon: 72.8388, tier: "Govt", nabh: true, pmjay: true, cghs: true, kneeMin: 45000, kneeMax: 80000 },
  { name: "Manipal Hospitals Bangalore", city: "Bangalore", lat: 12.9499, lon: 77.5984, tier: "Premium", nabh: true, pmjay: false, cghs: true, kneeMin: 140000, kneeMax: 290000 },
  { name: "PGIMER Chandigarh", city: "Chandigarh", lat: 30.7650, lon: 76.7780, tier: "Govt", nabh: true, pmjay: true, cghs: true, kneeMin: 55000, kneeMax: 85000 },
  { name: "Medanta Gurgaon", city: "Gurgaon", lat: 28.4490, lon: 77.0470, tier: "Premium", nabh: true, pmjay: false, cghs: true, kneeMin: 210000, kneeMax: 400000 },
  { name: "Ruby Hall Clinic", city: "Pune", lat: 18.5294, lon: 73.8809, tier: "Mid-Tier", nabh: true, pmjay: true, cghs: false, kneeMin: 100000, kneeMax: 200000 },
  { name: "Nizam's Institute Hyderabad", city: "Hyderabad", lat: 17.3983, lon: 78.4836, tier: "Govt", nabh: true, pmjay: true, cghs: true, kneeMin: 50000, kneeMax: 80000 },
  { name: "SSKM Hospital Kolkata", city: "Kolkata", lat: 22.5356, lon: 88.3402, tier: "Govt", nabh: true, pmjay: true, cghs: true, kneeMin: 40000, kneeMax: 75000 },
  { name: "Kokilaben Dhirubhai Ambani", city: "Mumbai", lat: 19.1289, lon: 72.8271, tier: "Premium", nabh: true, pmjay: false, cghs: false, kneeMin: 250000, kneeMax: 450000 },
  { name: "Safdarjung Hospital", city: "Delhi", lat: 28.5682, lon: 77.2065, tier: "Govt", nabh: true, pmjay: true, cghs: true, kneeMin: 50000, kneeMax: 80000 },
  { name: "Breach Candy Hospital", city: "Mumbai", lat: 18.9711, lon: 72.8084, tier: "Premium", nabh: true, pmjay: false, cghs: false, kneeMin: 300000, kneeMax: 500000 },
];

export const metroCities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata"];
export const tier2Cities = ["Chandigarh", "Gurgaon", "Ahmedabad", "Jaipur", "Lucknow", "Bhopal", "Indore", "Coimbatore", "Vizag", "Nagpur"];

export function getGeoTier(city: string): "Metro" | "Tier-2" | "Tier-3" {
  if (metroCities.some(c => city.toLowerCase().includes(c.toLowerCase()))) return "Metro";
  if (tier2Cities.some(c => city.toLowerCase().includes(c.toLowerCase()))) return "Tier-2";
  return "Tier-3";
}

export const sourceUrls: Record<string, string> = {
  "NHA HBP": "https://hem.nha.gov.in/HBP.pdf",
  "CGHS": "https://cghs.mohfw.gov.in/AHIMSG5/hissso/Login",
  "PM-JAY": "https://pmjay.gov.in/",
  "NPPA": "https://nppa.gov.in/",
  "ESIC": "https://esic.gov.in/",
  "IRDAI": "https://irdai.gov.in/",
};

export const procedureData: Record<string, {
  name: string;
  icdCodes: { code: string; desc: string }[];
  components: { name: string; min: number; max: number; benchmark: number; source: string; coverage: string; warning?: string; hidden?: string }[];
  confidence: number;
  pmjayCoverage: number;
}> = {
  "knee replacement": {
    name: "Knee Replacement Surgery",
    icdCodes: [
      { code: "M17.1", desc: "Primary osteoarthritis, knee" },
      { code: "Z96.641", desc: "Presence of right artificial knee joint" },
      { code: "0SRC069", desc: "Replacement of Right Knee Joint" },
      { code: "27447", desc: "Total knee arthroplasty" },
      { code: "99213", desc: "Office consultation code" },
    ],
    components: [
      { name: "Surgeon Fee", min: 25000, max: 85000, benchmark: 40000, source: "NHA HBP 2024", coverage: "PM-JAY: ₹80K pkg" },
      { name: "Anaesthesia Charges", min: 8000, max: 22000, benchmark: 12000, source: "CGHS 2024", coverage: "ESIC: Covered" },
      { name: "Implant / Prosthesis (Knee)", min: 45000, max: 180000, benchmark: 54720, source: "NPPA 2024", coverage: "PM-JAY: Within ₹80K cap", warning: "Implant prices vary 4x across hospitals" },
      { name: "Hospital Room (5 nights)", min: 17500, max: 60000, benchmark: 10000, source: "CGHS Ward 2024", coverage: "Ayushman: General ward" },
      { name: "OT Charges", min: 15000, max: 40000, benchmark: 18000, source: "NHA HBP 2024", coverage: "MJPJAY: Covered" },
      { name: "ICU Charges (3 days)", min: 24000, max: 75000, benchmark: 16500, source: "CGHS ICU 2024", coverage: "PM-JAY: Up to 3 days", hidden: "cardiac" },
      { name: "Physiotherapy (10 sessions)", min: 5000, max: 18000, benchmark: 4000, source: "CGHS 2024", coverage: "Not covered by schemes", hidden: "elderly" },
      { name: "Medicines & Consumables", min: 8000, max: 28000, benchmark: 12000, source: "NPPA EML 2024", coverage: "Ayushman: Included" },
      { name: "Diagnostics (Pre + Post op)", min: 4500, max: 14000, benchmark: 6000, source: "CGHS Diagnostic 2024", coverage: "ESIC: Covered" },
      { name: "Miscellaneous", min: 2000, max: 8000, benchmark: 3000, source: "NHA HBP 2024", coverage: "Varies" },
    ],
    confidence: 0.87,
    pmjayCoverage: 80000,
  },
  "cataract surgery": {
    name: "Cataract Surgery",
    icdCodes: [
      { code: "H25.9", desc: "Age-related cataract, unspecified" },
      { code: "0WB0", desc: "Extraction of lens" },
      { code: "66984", desc: "Extracapsular cataract removal" },
      { code: "99213", desc: "Office consultation code" },
    ],
    components: [
      { name: "Surgeon Fee", min: 15000, max: 45000, benchmark: 22000, source: "NHA HBP 2024", coverage: "PM-JAY: ₹30K pkg" },
      { name: "Anaesthesia Charges", min: 3000, max: 10000, benchmark: 5000, source: "CGHS 2024", coverage: "ESIC: Covered" },
      { name: "IOL Implant", min: 5000, max: 60000, benchmark: 8000, source: "NPPA 2024", coverage: "PM-JAY: Basic IOL covered", warning: "Premium IOLs cost 5x more" },
      { name: "Hospital Room (1 night)", min: 5000, max: 20000, benchmark: 4000, source: "CGHS Ward 2024", coverage: "Ayushman: Day care" },
      { name: "OT Charges", min: 8000, max: 20000, benchmark: 10000, source: "NHA HBP 2024", coverage: "MJPJAY: Covered" },
      { name: "Medicines & Consumables", min: 3000, max: 10000, benchmark: 4000, source: "NPPA EML 2024", coverage: "Ayushman: Included" },
      { name: "Diagnostics (Pre + Post op)", min: 2000, max: 8000, benchmark: 3000, source: "CGHS Diagnostic 2024", coverage: "ESIC: Covered" },
      { name: "Miscellaneous", min: 1000, max: 5000, benchmark: 2000, source: "NHA HBP 2024", coverage: "Varies" },
    ],
    confidence: 0.91,
    pmjayCoverage: 30000,
  },
  "hip fracture surgery": {
    name: "Hip Fracture Surgery",
    icdCodes: [
      { code: "S72.0", desc: "Fracture of neck of femur" },
      { code: "0SB0049", desc: "Open reduction of hip fracture" },
      { code: "27236", desc: "Open treatment of femoral fracture" },
      { code: "99213", desc: "Office consultation code" },
    ],
    components: [
      { name: "Surgeon Fee", min: 30000, max: 100000, benchmark: 50000, source: "NHA HBP 2024", coverage: "PM-JAY: ₹1L pkg" },
      { name: "Anaesthesia Charges", min: 10000, max: 28000, benchmark: 15000, source: "CGHS 2024", coverage: "ESIC: Covered" },
      { name: "Implant / Prosthesis (Hip)", min: 50000, max: 250000, benchmark: 65000, source: "NPPA 2024", coverage: "PM-JAY: Within ₹1L cap", warning: "Hip implant prices vary 5x" },
      { name: "Hospital Room (7 nights)", min: 24500, max: 84000, benchmark: 14000, source: "CGHS Ward 2024", coverage: "Ayushman: General ward" },
      { name: "OT Charges", min: 18000, max: 50000, benchmark: 22000, source: "NHA HBP 2024", coverage: "MJPJAY: Covered" },
      { name: "ICU Charges (3 days)", min: 24000, max: 75000, benchmark: 16500, source: "CGHS ICU 2024", coverage: "PM-JAY: Up to 3 days", hidden: "cardiac" },
      { name: "Physiotherapy (15 sessions)", min: 7500, max: 27000, benchmark: 6000, source: "CGHS 2024", coverage: "Not covered by schemes", hidden: "elderly" },
      { name: "Medicines & Consumables", min: 10000, max: 35000, benchmark: 15000, source: "NPPA EML 2024", coverage: "Ayushman: Included" },
      { name: "Diagnostics (Pre + Post op)", min: 5000, max: 18000, benchmark: 8000, source: "CGHS Diagnostic 2024", coverage: "ESIC: Covered" },
      { name: "Miscellaneous", min: 3000, max: 10000, benchmark: 4000, source: "NHA HBP 2024", coverage: "Varies" },
    ],
    confidence: 0.83,
    pmjayCoverage: 100000,
  },
  "coronary artery bypass": {
    name: "Coronary Artery Bypass Graft (CABG)",
    icdCodes: [
      { code: "I25.1", desc: "Atherosclerotic heart disease" },
      { code: "02100Z9", desc: "Bypass coronary artery" },
      { code: "33533", desc: "Coronary artery bypass" },
      { code: "99213", desc: "Office consultation code" },
    ],
    components: [
      { name: "Surgeon Fee", min: 80000, max: 250000, benchmark: 120000, source: "NHA HBP 2024", coverage: "PM-JAY: ₹2L pkg" },
      { name: "Anaesthesia Charges", min: 20000, max: 50000, benchmark: 30000, source: "CGHS 2024", coverage: "ESIC: Covered" },
      { name: "Hospital Room (8 nights)", min: 28000, max: 96000, benchmark: 16000, source: "CGHS Ward 2024", coverage: "Ayushman: General ward" },
      { name: "OT Charges", min: 40000, max: 100000, benchmark: 50000, source: "NHA HBP 2024", coverage: "MJPJAY: Covered" },
      { name: "ICU Charges (5 days)", min: 40000, max: 125000, benchmark: 27500, source: "CGHS ICU 2024", coverage: "PM-JAY: Up to 5 days" },
      { name: "Medicines & Consumables", min: 20000, max: 60000, benchmark: 30000, source: "NPPA EML 2024", coverage: "Ayushman: Included" },
      { name: "Diagnostics (Pre + Post op)", min: 10000, max: 30000, benchmark: 15000, source: "CGHS Diagnostic 2024", coverage: "ESIC: Covered" },
      { name: "Blood & Components", min: 8000, max: 25000, benchmark: 10000, source: "CGHS 2024", coverage: "ESIC: Covered" },
      { name: "Miscellaneous", min: 5000, max: 15000, benchmark: 8000, source: "NHA HBP 2024", coverage: "Varies" },
    ],
    confidence: 0.79,
    pmjayCoverage: 200000,
  },
  "appendectomy": {
    name: "Appendectomy",
    icdCodes: [
      { code: "K35.8", desc: "Acute appendicitis" },
      { code: "0DT40ZZ", desc: "Resection of appendix" },
      { code: "44970", desc: "Laparoscopy, appendectomy" },
      { code: "99213", desc: "Office consultation code" },
    ],
    components: [
      { name: "Surgeon Fee", min: 15000, max: 50000, benchmark: 25000, source: "NHA HBP 2024", coverage: "PM-JAY: ₹40K pkg" },
      { name: "Anaesthesia Charges", min: 5000, max: 15000, benchmark: 8000, source: "CGHS 2024", coverage: "ESIC: Covered" },
      { name: "Hospital Room (3 nights)", min: 10500, max: 36000, benchmark: 6000, source: "CGHS Ward 2024", coverage: "Ayushman: General ward" },
      { name: "OT Charges", min: 10000, max: 25000, benchmark: 12000, source: "NHA HBP 2024", coverage: "MJPJAY: Covered" },
      { name: "Medicines & Consumables", min: 5000, max: 15000, benchmark: 7000, source: "NPPA EML 2024", coverage: "Ayushman: Included" },
      { name: "Diagnostics (Pre + Post op)", min: 3000, max: 10000, benchmark: 5000, source: "CGHS Diagnostic 2024", coverage: "ESIC: Covered" },
      { name: "Miscellaneous", min: 2000, max: 6000, benchmark: 3000, source: "NHA HBP 2024", coverage: "Varies" },
    ],
    confidence: 0.93,
    pmjayCoverage: 40000,
  },
  "spinal fusion": {
    name: "Spinal Fusion Surgery",
    icdCodes: [
      { code: "M47.2", desc: "Spondylosis with myelopathy" },
      { code: "0SG0079", desc: "Fusion of spine" },
      { code: "22612", desc: "Arthrodesis, posterior spine" },
      { code: "99213", desc: "Office consultation code" },
    ],
    components: [
      { name: "Surgeon Fee", min: 60000, max: 200000, benchmark: 90000, source: "NHA HBP 2024", coverage: "PM-JAY: ₹1.5L pkg" },
      { name: "Anaesthesia Charges", min: 15000, max: 40000, benchmark: 20000, source: "CGHS 2024", coverage: "ESIC: Covered" },
      { name: "Implant / Prosthesis (Spine)", min: 80000, max: 350000, benchmark: 100000, source: "NPPA 2024", coverage: "PM-JAY: Partial coverage", warning: "Spinal implant costs vary widely" },
      { name: "Hospital Room (6 nights)", min: 21000, max: 72000, benchmark: 12000, source: "CGHS Ward 2024", coverage: "Ayushman: General ward" },
      { name: "OT Charges", min: 25000, max: 60000, benchmark: 30000, source: "NHA HBP 2024", coverage: "MJPJAY: Covered" },
      { name: "ICU Charges (2 days)", min: 16000, max: 50000, benchmark: 11000, source: "CGHS ICU 2024", coverage: "PM-JAY: Up to 2 days", hidden: "cardiac" },
      { name: "Physiotherapy (12 sessions)", min: 6000, max: 21600, benchmark: 4800, source: "CGHS 2024", coverage: "Not covered by schemes", hidden: "elderly" },
      { name: "Medicines & Consumables", min: 12000, max: 40000, benchmark: 18000, source: "NPPA EML 2024", coverage: "Ayushman: Included" },
      { name: "Diagnostics (Pre + Post op)", min: 8000, max: 25000, benchmark: 12000, source: "CGHS Diagnostic 2024", coverage: "ESIC: Covered" },
      { name: "Miscellaneous", min: 4000, max: 12000, benchmark: 6000, source: "NHA HBP 2024", coverage: "Varies" },
    ],
    confidence: 0.81,
    pmjayCoverage: 150000,
  },
  "chemotherapy cycle": {
    name: "Chemotherapy Cycle",
    icdCodes: [
      { code: "Z51.1", desc: "Encounter for antineoplastic chemotherapy" },
      { code: "0D970ZX", desc: "Chemotherapy administration" },
      { code: "96413", desc: "Chemotherapy infusion, first hour" },
      { code: "99213", desc: "Office consultation code" },
    ],
    components: [
      { name: "Oncologist Fee", min: 5000, max: 20000, benchmark: 8000, source: "NHA HBP 2024", coverage: "PM-JAY: Per cycle" },
      { name: "Chemotherapy Drugs", min: 15000, max: 200000, benchmark: 25000, source: "NPPA EML 2024", coverage: "Ayushman: Basic regimen", warning: "Drug costs vary 10x by regimen" },
      { name: "Day Care / Room (1 day)", min: 3000, max: 15000, benchmark: 3000, source: "CGHS Ward 2024", coverage: "Ayushman: Day care" },
      { name: "OT / Procedure Room", min: 3000, max: 10000, benchmark: 4000, source: "NHA HBP 2024", coverage: "MJPJAY: Covered" },
      { name: "Pre-medication & Support", min: 2000, max: 8000, benchmark: 3000, source: "NPPA EML 2024", coverage: "Ayushman: Included" },
      { name: "Diagnostics (Blood work)", min: 2000, max: 8000, benchmark: 3000, source: "CGHS Diagnostic 2024", coverage: "ESIC: Covered" },
      { name: "Miscellaneous", min: 1000, max: 5000, benchmark: 2000, source: "NHA HBP 2024", coverage: "Varies" },
    ],
    confidence: 0.76,
    pmjayCoverage: 35000,
  },
  "dialysis session": {
    name: "Dialysis Session",
    icdCodes: [
      { code: "Z99.2", desc: "Dependence on renal dialysis" },
      { code: "3E033GC", desc: "Hemodialysis" },
      { code: "90935", desc: "Hemodialysis procedure" },
      { code: "99213", desc: "Office consultation code" },
    ],
    components: [
      { name: "Nephrologist Fee", min: 1500, max: 5000, benchmark: 2000, source: "NHA HBP 2024", coverage: "PM-JAY: Per session" },
      { name: "Dialysis Consumables", min: 3000, max: 10000, benchmark: 4000, source: "NPPA EML 2024", coverage: "Ayushman: Basic covered" },
      { name: "Dialysis Machine & Setup", min: 3000, max: 8000, benchmark: 3500, source: "CGHS 2024", coverage: "ESIC: Covered" },
      { name: "Medicines (EPO, Heparin)", min: 1000, max: 5000, benchmark: 1500, source: "NPPA EML 2024", coverage: "Ayushman: Included" },
      { name: "Diagnostics (Blood work)", min: 500, max: 2000, benchmark: 800, source: "CGHS Diagnostic 2024", coverage: "ESIC: Covered" },
      { name: "Miscellaneous", min: 500, max: 2000, benchmark: 700, source: "NHA HBP 2024", coverage: "Varies" },
    ],
    confidence: 0.94,
    pmjayCoverage: 4000,
  },
  "mri scan": {
    name: "MRI Scan",
    icdCodes: [
      { code: "Z51.81", desc: "Encounter for imaging" },
      { code: "B53YXXZ", desc: "MRI of body region" },
      { code: "70553", desc: "MRI brain with contrast" },
      { code: "99213", desc: "Office consultation code" },
    ],
    components: [
      { name: "Radiologist Fee", min: 2000, max: 8000, benchmark: 3000, source: "NHA HBP 2024", coverage: "PM-JAY: Covered" },
      { name: "MRI Machine Charges", min: 5000, max: 25000, benchmark: 7000, source: "CGHS Diagnostic 2024", coverage: "ESIC: Covered", warning: "3T MRI costs 2x more than 1.5T" },
      { name: "Contrast Agent", min: 1000, max: 5000, benchmark: 1500, source: "NPPA EML 2024", coverage: "Ayushman: If required" },
      { name: "Reporting & Films", min: 500, max: 2000, benchmark: 800, source: "CGHS Diagnostic 2024", coverage: "ESIC: Included" },
      { name: "Miscellaneous", min: 200, max: 1000, benchmark: 400, source: "NHA HBP 2024", coverage: "Varies" },
    ],
    confidence: 0.95,
    pmjayCoverage: 7000,
  },
  "icu stay": {
    name: "ICU Stay (Per Day)",
    icdCodes: [
      { code: "Z96.89", desc: "Presence of other functional implants" },
      { code: "99291", desc: "Critical care, first hour" },
      { code: "99292", desc: "Critical care, each additional 30 min" },
    ],
    components: [
      { name: "ICU Bed Charge", min: 5000, max: 25000, benchmark: 5500, source: "CGHS ICU 2024", coverage: "PM-JAY: Up to 3 days" },
      { name: "Nursing & Monitoring", min: 2000, max: 10000, benchmark: 3000, source: "NHA HBP 2024", coverage: "Ayushman: Included" },
      { name: "Medicines & IV Fluids", min: 2000, max: 15000, benchmark: 4000, source: "NPPA EML 2024", coverage: "Varies by condition" },
      { name: "Ventilator (if needed)", min: 3000, max: 12000, benchmark: 4000, source: "CGHS ICU 2024", coverage: "ESIC: Covered" },
      { name: "Diagnostics", min: 1000, max: 5000, benchmark: 2000, source: "CGHS Diagnostic 2024", coverage: "ESIC: Covered" },
      { name: "Miscellaneous", min: 500, max: 3000, benchmark: 1000, source: "NHA HBP 2024", coverage: "Varies" },
    ],
    confidence: 0.88,
    pmjayCoverage: 5500,
  },
};

export function matchProcedure(query: string): string | null {
  const q = query.toLowerCase();
  const keys = Object.keys(procedureData);
  for (const key of keys) {
    if (q.includes(key)) return key;
  }
  if (q.includes("knee")) return "knee replacement";
  if (q.includes("cataract") || q.includes("eye")) return "cataract surgery";
  if (q.includes("hip")) return "hip fracture surgery";
  if (q.includes("bypass") || q.includes("cabg") || q.includes("heart")) return "coronary artery bypass";
  if (q.includes("append")) return "appendectomy";
  if (q.includes("spine") || q.includes("spinal")) return "spinal fusion";
  if (q.includes("chemo")) return "chemotherapy cycle";
  if (q.includes("dialysis")) return "dialysis session";
  if (q.includes("mri")) return "mri scan";
  if (q.includes("icu") || q.includes("intensive")) return "icu stay";
  return null;
}

export const chatResponses: Record<string, string> = {
  "what does my bill include": "Your hospital bill typically includes: Surgeon fees, Anaesthesia charges, Implant/Prosthesis costs, Room charges, OT charges, ICU charges (if applicable), Medicines & consumables, Diagnostics, and Miscellaneous costs. Each component is benchmarked against NHA HBP, CGHS, PM-JAY, and NPPA rates to ensure fair pricing.",
  "is this procedure covered": "Coverage depends on your insurance and government scheme eligibility. PM-JAY covers procedures up to ₹5,00,000/year for eligible families. CGHS covers central government employees. ESIC covers employees with salary ≤ ₹21,000/month. Check the scheme eligibility cards in the lender view for specific coverage details.",
  "how do i appeal a claim": "To appeal a denied claim: 1) Request a written denial explanation from your insurer, 2) Gather supporting medical documents and ICD-10 codes, 3) File an internal appeal with your insurance company within 30 days, 4) If denied again, approach IRDAI's grievance redressal mechanism, 5) For PM-JAY issues, contact the Ayushman Bharat helpline at 14555.",
  "what's a fair price for this surgery": "CURIFY benchmarks every cost against government-mandated rates: NHA Health Benefit Package rates, CGHS approved rates, NPPA price caps for implants, and PM-JAY package rates. The 'fair price' is typically close to the government benchmark, which reflects actual cost without hospital markup. Use the cost breakdown table to compare any quote against these benchmarks.",
};
