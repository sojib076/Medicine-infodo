// app/search/page.tsx
import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { getMedicinesIndex } from "@/lib/scraped-data.server";

export default function SearchPage() {
  const medicines = getMedicinesIndex();
  return (
    <Suspense>
      <SearchClient medicines={medicines} />
    </Suspense>
  );
}
