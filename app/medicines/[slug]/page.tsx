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
  const rawTitle = `${med.name} ${med.strength} – ${med.generic} | MedInfoBD`;
  // Keep title ≤ 60 chars by trimming the template suffix if needed
  const title = rawTitle.length > 60
    ? `${med.name} ${med.strength} – ${med.generic}`
    : rawTitle;
  const description = `${med.name} (${med.generic} ${med.strength}) by ${med.manufacturer}. Dosage, side effects, indications, composition and storage information.`;
  return {
    title,
    description,
    keywords: [med.name, med.generic, med.manufacturer, "medicine bangladesh", "drug information", "DGDA"],
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/medicines/${med.slug}`,
      siteName: "MedInfoBD",
      locale: "en_BD",
      type: "article",
      ...(med.image ? { images: [{ url: med.image, alt: `${med.name} ${med.strength} – ${med.generic}` }] } : {}),
    },
    twitter: { card: "summary", title, description },
    alternates: { canonical: `${BASE_URL}/medicines/${med.slug}` },
  };
}

/** Derive a simple dosage form label from the medicine name or strength text. */
function deriveDosageForm(name: string, strength: string): string {
  const text = `${name} ${strength}`.toLowerCase();
  if (text.includes("syrup") || text.includes("suspension")) return "Oral Liquid";
  if (text.includes("injection") || text.includes("vial") || text.includes("i.v.")) return "Injection";
  if (text.includes("cream") || text.includes("ointment") || text.includes("gel")) return "Topical";
  if (text.includes("drop")) return "Eye/Ear Drops";
  if (text.includes("capsule")) return "Capsule";
  if (text.includes("sachet") || text.includes("powder")) return "Powder";
  if (text.includes("inhaler")) return "Inhaler";
  return "Tablet";
}

/** Build FAQ entries from well-known medicine sections for use in FAQPage schema. */
function buildFaqEntries(
  name: string,
  strength: string,
  sections: Record<string, string>,
): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];

  const indications = sections["Indications"] ?? sections["Indication"];
  if (indications) {
    faqs.push({
      question: `What is ${name} ${strength} used for?`,
      answer: indications.replace(/\n+/g, " ").trim().slice(0, 500),
    });
  }

  const dosage = sections["Dosage & Administration"] ?? sections["Dosage"];
  if (dosage) {
    faqs.push({
      question: `What is the dosage for ${name} ${strength}?`,
      answer: dosage.replace(/\n+/g, " ").trim().slice(0, 500),
    });
  }

  const sideEffects = sections["Side Effects"];
  if (sideEffects) {
    faqs.push({
      question: `What are the side effects of ${name} ${strength}?`,
      answer: sideEffects.replace(/\n+/g, " ").trim().slice(0, 500),
    });
  }

  const precautions = sections["Precautions & Warnings"] ?? sections["Precautions"];
  if (precautions) {
    faqs.push({
      question: `What precautions should I take with ${name}?`,
      answer: precautions.replace(/\n+/g, " ").trim().slice(0, 500),
    });
  }

  const storage = sections["Storage Conditions"] ?? sections["Storage"];
  if (storage) {
    faqs.push({
      question: `How should ${name} be stored?`,
      answer: storage.replace(/\n+/g, " ").trim().slice(0, 300),
    });
  }

  return faqs;
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

  const dosageForm = deriveDosageForm(med.name, med.strength);

  // JSON-LD Drug schema
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Drug",
    name: `${med.name} ${med.strength}`,
    description: `${med.name} (${med.generic} ${med.strength}) is manufactured by ${med.manufacturer}. It is available as a ${dosageForm}.`,
    activeIngredient: med.generic,
    dosageForm,
    manufacturer: { "@type": "Organization", name: med.manufacturer },
    strengthValue: med.strength,
    url: `${BASE_URL}/medicines/${med.slug}`,
    ...(med.image ? { image: med.image } : {}),
  };

  // FAQPage schema – derived from medicine sections
  const faqEntries = buildFaqEntries(med.name, med.strength, sections);
  const faqLd: Record<string, unknown> | null = faqEntries.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqEntries.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  return (
    <>
      <Script
        id={`jsonld-drug-${med.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqLd && (
        <Script
          id={`jsonld-faq-${med.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <MedicineDetailClient
        med={med}
        related={related}
        sections={sections}
        manufacturerSlug={manufacturerSlug}
      />
    </>
  );
}
