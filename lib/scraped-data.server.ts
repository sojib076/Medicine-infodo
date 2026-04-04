// lib/scraped-data.server.ts
// Server-only utility — reads the JSON written by scraper/scrape.js.
// Import only from Server Components or route handlers; never from "use client" files.

import fs from "fs";
import path from "path";
import type { ScrapedMedicine } from "./data";

const DATA_PATH = path.join(process.cwd(), "public", "data", "medicines.json");

let _cache: ScrapedMedicine[] | null = null;

export function getScrapedMedicines(): ScrapedMedicine[] {
  if (_cache) return _cache;
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    _cache = JSON.parse(raw) as ScrapedMedicine[];
    return _cache;
  } catch {
    // Scraped data not yet available — callers fall back to demo data
    return [];
  }
}

export function getScrapedMedicine(slug: string): ScrapedMedicine | undefined {
  return getScrapedMedicines().find((m) => m.slug === slug);
}
