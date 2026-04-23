// app/categories/page.tsx
import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import AppBreadcrumbs from "@/components/ui/AppBreadcrumbs";
import CategoryCard from "./CategoryCard";
import { categories } from "@/lib/data";
import { tokens } from "@/lib/theme";

const BASE_URL = "https://medinfo.com.bd";

export const metadata: Metadata = {
  title: "Medicine Categories – MedInfoBD",
  description:
    "Browse medicines by therapeutic category in Bangladesh. Find analgesics, antibiotics, cardiac, diabetic, and more DGDA-approved medicine groups.",
  alternates: { canonical: `${BASE_URL}/categories` },
};

export default function CategoriesPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: "15px", md: "25px" }, px: { xs: "10px", md: "20px" } }}>
      <AppBreadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Categories" }]} />

      <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>Medicine Categories</Typography>
      <Typography variant="body1" sx={{ color: tokens.secondary, mb: 4 }}>
        Browse {categories.length} therapeutic categories of medicines available in Bangladesh
      </Typography>

      <Grid container spacing={{ xs: 1.5, md: 2 }}>
        {categories.map((cat) => (
          <Grid item xs={6} sm={4} md={3} key={cat.slug}>
            <CategoryCard cat={cat} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
