// app/brands/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { medicines, tabContent } from "@/lib/data";
import BrandDetailClient from "./BrandDetailClient";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return medicines.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const med = medicines.find((m) => m.slug === params.slug);
  if (!med) return {};
  return {
    title: `${med.name} – ${med.generic} ${med.strength}`,
    description: `Full information about ${med.name} by ${med.manufacturer}. Generic: ${med.generic} ${med.strength}. Dosage, side effects, warnings, and storage.`,
  };
}

export default function BrandDetailPage({ params }: Props) {
  const med = medicines.find((m) => m.slug === params.slug);
  if (!med) notFound();

  const related = medicines.filter((m) => m.slug !== med.slug && (m.category === med.category || m.generic === med.generic)).slice(0, 4);

  return (
    <BrandDetailClient
      med={med}
      related={related}
      tabContent={tabContent}
    />
  );
}
