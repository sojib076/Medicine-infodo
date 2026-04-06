// app/brands/[slug]/page.tsx
// Shows all medicines from a specific manufacturer brand.
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NextLink from "next/link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppBreadcrumbs from "@/components/ui/AppBreadcrumbs";
import MedicineCard from "@/components/medicine/MedicineCard";
import {
  getManufacturers,
  getMedicinesByManufacturer,
} from "@/lib/scraped-data.server";
import { tokens } from "@/lib/theme";

const BASE_URL = "https://medinfo.com.bd";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return getManufacturers().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const mfr = getManufacturers().find((m) => m.slug === params.slug);
  if (!mfr) return {};
  const title = `${mfr.name} Medicines – MedInfoBD`;
  const description = `Browse all ${mfr.count} medicines manufactured by ${mfr.name} available in Bangladesh.`;
  return {
    title,
    description,
    openGraph: { title, description, url: `${BASE_URL}/brands/${mfr.slug}`, siteName: "MedInfoBD", locale: "en_BD", type: "website" },
    twitter: { card: "summary", title, description },
    alternates: { canonical: `${BASE_URL}/brands/${mfr.slug}` },
  };
}

export default function BrandMedicinesPage({ params }: Props) {
  const mfr = getManufacturers().find((m) => m.slug === params.slug);
  if (!mfr) notFound();

  const medicines = getMedicinesByManufacturer(params.slug);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: "15px", md: "25px" }, px: { xs: "10px", md: "20px" } }}>
      <AppBreadcrumbs crumbs={[
        { label: "Home",   href: "/" },
        { label: "Brands", href: "/brands" },
        { label: mfr.name },
      ]} />

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 4 }}>
        <Box sx={{
          width: 56, height: 56, flexShrink: 0, borderRadius: "12px",
          background: `linear-gradient(135deg, ${tokens.primary}18, ${tokens.accent}22)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <BusinessIcon sx={{ color: tokens.primary, fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.3, fontWeight: 800 }}>{mfr.name}</Typography>
          <Typography variant="body1" sx={{ color: tokens.secondary }}>
            {medicines.length} medicine{medicines.length !== 1 ? "s" : ""} in our database
          </Typography>
        </Box>
      </Box>

      {medicines.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" sx={{ color: tokens.secondary, mb: 2 }}>No medicines found for this brand.</Typography>
          <Button component={NextLink} href="/brands" startIcon={<ArrowBackIcon />} variant="outlined">
            Back to Brands
          </Button>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 1, md: 2 }}>
          {medicines.map((med) => (
            <Grid item xs={12} sm={6} md={3} key={med.slug}>
              <MedicineCard med={med} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
