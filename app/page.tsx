// app/page.tsx
import type { Metadata } from "next";
import NextLink from "next/link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import VerifiedIcon from "@mui/icons-material/Verified";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MedicationIcon from "@mui/icons-material/Medication";
import { getMedicinesIndex, getManufacturers } from "@/lib/scraped-data.server";
import { tokens } from "@/lib/theme";
import MedicineCard from "@/components/medicine/MedicineCard";
import HomeSearch from "@/components/home/HomeSearch";

export const metadata: Metadata = {
  title: "MedInfoBD – Bangladesh Medicine Information Database",
  description:
    "Search and explore detailed information on DGDA-approved medicines in Bangladesh. Find brand names, generics, dosage, side effects, and pricing.",
  openGraph: {
    title: "MedInfoBD – Bangladesh Medicine Database",
    description:
      "Bangladesh's most comprehensive online medicine information database. Covers brand names, generics, dosage, side effects, warnings, and pricing.",
    url: "https://medinfo.com.bd",
    siteName: "MedInfoBD",
    locale: "en_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MedInfoBD – Bangladesh Medicine Database",
    description: "Bangladesh's most comprehensive online medicine information database.",
  },
};

const HOW_IT_WORKS = [
  {
    icon: <SearchIcon sx={{ fontSize: 32, color: tokens.primary }} />,
    title: "Search",
    desc: "Type a brand name, generic molecule, or manufacturer in the search bar.",
  },
  {
    icon: <MenuBookIcon sx={{ fontSize: 32, color: tokens.primary }} />,
    title: "Explore",
    desc: "Browse detailed dosage, composition, side effects, and storage information.",
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 32, color: tokens.primary }} />,
    title: "Verify",
    desc: "All data is sourced from DGDA-approved prescribing information.",
  },
];

