"use client";
// app/medicines/[slug]/MedicineDetailClient.tsx

import React, { useState } from "react";
import NextLink from "next/link";
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MedicationIcon from "@mui/icons-material/Medication";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArticleIcon from "@mui/icons-material/Article";
import BusinessIcon from "@mui/icons-material/Business";
import AppBreadcrumbs from "@/components/ui/AppBreadcrumbs";
import MedicineCard from "@/components/medicine/MedicineCard";
import type { MedicineIndex } from "@/lib/scraped-data.server";
import { tokens } from "@/lib/theme";

const SECTION_ICONS: Record<string, React.ReactNode> = {
  Composition:           <ScienceIcon sx={{ fontSize: 18 }} />,
  Indications:           <LocalHospitalIcon sx={{ fontSize: 18 }} />,
  "Dosage & Administration": <MonitorHeartIcon sx={{ fontSize: 18 }} />,
  "Side Effects":        <WarningAmberIcon sx={{ fontSize: 18 }} />,
  "Precautions & Warnings": <InfoOutlinedIcon sx={{ fontSize: 18 }} />,
  "Storage Conditions":  <AcUnitIcon sx={{ fontSize: 18 }} />,
};

function iconFor(section: string): React.ReactNode {
  return SECTION_ICONS[section] ?? <ArticleIcon sx={{ fontSize: 18 }} />;
}

interface Props {
  med: MedicineIndex;
  related: MedicineIndex[];
  sections: Record<string, string>;
  manufacturerSlug: string;
}

export default function MedicineDetailClient({ med, related, sections, manufacturerSlug }: Props) {
  const sectionKeys = Object.keys(sections);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  const activeSection = sectionKeys[activeTab] ?? "";

  return (
    <Container maxWidth="lg" sx={{ py: { xs: "15px", md: "25px" }, px: { xs: "10px", md: "20px" } }}>
      {/* Breadcrumbs */}
      <AppBreadcrumbs crumbs={[
        { label: "Home",      href: "/" },
        { label: "Medicines", href: "/medicines" },
        { label: med.name },
      ]} />

      {/* ── Hero ── */}
      <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mb: 4 }}>
        {/* Image / icon */}
        <Grid item xs={12} md="auto">
          <Box sx={{
            width: { xs: 150, md: 260 }, height: { xs: 150, md: 260 },
            borderRadius: tokens.radius,
            background: "linear-gradient(135deg, #E3F0FF, #F0F7FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: tokens.shadow,
            mx: { xs: "auto", md: 0 },
            overflow: "hidden",
          }}>
            {med.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={med.image}
                alt={med.name}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <MedicationIcon sx={{ fontSize: { xs: 64, md: 100 }, color: tokens.primary, opacity: 0.5 }} />
            )}
          </Box>
        </Grid>

        {/* Info card */}
        <Grid item xs={12} md>
          <Paper elevation={0} sx={{ p: { xs: "16px", md: "24px" }, height: "100%", boxShadow: tokens.shadow, borderRadius: tokens.radius }}>
            <Typography variant="h4" component="h1" sx={{ fontSize: { xs: 22, md: 30 }, fontWeight: 800, mb: 0.5, color: tokens.primary }}>
              {med.name}
            </Typography>

            <Typography variant="body2" sx={{ fontSize: { xs: 13, md: 15 }, mb: 1 }}>
              by{" "}
              <Button
                component={NextLink}
                href={`/brands/${manufacturerSlug}`}
                variant="text"
                startIcon={<BusinessIcon sx={{ fontSize: 16 }} />}
                sx={{ p: 0, minWidth: 0, fontSize: "inherit", fontWeight: 700, color: tokens.accent, verticalAlign: "baseline", textTransform: "none" }}
              >
                {med.manufacturer}
              </Button>
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {[
                ["Generic Name", med.generic || "—"],
                ["Strength",     med.strength],
              ].map(([label, value]) => (
                <Grid item xs={6} key={label}>
                  <Typography sx={{ fontSize: 10, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, mb: 0.3 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: { xs: 13, md: 15 }, color: tokens.body, fontWeight: 500, lineHeight: 1.4 }}>
                    {value}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Strength chip */}
            <Chip
              label={med.strength}
              size="small"
              sx={{ bgcolor: "#EEF2FF", color: tokens.accent, fontWeight: 700, mr: 1, mb: 1 }}
            />
            {med.generic && (
              <Chip
                label={med.generic}
                size="small"
                sx={{ bgcolor: "#F0FFF4", color: "#2E7D32", fontWeight: 700, mb: 1 }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ── Sections – Tabs (desktop) ── */}
      {sectionKeys.length > 0 && (
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
              {sectionKeys.map((t) => (
                <Tab key={t} label={t} icon={iconFor(t) as React.ReactElement} iconPosition="start" />
              ))}
            </Tabs>

            <Paper elevation={0} sx={{ p: 3, boxShadow: tokens.shadow, borderRadius: tokens.radius }}>
              <Typography variant="h6" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                {iconFor(activeSection)} {activeSection}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {sections[activeSection]}
              </Typography>
            </Paper>
          </Box>

          {/* ── Sections – Accordion (mobile) ── */}
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontSize: 18 }}>Medicine Information</Typography>
            {sectionKeys.map((t) => (
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
                  <Typography variant="body1" sx={{ fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                    {sections[t]}
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
