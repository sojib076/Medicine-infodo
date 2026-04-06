// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getMedicinesIndex, getManufacturers } from "@/lib/scraped-data.server";

const BASE_URL = "https://medinfo.com.bd";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/medicines`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/brands`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const medicineRoutes: MetadataRoute.Sitemap = getMedicinesIndex().map((m) => ({
    url: `${BASE_URL}/medicines/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const brandRoutes: MetadataRoute.Sitemap = getManufacturers().map((mfr) => ({
    url: `${BASE_URL}/brands/${mfr.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...medicineRoutes, ...brandRoutes];
}