export default function HomePage() {
  const medicines = getMedicinesIndex();
  const manufacturers = getManufacturers();

  const STATS = [
    { value: `${medicines.length}`, label: "Medicines", icon: "💊" },
    { value: `${manufacturers.length}`, label: "Brands", icon: "🏭" },
    { value: "DGDA", label: "Approved Data", icon: "✅" },
    { value: "Free", label: "No Account Needed", icon: "🔓" },
  ];

  const featured = medicines.slice(0, 8);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${tokens.primary} 0%, #1565C0 60%, #1976D2 100%)`,
          py: { xs: "40px", md: "72px" },
          px: { xs: "16px", md: "24px" },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "rgba(255,255,255,0.15)",
              borderRadius: "20px",
              px: 2,
              py: 0.6,
              mb: 3,
            }}
          >
            <LocalPharmacyIcon sx={{ color: "#fff", fontSize: 16 }} />
            <Typography sx={{ color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: 0.4 }}>
              Bangladesh&apos;s #1 Medicine Information Resource
            </Typography>
          </Box>

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 28, sm: 38, md: 52 },
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.15,
              mb: 2,
              letterSpacing: -1,
            }}
          >
            Find Any Medicine,{" "}
            <Box component="span" sx={{ color: "#90CAF9" }}>
              Instantly
            </Box>
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: 15, md: 18 },
              color: "rgba(255,255,255,0.85)",
              mb: { xs: 3, md: 4 },
              maxWidth: 560,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Detailed dosage, compositions, side effects, and DGDA-approved information
            for medicines available in Bangladesh.
          </Typography>

          <HomeSearch />

          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 12, mt: 2 }}>
            Try: &quot;Napa&quot;, &quot;Paracetamol&quot;, &quot;Beximco&quot;
          </Typography>
        </Container>
      </Box>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: tokens.cardBg, borderBottom: `1px solid ${tokens.border}` }}>
        <Container maxWidth="lg">
          <Grid container>
            {STATS.map((s, i) => (
              <Grid item xs={6} md={3} key={s.label}>
                <Box
                  sx={{
                    textAlign: "center",
                    py: { xs: "16px", md: "22px" },
                    borderRight: i < 3 ? `1px solid ${tokens.border}` : "none",
                  }}
                >
                  <Typography sx={{ fontSize: { xs: 22, md: 28 }, mb: 0.2 }}>{s.icon}</Typography>
                  <Typography
                    sx={{ fontSize: { xs: 18, md: 24 }, fontWeight: 800, color: tokens.primary, lineHeight: 1.1 }}
                  >
                    {s.value}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: 11, md: 13 }, color: tokens.secondary }}>
                    {s.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: "28px", md: "48px" }, px: { xs: "10px", md: "20px" } }}>

        {/* ── Browse Medicines ─────────────────────────────────────── */}
        <Box sx={{ mb: { xs: "32px", md: "52px" } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: { xs: 2, md: 3 } }}>
            <Box>
              <Typography variant="h5" sx={{ mb: 0.4 }}>Browse Medicines</Typography>
              <Typography variant="body2">
                Showing {featured.length} of {medicines.length} medicines
              </Typography>
            </Box>
            <Button
              component={NextLink}
              href="/medicines"
              endIcon={<ArrowForwardIcon />}
              sx={{ color: tokens.accent, fontWeight: 700, fontSize: 14, display: { xs: "none", sm: "flex" } }}
            >
              All medicines
            </Button>
          </Box>

          <Grid container spacing={{ xs: 1, md: 2 }}>
            {featured.map((med) => (
              <Grid item xs={12} sm={6} md={3} key={med.slug}>
                <MedicineCard med={med} />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 2, display: { xs: "block", sm: "none" } }}>
            <Button component={NextLink} href="/medicines" endIcon={<ArrowForwardIcon />} sx={{ color: tokens.accent, fontWeight: 700 }}>
              View all medicines
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: { xs: "32px", md: "52px" } }} />

        {/* ── How It Works ──────────────────────────────────────────── */}
        <Box sx={{ mb: { xs: "32px", md: "52px" } }}>
          <Typography variant="h5" sx={{ mb: 0.5, textAlign: "center" }}>How It Works</Typography>
          <Typography variant="body2" sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
            Three steps to finding the medicine information you need
          </Typography>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {HOW_IT_WORKS.map((step, i) => (
              <Grid item xs={12} md={4} key={step.title}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: "20px", md: "28px" },
                    borderRadius: tokens.radius,
                    bgcolor: tokens.cardBg,
                    boxShadow: tokens.shadow,
                    textAlign: "center",
                    border: `1px solid ${tokens.border}`,
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: `${tokens.primary}12`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: tokens.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography sx={{ color: "#fff", fontSize: 12, fontWeight: 800, lineHeight: 1 }}>
                      {i + 1}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>{step.title}</Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{step.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── CTA Banner ───────────────────────────────────────────── */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${tokens.primary} 0%, #1565C0 100%)`,
            borderRadius: "20px",
            p: { xs: "24px", md: "40px" },
            textAlign: "center",
          }}
        >
          <MedicationIcon sx={{ fontSize: { xs: 40, md: 52 }, color: "rgba(255,255,255,0.8)", mb: 1.5 }} />
          <Typography
            sx={{ fontSize: { xs: 20, md: 28 }, fontWeight: 800, color: "#fff", mb: 1, lineHeight: 1.2 }}
          >
            Start Exploring Medicines
          </Typography>
          <Typography
            sx={{ color: "rgba(255,255,255,0.8)", fontSize: { xs: 14, md: 16 }, mb: 3, maxWidth: 500, mx: "auto" }}
          >
            DGDA-approved medicine information at your fingertips. No account required.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={NextLink}
              href="/medicines"
              variant="contained"
              sx={{
                bgcolor: "#fff",
                color: tokens.primary,
                fontWeight: 800,
                px: 3,
                "&:hover": { bgcolor: "#E3F2FD" },
              }}
            >
              Browse All Medicines
            </Button>
            <Button
              component={NextLink}
              href="/brands"
              variant="outlined"
              sx={{
                borderColor: "rgba(255,255,255,0.6)",
                color: "#fff",
                fontWeight: 700,
                px: 3,
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)", borderColor: "#fff" },
              }}
            >
              View Brands
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
