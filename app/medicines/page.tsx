// app/medicines/page.tsx
import type { Metadata } from "next";
import { getMedicinesIndex } from "@/lib/scraped-data.server";
import MedicinesClient from "./MedicinesClient";

export const metadata: Metadata = {
  title: "All Medicines – MedInfoBD",
  description:
    "Browse all DGDA-approved medicines available in Bangladesh. Search by medicine name, generic molecule, or manufacturer.",
};

export default function MedicinesPage() {
  const medicines = getMedicinesIndex();
  return <MedicinesClient medicines={medicines} />;
}
