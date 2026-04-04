// app/categories/page.tsx
import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import AppBreadcrumbs from "@/components/ui/AppBreadcrumbs";
import CategoryCard from "./CategoryCard";
import { categories } from "@/lib/data";
import { tokens } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Medicine Categories",
  description: "Browse all medicine categories available in Bangladesh's DGDA-approved database.",
};

export default function CategoriesPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: "15px", md: "25px" }, px: { xs: "10px", md: "20px" } }}>
      <AppBreadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Categories" }]} />
      <Typography variant="h4" sx={{ mb: 0.5 }}>Medicine Categories</Typography>
      <Typography variant="body1" sx={{ color: tokens.secondary, mb: 3 }}>
        Browse medicines by therapeutic category
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
