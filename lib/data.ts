// lib/data.ts

export interface Medicine {
  slug: string;
  name: string;
  manufacturer: string;
  generic: string;
  strength: string;
  form: string;
  pack: string;
  category: string;
  price: string;
  badge?: "Popular" | "New" | "";
  description?: string;
}

// Shape written by scraper/scrape.js → public/data/medicines.json
export interface ScrapedMedicine {
  slug: string;
  name: string;
  strength: string;
  generic: string;
  manufacturer: string;
  url: string;
  image: string | null;
  sections: Record<string, string>;
}

export interface Category {
  slug: string;
  icon: string;
  name: string;
  desc: string;
  count: number;
}

// ── Medicines ─────────────────────────────────────────────────────────────
export const medicines: Medicine[] = [
  { slug: "napa", name: "Napa", manufacturer: "Beximco Pharma", generic: "Paracetamol", strength: "500mg", form: "Tablet", pack: "10×10 Tablets", category: "analgesic", price: "৳ 8.00/strip", badge: "Popular", description: "Napa is a widely used analgesic and antipyretic for relief of mild to moderate pain and fever." },
  { slug: "azimax", name: "Azimax", manufacturer: "Square Pharma", generic: "Azithromycin", strength: "500mg", form: "Tablet", pack: "3 Tablets", category: "antibiotic", price: "৳ 60.00/strip", badge: "Popular" },
  { slug: "seclo", name: "Seclo", manufacturer: "Square Pharma", generic: "Omeprazole", strength: "20mg", form: "Capsule", pack: "10 Capsules", category: "gastrointestinal", price: "৳ 5.00/strip", badge: "" },
  { slug: "cef-3", name: "Cef-3", manufacturer: "ACI Limited", generic: "Cefixime", strength: "200mg", form: "Tablet", pack: "10 Tablets", category: "antibiotic", price: "৳ 80.00/strip", badge: "New" },
  { slug: "amoxil", name: "Amoxil", manufacturer: "GlaxoSmithKline", generic: "Amoxicillin", strength: "250mg", form: "Capsule", pack: "10 Capsules", category: "antibiotic", price: "৳ 12.00/strip", badge: "" },
  { slug: "losectil", name: "Losectil", manufacturer: "Incepta Pharma", generic: "Omeprazole", strength: "40mg", form: "Capsule", pack: "10 Capsules", category: "gastrointestinal", price: "৳ 10.00/strip", badge: "Popular" },
  { slug: "zimax", name: "Zimax", manufacturer: "Opsonin Pharma", generic: "Azithromycin", strength: "250mg", form: "Tablet", pack: "6 Tablets", category: "antibiotic", price: "৳ 35.00/strip", badge: "" },
  { slug: "fexo", name: "Fexo", manufacturer: "Healthcare Pharma", generic: "Fexofenadine", strength: "120mg", form: "Tablet", pack: "10 Tablets", category: "antihistamine", price: "৳ 15.00/strip", badge: "New" },
  { slug: "moxacil", name: "Moxacil", manufacturer: "Renata Limited", generic: "Amoxicillin", strength: "500mg", form: "Capsule", pack: "10 Capsules", category: "antibiotic", price: "৳ 18.00/strip", badge: "" },
  { slug: "pantonix", name: "Pantonix", manufacturer: "Beximco Pharma", generic: "Pantoprazole", strength: "40mg", form: "Tablet", pack: "14 Tablets", category: "gastrointestinal", price: "৳ 12.00/strip", badge: "Popular" },
  { slug: "cefam", name: "Cefam", manufacturer: "Drug International", generic: "Cephalexin", strength: "500mg", form: "Capsule", pack: "10 Capsules", category: "antibiotic", price: "৳ 22.00/strip", badge: "" },
  { slug: "cetrizin", name: "Cetrizin", manufacturer: "Square Pharma", generic: "Cetirizine", strength: "10mg", form: "Tablet", pack: "10 Tablets", category: "antihistamine", price: "৳ 5.00/strip", badge: "Popular" },
  { slug: "napa-extend", name: "Napa Extend", manufacturer: "Beximco Pharma", generic: "Paracetamol", strength: "665mg", form: "Tablet", pack: "10 Tablets", category: "analgesic", price: "৳ 12.00/strip", badge: "Popular" },
  { slug: "moxef", name: "Moxef", manufacturer: "Square Pharma", generic: "Moxifloxacin", strength: "400mg", form: "Tablet", pack: "5 Tablets", category: "antibiotic", price: "৳ 120.00/strip", badge: "New" },
  { slug: "clavam", name: "Clavam", manufacturer: "Incepta Pharma", generic: "Amoxicillin + Clavulanate", strength: "625mg", form: "Tablet", pack: "10 Tablets", category: "antibiotic", price: "৳ 70.00/strip", badge: "" },
  { slug: "zantac", name: "Zantac", manufacturer: "GlaxoSmithKline", generic: "Ranitidine", strength: "150mg", form: "Tablet", pack: "10 Tablets", category: "gastrointestinal", price: "৳ 4.00/strip", badge: "" },
];

