// app/search/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { getMedicinesIndex } from "@/lib/scraped-data.server";

const BASE_URL = "https://medinfo.com.bd";

export const metadata: Metadata = {
  title: "Search Medicines – MedInfoBD",
  description: "Search Bangladesh's medicine database by brand name, generic molecule, or manufacturer.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${BASE_URL}/search` },
};

export default function SearchPage() {
  const medicines = getMedicinesIndex();
  return (
    <Suspense>
      <SearchClient medicines={medicines} />
    </Suspense>
  );
}
