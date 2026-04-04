"use client";
// app/brands/[slug]/BrandDetailClient.tsx

import React, { useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MedicationIcon from "@mui/icons-material/Medication";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArticleIcon from "@mui/icons-material/Article";
import AppBreadcrumbs from "@/components/ui/AppBreadcrumbs";
import MedicineBadge from "@/components/ui/MedicineBadge";
import MedicineCard from "@/components/medicine/MedicineCard";
import type { Medicine } from "@/lib/data";
import { tokens } from "@/lib/theme";

// Known section → icon mapping; unknown sections fall back to ArticleIcon
const SECTION_ICONS: Record<string, React.ReactNode> = {
  Composition:      <ScienceIcon sx={{ fontSize: 18 }} />,
  Indications:      <LocalHospitalIcon sx={{ fontSize: 18 }} />,
  Dosage:           <MonitorHeartIcon sx={{ fontSize: 18 }} />,
  "Side Effects":   <WarningAmberIcon sx={{ fontSize: 18 }} />,
  Warnings:         <InfoOutlinedIcon sx={{ fontSize: 18 }} />,
  Storage:          <AcUnitIcon sx={{ fontSize: 18 }} />,
};

function iconFor(section: string): React.ReactNode {
  return SECTION_ICONS[section] ?? <ArticleIcon sx={{ fontSize: 18 }} />;
}

interface Props {
  med: Medicine;
  related: Medicine[];
  tabContent: Record<string, string>;
}

export default function BrandDetailClient({ med, related, tabContent }: Props) {
  // Derive tab list dynamically from whatever sections are present
  const sections = Object.keys(tabContent);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  const infoRows: [string, string][] = [
    ["Generic Name", med.generic],
    ["Strength",     med.strength],
    ["Form",         med.form],
    ["Pack Size",    med.pack],
    ["Category",     med.category.charAt(0).toUpperCase() + med.category.slice(1)],
    ["Price",        med.price],
  ];

  const activeSection = sections[activeTab] ?? "";

  return (
    <Container maxWidth="lg" sx={{ py: { xs: "15px", md: "25px" }, px: { xs: "10px", md: "20px" } }}>
      {/* Breadcrumbs */}
      <AppBreadcrumbs crumbs={[
        { label: "Home",       href: "/" },
        { label: "All Brands", href: "/brands" },
        { label: med.name },
      ]} />

      {/* ── Hero Section ── */}
      <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mb: 4 }}>
        {/* Placeholder image / icon */}
        <Grid item xs={12} md="auto">
          <Box sx={{
            width: { xs: 150, md: 300 }, height: { xs: 150, md: 300 },
            borderRadius: tokens.radius,
            background: "linear-gradient(135deg, #E3F0FF, #F0F7FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: tokens.shadow,
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
            mx: { xs: "auto", md: 0 },
          }}>
            <MedicationIcon sx={{ fontSize: { xs: 64, md: 100 }, color: tokens.primary, opacity: 0.6 }} />
          </Box>
        </Grid>

        {/* Info Card */}
        <Grid item xs={12} md>
          <Paper elevation={0} sx={{ p: { xs: "15px", md: "24px" }, height: "100%" }}>
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <MedicineBadge badge={med.badge} />
            </Box>

            <Typography variant="h4" component="h1" sx={{ fontSize: { xs: 20, md: 28 }, mb: "6px" }}>
              {med.name}
            </Typography>

            <Typography variant="body2" sx={{ fontSize: { xs: 12, md: 14 }, mb: "8px" }}>
              by <strong>{med.manufacturer}</strong>
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {infoRows.map(([label, value]) => (
                <Grid item xs={6} sm={4} key={label}>
                  <Typography sx={{ fontSize: 10, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, mb: 0.3 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: { xs: 13, md: 15 }, color: tokens.body, fontWeight: 500, lineHeight: 1.4 }}>
                    {value}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button variant="contained" startIcon={<LocalHospitalIcon />} sx={{ minHeight: 44 }}>
                View Full Details
              </Button>
              <Button variant="outlined" startIcon={<BookmarkBorderIcon />} sx={{ minHeight: 44 }}>
                Save
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Tabs (Desktop) ── */}
      {sections.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mb: 2, display: { xs: "none", md: "block" } }}>
            Medicine Information
          </Typography>

          <Box sx={{ display: { xs: "none", md: "block" }, mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              TabIndicatorProps={{ style: { backgroundColor: tokens.primary, height: 3 } }}
              sx={{ borderBottom: `2px solid ${tokens.border}`, mb: 2 }}
            >
              {sections.map((t) => (
                <Tab key={t} label={t} icon={iconFor(t) as React.ReactElement} iconPosition="start" />
              ))}
            </Tabs>

            <Paper elevation={0} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                {iconFor(activeSection)} {activeSection}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {tabContent[activeSection]}
              </Typography>
            </Paper>
          </Box>

          {/* ── Accordion (Mobile) ── */}
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontSize: 18 }}>Medicine Information</Typography>
            {sections.map((t) => (
              <Accordion
                key={t}
                expanded={expandedAccordion === t}
                onChange={(_, open) => setExpandedAccordion(open ? t : false)}
                elevation={0}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ color: tokens.primary }}>{iconFor(t)}</Box>
                    <Typography sx={{ fontWeight: 700, color: tokens.primary, fontSize: 15 }}>{t}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography variant="body1" sx={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {tabContent[t]}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </>
      )}

      {/* ── Related Medicines ── */}
      {related.length > 0 && (
        <Box sx={{ bgcolor: "#F0F5FF", borderRadius: 4, p: { xs: "15px", md: "25px" } }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Related Medicines</Typography>
          <Grid container spacing={{ xs: 1, md: 2 }}>
            {related.map((m) => (
              <Grid item xs={6} md={3} key={m.slug}>
                <MedicineCard med={m} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}
