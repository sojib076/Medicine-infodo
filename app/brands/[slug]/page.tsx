// app/brands/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { medicines, tabContent } from "@/lib/data";
import { getScrapedMedicine } from "@/lib/scraped-data.server";
import BrandDetailClient from "./BrandDetailClient";

const BASE_URL = "https://medinfo.com.bd";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return medicines.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const med = medicines.find((m) => m.slug === params.slug);
  if (!med) return {};
  const title = `${med.name} – ${med.generic} ${med.strength}`;
  const description = `${med.name} by ${med.manufacturer}. Generic: ${med.generic} ${med.strength}. Dosage, side effects, warnings, composition, and storage information.`;
  return {
    title,
    description,
    keywords: [med.name, med.generic, med.manufacturer, "medicine bangladesh", "drug information"],
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/brands/${med.slug}`,
      siteName: "MedInfoBD",
      locale: "en_BD",
      type: "article",
    },
    twitter: { card: "summary", title, description },
    alternates: { canonical: `${BASE_URL}/brands/${med.slug}` },
  };
}

export default function BrandDetailPage({ params }: Props) {
  const med = medicines.find((m) => m.slug === params.slug);
  if (!med) notFound();

  const related = medicines
    .filter((m) => m.slug !== med.slug && (m.category === med.category || m.generic === med.generic))
    .slice(0, 4);

  // Prefer sections from the scraped JSON; fall back to demo tabContent
  const scraped = getScrapedMedicine(params.slug);
  const resolvedTabContent = scraped?.sections ?? tabContent;

  // JSON-LD: Drug schema (MedicalEntity)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Drug",
    name: med.name,
    description: `${med.name} is a ${med.generic} ${med.strength} ${med.form} manufactured by ${med.manufacturer}.`,
    activeIngredient: med.generic,
    manufacturer: {
      "@type": "Organization",
      name: med.manufacturer,
    },
    dosageForm: med.form,
    strengthValue: med.strength,
    url: `${BASE_URL}/brands/${med.slug}`,
  };

  return (
    <>
      <Script
        id={`jsonld-drug-${med.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BrandDetailClient
        med={med}
        related={related}
        tabContent={resolvedTabContent}
      />
    </>
  );
}
