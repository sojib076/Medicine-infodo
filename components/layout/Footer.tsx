// components/layout/Footer.tsx
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import { tokens } from "@/lib/theme";

const sitemap = [
  { title: "Quick Links", links: [{ label: "All Brands", href: "/brands" }, { label: "Categories", href: "/categories" }, { label: "Search", href: "/search" }, { label: "FAQ", href: "/faq" }] },
  { title: "Categories", links: [{ label: "Analgesic", href: "/categories/analgesic" }, { label: "Antibiotic", href: "/categories/antibiotic" }, { label: "Cardiac", href: "/categories/cardiac" }, { label: "Diabetic", href: "/categories/diabetic" }] },
  { title: "Contact", links: [{ label: "support@medinfo.com.bd", href: "mailto:support@medinfo.com.bd" }, { label: "+880 1700-000000", href: "tel:+8801700000000" }] },
];

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: tokens.cardBg, borderTop: `1px solid ${tokens.border}`, pt: { xs: "15px", md: "25px" }, pb: { xs: "15px", md: "20px" }, mt: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} md={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.5 }}>
              <Box sx={{ width: 32, height: 32, bgcolor: tokens.primary, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LocalPharmacyIcon sx={{ color: "#fff", fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 17, color: tokens.primary }}>MedInfo<span style={{ color: tokens.accent, fontWeight: 400 }}>BD</span></Typography>
            </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 1.5 }}>
              Bangladesh's trusted medicine information database. Powered by DGDA-approved data.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {["🌐", "📘", "🐦"].map((icon, i) => (
                <Box key={i} sx={{ width: 32, height: 32, bgcolor: "#E8F0FE", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { bgcolor: "#C5D8FF" }, fontSize: 16 }}>{icon}</Box>
              ))}
            </Box>
          </Grid>

          {/* Sitemap */}
          {sitemap.map((section) => (
            <Grid item xs={6} md={2} key={section.title}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, md: 14 }, color: tokens.primary, mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>{section.title}</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                {section.links.map((l) => (
                  <Link key={l.label} component={NextLink} href={l.href} underline="hover" sx={{ fontSize: { xs: 12, md: 14 }, color: tokens.secondary, "&:hover": { color: tokens.primary } }}>{l.label}</Link>
                ))}
              </Box>
            </Grid>
          ))}

          {/* Disclaimer */}
          <Grid item xs={12} md={3}>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: tokens.primary, mb: 1, textTransform: "uppercase", letterSpacing: 0.8 }}>Disclaimer</Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: 11, md: 12 }, lineHeight: 1.7, color: tokens.secondary }}>
              MedInfoBD provides drug information for educational purposes only. Always consult a licensed physician or pharmacist before taking any medication. This site does not sell medicines.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Typography variant="body2" sx={{ fontSize: { xs: 11, md: 13 } }}>© {new Date().getFullYear()} MedInfoBD. All rights reserved.</Typography>
          <Typography variant="body2" sx={{ fontSize: { xs: 11, md: 13 } }}>Data sourced from DGDA Bangladesh</Typography>
        </Box>
      </Container>
    </Box>
  );
}
