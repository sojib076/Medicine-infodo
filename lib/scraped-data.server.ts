// lib/scraped-data.server.ts
// Server-only utility — reads the lean index JSON + per-medicine .md files.
// Import only from Server Components or route handlers; never from "use client" files.

import fs from "fs";
import path from "path";

const INDEX_PATH = path.join(process.cwd(), "public", "data", "medicines-index.json");
const MD_DIR = path.join(process.cwd(), "public", "data", "medicines");

export interface MedicineIndex {
  slug: string;
  name: string;
  strength: string;
  generic: string;
  manufacturer: string;
  image: string | null;
}

let _indexCache: MedicineIndex[] | null = null;

export function getMedicinesIndex(): MedicineIndex[] {
  if (_indexCache) return _indexCache;
  try {
    const raw = fs.readFileSync(INDEX_PATH, "utf8");
    _indexCache = JSON.parse(raw) as MedicineIndex[];
    return _indexCache;
  } catch {
    return [];
  }
}

export function getMedicineBySlug(slug: string): MedicineIndex | undefined {
  return getMedicinesIndex().find((m) => m.slug === slug);
}

/** Parse `## Section Name\nContent…` blocks from a .md file */
function parseMdSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const parts = content.split(/\n(?=## )/);
  for (const part of parts) {
    const match = part.match(/^## (.+)\n([\s\S]*)/);
    if (match) {
      sections[match[1].trim()] = match[2].trim();
    }
  }
  return sections;
}

/** Reads the per-medicine .md file and returns its sections (empty object if missing). */
export function getMedicineSections(slug: string): Record<string, string> {
  try {
    const content = fs.readFileSync(path.join(MD_DIR, `${slug}.md`), "utf8");
    return parseMdSections(content);
  } catch {
    return {};
  }
}

/** Slugify a manufacturer name for use in URLs */
export function toManufacturerSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Return all medicines for a given manufacturer slug */
export function getMedicinesByManufacturer(manufacturerSlug: string): MedicineIndex[] {
  return getMedicinesIndex().filter(
    (m) => toManufacturerSlug(m.manufacturer) === manufacturerSlug
  );
}

/** Return unique manufacturers derived from the index */
export function getManufacturers(): Array<{ slug: string; name: string; count: number }> {
  const map = new Map<string, { name: string; count: number }>();
  for (const m of getMedicinesIndex()) {
    const slug = toManufacturerSlug(m.manufacturer);
    const existing = map.get(slug);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(slug, { name: m.manufacturer, count: 1 });
    }
  }
  return Array.from(map.entries())
    .map(([slug, { name, count }]) => ({ slug, name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ── Category mapping ───────────────────────────────────────────────────────

/**
 * Keyword → category slug mapping.
 * Checks the medicine's generic name (lowercase) for any of the listed substrings.
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  analgesic:       ["paracetamol", "ibuprofen", "aspirin", "naproxen", "diclofenac", "tramadol", "ketorolac", "mefenamic"],
  antibiotic:      ["amoxicillin", "azithromycin", "cefixime", "ciprofloxacin", "doxycycline", "metronidazole", "cephalexin", "moxifloxacin", "levofloxacin", "clarithromycin", "erythromycin", "ampicillin", "ceftriaxone", "cefuroxime"],
  cardiac:         ["atenolol", "amlodipine", "losartan", "valsartan", "metoprolol", "digoxin", "atorvastatin", "warfarin", "clopidogrel", "furosemide", "ramipril", "enalapril", "bisoprolol", "diltiazem", "spironolactone"],
  gastrointestinal:["omeprazole", "pantoprazole", "ranitidine", "lansoprazole", "esomeprazole", "metoclopramide", "domperidone", "bismuth", "loperamide", "lactulose"],
  diabetic:        ["metformin", "glibenclamide", "insulin", "glipizide", "sitagliptin", "gliclazide", "pioglitazone", "empagliflozin", "dapagliflozin", "vildagliptin"],
  antihistamine:   ["cetirizine", "fexofenadine", "loratadine", "chlorphenamine", "desloratadine", "levocetirizine", "hydroxyzine"],
  respiratory:     ["salbutamol", "theophylline", "montelukast", "beclometasone", "fluticasone", "salmeterol", "ipratropium", "budesonide", "tiotropium"],
  neurological:    ["phenobarbital", "carbamazepine", "diazepam", "haloperidol", "phenytoin", "valproate", "levetiracetam", "risperidone", "quetiapine", "olanzapine"],
  vitamin:         ["vitamin", "calcium", "zinc", "iron", "folic", "thiamine", "riboflavin", "ascorbic", "tocopherol", "cholecalciferol", "cyanocobalamin"],
  musculoskeletal: ["methocarbamol", "baclofen", "tizanidine", "cyclobenzaprine", "colchicine", "allopurinol", "etoricoxib", "celecoxib"],
  dental:          ["chlorhexidine", "benzocaine", "lidocaine", "tetracycline", "minocycline"],
  ophthalmology:   ["timolol", "latanoprost", "dorzolamide", "prednisolone acetate", "ciprofloxacin eye", "ofloxacin", "sodium cromoglicate"],
};

export function getCategorySlug(generic: string): string | null {
  const lower = generic.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return null;
}

/** Return all medicines whose generic name matches a given category slug */
export function getMedicinesByCategory(categorySlug: string): MedicineIndex[] {
  const keywords = CATEGORY_KEYWORDS[categorySlug];
  if (!keywords) return [];
  return getMedicinesIndex().filter((m) => {
    const lower = m.generic.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  });
}
/** @deprecated Use getMedicinesIndex() instead */
export function getScrapedMedicines() { return getMedicinesIndex() as never[]; }
/** @deprecated No longer used; medicine sections are in per-slug .md files */
export function getScrapedMedicine(_slug: string) { return undefined; }
