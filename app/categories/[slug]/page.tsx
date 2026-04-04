// app/categories/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AppBreadcrumbs from "@/components/ui/AppBreadcrumbs";
import MedicineCard from "@/components/medicine/MedicineCard";
import CategoryFilters from "./CategoryFilters";
import { categories, medicines } from "@/lib/data";
import { tokens } from "@/lib/theme";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = categories.find((c) => c.slug === params.slug);
  if (!cat) return {};
  return { title: `${cat.name} Medicines`, description: `Browse all ${cat.name} medicines in Bangladesh. ${cat.desc}.` };
}

export default function CategoryDetailPage({ params }: Props) {
  const cat = categories.find((c) => c.slug === params.slug);
  if (!cat) notFound();
  const meds = medicines.filter((m) => m.category === params.slug);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: "15px", md: "25px" }, px: { xs: "10px", md: "20px" } }}>
      <AppBreadcrumbs crumbs={[
        { label: "Home", href: "/" },
        { label: "Categories", href: "/categories" },
        { label: cat.name },
      ]} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
        <Typography sx={{ fontSize: { xs: 32, md: 44 } }}>{cat.icon}</Typography>
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: 20, md: 28 } }}>{cat.name}</Typography>
          <Typography variant="body1" sx={{ color: tokens.secondary }}>{cat.desc} — {cat.count} brands available</Typography>
        </Box>
      </Box>

      <CategoryFilters />

      {meds.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" sx={{ color: tokens.secondary }}>No medicines in sample data for this category.</Typography>
          <Typography variant="body2">Full database would show all {cat.count} brands.</Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 1, md: 2 }}>
          {meds.map((m) => (
            <Grid item xs={6} sm={4} md={3} key={m.slug}>
              <MedicineCard med={m} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
