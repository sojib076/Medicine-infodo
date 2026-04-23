// app/categories/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NextLink from "next/link";
import AppBreadcrumbs from "@/components/ui/AppBreadcrumbs";
import MedicineCard from "@/components/medicine/MedicineCard";
import { getMedicinesByCategory } from "@/lib/scraped-data.server";
import { categories } from "@/lib/data";
import { tokens } from "@/lib/theme";

const BASE_URL = "https://medinfo.com.bd";

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = categories.find((c) => c.slug === params.slug);
  if (!cat) return {};
  const title = `${cat.name} Medicines in Bangladesh – MedInfoBD`;
  const description = `Browse DGDA-approved ${cat.name.toLowerCase()} medicines available in Bangladesh. ${cat.desc}.`;
  return {
    title,
    description,
    openGraph: { title, description, url: `${BASE_URL}/categories/${cat.slug}`, siteName: "MedInfoBD", type: "website" },
    twitter: { card: "summary", title, description },
    alternates: { canonical: `${BASE_URL}/categories/${cat.slug}` },
  };
}

export default function CategoryDetailPage({ params }: Props) {
  const cat = categories.find((c) => c.slug === params.slug);
  if (!cat) notFound();

  const medicines = getMedicinesByCategory(params.slug);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: "15px", md: "25px" }, px: { xs: "10px", md: "20px" } }}>
      <AppBreadcrumbs crumbs={[
        { label: "Home", href: "/" },
        { label: "Categories", href: "/categories" },
        { label: cat.name },
      ]} />

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Typography sx={{ fontSize: { xs: 36, md: 48 }, lineHeight: 1 }}>{cat.icon}</Typography>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 0.3 }}>{cat.name}</Typography>
          <Typography variant="body1" sx={{ color: tokens.secondary }}>{cat.desc}</Typography>
        </Box>
      </Box>

      <Typography variant="body2" sx={{ color: tokens.secondary, mb: 4 }}>
        {medicines.length > 0
          ? `${medicines.length} medicine${medicines.length !== 1 ? "s" : ""} found in this category`
          : "No medicines indexed yet for this category"}
      </Typography>

      {medicines.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" sx={{ color: tokens.secondary, mb: 2 }}>
            No medicines found for this category yet.
          </Typography>
          <Button component={NextLink} href="/categories" startIcon={<ArrowBackIcon />} variant="outlined">
            Back to Categories
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
