// app/brands/page.tsx
import type { Metadata } from "next";
import NextLink from "next/link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import BusinessIcon from "@mui/icons-material/Business";
import AppBreadcrumbs from "@/components/ui/AppBreadcrumbs";
import { getManufacturers } from "@/lib/scraped-data.server";
import { tokens } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Medicine Brands – MedInfoBD",
  description: "Browse all pharmaceutical manufacturers and brands in Bangladesh. Click a brand to see all its medicines.",
};

export default function BrandsPage() {
  const manufacturers = getManufacturers();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: "15px", md: "25px" }, px: { xs: "10px", md: "20px" } }}>
      <AppBreadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Brands" }]} />

      <Typography variant="h4" sx={{ mb: 0.5 }}>Medicine Brands</Typography>
      <Typography variant="body1" sx={{ color: tokens.secondary, mb: 4 }}>
        {manufacturers.length} pharmaceutical companies — click a brand to see all its medicines.
      </Typography>

      <Grid container spacing={{ xs: 1.5, md: 2 }}>
        {manufacturers.map((mfr) => (
          <Grid item xs={12} sm={6} md={4} key={mfr.slug}>
            <Paper
              component={NextLink}
              href={`/brands/${mfr.slug}`}
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                textDecoration: "none",
                p: { xs: "14px", md: "18px" },
                borderRadius: tokens.radius,
                bgcolor: tokens.cardBg,
                boxShadow: tokens.shadow,
                border: `1px solid ${tokens.border}`,
                transition: "box-shadow 0.2s, transform 0.2s",
                "&:hover": { boxShadow: tokens.shadowHover, transform: "translateY(-2px)" },
              }}
            >
              <Box sx={{
                width: 44, height: 44, flexShrink: 0, borderRadius: "10px",
                background: `linear-gradient(135deg, ${tokens.primary}18, ${tokens.accent}22)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <BusinessIcon sx={{ color: tokens.primary, fontSize: 22 }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, md: 14 }, color: tokens.primary, lineHeight: 1.3, mb: 0.3 }}>
                  {mfr.name}
                </Typography>
                <Chip
                  label={`${mfr.count} medicine${mfr.count !== 1 ? "s" : ""}`}
                  size="small"
                  sx={{ fontSize: 11, height: 20, bgcolor: "#EEF2FF", color: tokens.accent, fontWeight: 600, "& .MuiChip-label": { px: 0.8 } }}
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