// ── Categories ────────────────────────────────────────────────────────────
export const categories: Category[] = [
  { slug: "analgesic", icon: "💊", name: "Analgesic", desc: "Pain relief and fever reduction", count: 142 },
  { slug: "antibiotic", icon: "🦠", name: "Antibiotic", desc: "Bacterial infection treatment", count: 234 },
  { slug: "cardiac", icon: "🫀", name: "Cardiac", desc: "Heart and cardiovascular drugs", count: 89 },
  { slug: "neurological", icon: "🧠", name: "Neurological", desc: "Brain and nervous system", count: 76 },
  { slug: "respiratory", icon: "🫁", name: "Respiratory", desc: "Lungs and breathing conditions", count: 95 },
  { slug: "diabetic", icon: "🩸", name: "Diabetic", desc: "Blood sugar management", count: 108 },
  { slug: "dental", icon: "🦷", name: "Dental", desc: "Oral and dental care drugs", count: 45 },
  { slug: "ophthalmology", icon: "👁️", name: "Ophthalmology", desc: "Eye care medications", count: 62 },
  { slug: "antihistamine", icon: "🤧", name: "Antihistamine", desc: "Allergy relief medications", count: 83 },
  { slug: "gastrointestinal", icon: "🩺", name: "Gastrointestinal", desc: "Digestive system treatment", count: 119 },
  { slug: "vitamin", icon: "🧪", name: "Vitamin & Supplement", desc: "Nutritional supplements", count: 157 },
  { slug: "musculoskeletal", icon: "🦴", name: "Musculoskeletal", desc: "Bone, joint and muscle care", count: 71 },
];

// ── Tab content ─────────────────────────────────────────────────────────
export const tabContent: Record<string, string> = {
  Composition: "Each tablet contains Paracetamol 500mg, microcrystalline cellulose, starch, and magnesium stearate as excipients.",
  Indications: "Indicated for mild to moderate pain relief including headache, toothache, backache, and fever reduction in adults and children.",
  Dosage: "Adults: 1–2 tablets every 4–6 hours as required. Do not exceed 8 tablets in 24 hours. Children (6–12 years): half the adult dose.",
  "Side Effects": "Generally well tolerated. Rare: allergic reactions, skin rash, blood disorders. Serious liver damage may occur with overdose.",
  Warnings: "Avoid in severe hepatic impairment. Do not use with other paracetamol-containing products. Alcohol use increases risk of liver damage.",
  Storage: "Store below 25°C in a dry place, protected from light. Keep out of reach of children. Do not use after expiry date.",
};

// ── FAQs ─────────────────────────────────────────────────────────────────
export const faqs = [
  { q: "What is MedInfoBD?", a: "MedInfoBD is Bangladesh's largest online medicine information database, providing detailed information about brands, generics, dosage, side effects, warnings, and more." },
  { q: "Are the prices listed here up to date?", a: "Prices are updated regularly based on DGDA-approved rates. However, slight variations may occur at local pharmacies. Always confirm with your pharmacist." },
  { q: "How do I find a generic alternative?", a: "Each brand page shows the generic name and molecule. Use the search to find all brands sharing the same active ingredient." },
  { q: "Is this a platform to buy medicines online?", a: "No. MedInfoBD is an informational platform only. Always consult a registered physician before taking any medication." },
  { q: "How often is the database updated?", a: "Our database is reviewed monthly with new brands, updated compositions, and revised pricing from official DGDA bulletins." },
  { q: "Can I trust the medical information on this site?", a: "All information is sourced from official prescribing information and DGDA-approved labelling. However, always verify with a licensed healthcare professional before use." },
];
