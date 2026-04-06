// app/medicines/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import {
  getMedicinesIndex,
  getMedicineBySlug,
  getMedicineSections,
  toManufacturerSlug,
} from "@/lib/scraped-data.server";
import MedicineDetailClient from "./MedicineDetailClient";

const BASE_URL = "https://medinfo.com.bd";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return getMedicinesIndex().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const med = getMedicineBySlug(params.slug);
  if (!med) return {};
  const title = `${med.name} ${med.strength} – ${med.generic} | MedInfoBD`;
  const description = `${med.name} (${med.generic} ${med.strength}) by ${med.manufacturer}. Dosage, side effects, indications, composition and storage information.`;
  return {
    title,
    description,
    keywords: [med.name, med.generic, med.manufacturer, "medicine bangladesh", "drug information", "DGDA"],
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/medicines/${med.slug}`,
      siteName: "MedInfoBD",
      locale: "en_BD",
      type: "article",
      ...(med.image ? { images: [{ url: med.image }] } : {}),
    },
    twitter: { card: "summary", title, description },
    alternates: { canonical: `${BASE_URL}/medicines/${med.slug}` },
  };
}

export default function MedicineDetailPage({ params }: Props) {
  const med = getMedicineBySlug(params.slug);
  if (!med) notFound();

  const all = getMedicinesIndex();
  const sections = getMedicineSections(params.slug);
  const manufacturerSlug = toManufacturerSlug(med.manufacturer);

  // Related: same generic or same manufacturer, excluding self
  const related = all
    .filter(
      (m) =>
        m.slug !== med.slug &&
        (m.generic === med.generic || m.manufacturer === med.manufacturer)
    )
    .slice(0, 4);

  // JSON-LD Drug schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Drug",
    name: med.name,
    description: `${med.name} is a ${med.generic} ${med.strength} manufactured by ${med.manufacturer}.`,
    activeIngredient: med.generic,
    manufacturer: { "@type": "Organization", name: med.manufacturer },
    strengthValue: med.strength,
    url: `${BASE_URL}/medicines/${med.slug}`,
    ...(med.image ? { image: med.image } : {}),
  };

  return (
    <>
      <Script
        id={`jsonld-drug-${med.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MedicineDetailClient
        med={med}
        related={related}
        sections={sections}
        manufacturerSlug={manufacturerSlug}
      />
    </>
  );
}
