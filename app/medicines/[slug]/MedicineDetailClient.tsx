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
import Image from "next/image";
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

/**
 * Renders medicine section text that may contain markdown-style bullet lists
 * (`- item`) into proper semantic HTML lists, and wraps plain paragraphs.
 */
function SectionContent({ text, fontSize = 15 }: { text: string; fontSize?: number }) {
  const lines = text.split("\n");

  type Block =
    | { type: "ul"; items: string[] }
    | { type: "ol"; items: string[] }
    | { type: "para"; lines: string[] };

  const blocks: Block[] = [];
  let currentBlock: Block | null = null;

  const flushBlock = () => {
    if (currentBlock) {
      blocks.push(currentBlock);
      currentBlock = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Unordered bullet: "- text" or "• text"
    if (/^[-•]\s+/.test(line)) {
      const item = line.replace(/^[-•]\s+/, "");
      if (currentBlock?.type === "ul") {
        currentBlock.items.push(item);
      } else {
        flushBlock();
        currentBlock = { type: "ul", items: [item] };
      }
      continue;
    }

    // Ordered bullet: "1. text"
    if (/^\d+\.\s+/.test(line)) {
      const item = line.replace(/^\d+\.\s+/, "");
      if (currentBlock?.type === "ol") {
        currentBlock.items.push(item);
      } else {
        flushBlock();
        currentBlock = { type: "ol", items: [item] };
      }
      continue;
    }

    // Empty line → flush current block
    if (line.trim() === "") {
      flushBlock();
      continue;
    }

    // Regular text
    if (currentBlock?.type === "para") {
      currentBlock.lines.push(line);
    } else {
      flushBlock();
      currentBlock = { type: "para", lines: [line] };
    }
  }
  flushBlock();

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "ul") {
          return (
            <Box
              key={i}
              component="ul"
              sx={{
                mb: 1, pl: 3, listStyleType: "disc",
                "& li": { mb: 0.3 },
              }}
            >
              {block.items.map((item, j) => (
                <Typography key={j} component="li" sx={{ fontSize, lineHeight: 1.8, color: tokens.body }}>
                  {item}
                </Typography>
              ))}
            </Box>
          );
        }
        if (block.type === "ol") {
          return (
            <Box
              key={i}
              component="ol"
              sx={{
                mb: 1, pl: 3, listStyleType: "decimal",
                "& li": { mb: 0.3 },
              }}
            >
              {block.items.map((item, j) => (
                <Typography key={j} component="li" sx={{ fontSize, lineHeight: 1.8, color: tokens.body }}>
                  {item}
                </Typography>
              ))}
            </Box>
          );
        }
        // paragraph
        return (
          <Typography key={i} variant="body1" sx={{ fontSize, lineHeight: 1.8, mb: 1.2, color: tokens.body }}>
            {block.lines.join(" ")}
          </Typography>
        );
      })}
    </>
  );
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

  // Derive introduction text from Indications section (first sentence).
  // Split only on ". " followed by an uppercase letter to avoid splitting on
  // decimal numbers (e.g. "0.5 mg") or abbreviations within a sentence.
  // Note: this heuristic may occasionally grab two short sentences when an
  // abbreviation (e.g. "i.v.") is followed by a capital — acceptable for
  // a brief introductory snippet where exactness is not critical.
  const indicationsText = sections["Indications"] ?? sections["Indication"] ?? "";
  const introSentence = indicationsText
    ? indicationsText.split(/\.(?=\s+[A-Z])/)[0].replace(/\.$/, "") + "."
    : null;

  // Build dynamic "learn more" suffix based on available sections
  const learnAboutParts: string[] = [];
  if (sections["Dosage & Administration"] ?? sections["Dosage"]) learnAboutParts.push("dosage");
  if (sections["Side Effects"]) learnAboutParts.push("side effects");
  if (sections["Precautions & Warnings"] ?? sections["Precautions"]) learnAboutParts.push("precautions");
  const learnAboutSuffix = learnAboutParts.length > 0
    ? ` Learn about ${learnAboutParts.join(", ")}, and more below.`
    : "";

  const imageAlt = `${med.name} ${med.strength} – ${med.generic} medicine`;

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
            position: "relative",
            width: { xs: 150, md: 260 }, height: { xs: 150, md: 260 },
            borderRadius: tokens.radius,
            background: "linear-gradient(135deg, #E3F0FF, #F0F7FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: tokens.shadow,
            mx: { xs: "auto", md: 0 },
            overflow: "hidden",
          }}>
            {med.image ? (
              <Image
                src={med.image}
                alt={imageAlt}
                fill
                sizes="(max-width:600px) 150px, 260px"
                style={{ objectFit: "contain" }}
                loading="lazy"
              />
            ) : (
              <MedicationIcon sx={{ fontSize: { xs: 64, md: 100 }, color: tokens.primary, opacity: 0.5 }} aria-hidden="true" />
            )}
          </Box>
        </Grid>

        {/* Info card */}
        <Grid item xs={12} md>
          <Paper elevation={0} sx={{ p: { xs: "16px", md: "24px" }, height: "100%", boxShadow: tokens.shadow, borderRadius: tokens.radius }}>
            {/* H1 includes medicine name + strength for SEO */}
            <Typography variant="h4" component="h1" sx={{ fontSize: { xs: 22, md: 30 }, fontWeight: 800, mb: 0.5, color: tokens.primary }}>
              {med.name} {med.strength}
            </Typography>

            <Typography variant="body2" sx={{ fontSize: { xs: 13, md: 15 }, mb: 1 }}>
              by{" "}
              <Button
                component={NextLink}
                href={`/brands/${manufacturerSlug}`}
                variant="text"
                startIcon={<BusinessIcon sx={{ fontSize: 16 }} />}
                aria-label={`View all medicines by ${med.manufacturer}`}
                sx={{ p: 0, minWidth: 0, fontSize: "inherit", fontWeight: 700, color: tokens.accent, verticalAlign: "baseline", textTransform: "none" }}
              >
                {med.manufacturer}
              </Button>
            </Typography>

            {/* Introduction paragraph with primary keyword */}
            {introSentence && (
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: 13, md: 14 }, color: tokens.secondary, mb: 1.5, lineHeight: 1.7, fontStyle: "italic" }}
              >
                {med.name} {med.strength} ({med.generic}) — {introSentence}{learnAboutSuffix}
              </Typography>
            )}

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
          <Typography variant="h5" component="h2" sx={{ mb: 2, display: { xs: "none", md: "block" } }}>
            Medicine Information
          </Typography>

          <Box sx={{ display: { xs: "none", md: "block" }, mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label={`${med.name} information sections`}
              TabIndicatorProps={{ style: { backgroundColor: tokens.primary, height: 3 } }}
              sx={{ borderBottom: `2px solid ${tokens.border}`, mb: 2 }}
            >
              {sectionKeys.map((t, idx) => (
                <Tab
                  key={t}
                  label={t}
                  icon={iconFor(t) as React.ReactElement}
                  iconPosition="start"
                  id={`medicine-tab-${idx}`}
                  aria-controls={`medicine-tabpanel-${idx}`}
                />
              ))}
            </Tabs>

            <Paper
              elevation={0}
              role="tabpanel"
              id={`medicine-tabpanel-${activeTab}`}
              aria-labelledby={`medicine-tab-${activeTab}`}
              sx={{ p: 3, boxShadow: tokens.shadow, borderRadius: tokens.radius }}
            >
              <Typography variant="h6" component="h2" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                {iconFor(activeSection)} {activeSection}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <SectionContent text={sections[activeSection] ?? ""} />
            </Paper>
          </Box>

          {/* ── Sections – Accordion (mobile) ── */}
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2, fontSize: 18 }}>Medicine Information</Typography>
            {sectionKeys.map((t) => (
              <Accordion
                key={t}
                expanded={expandedAccordion === t}
                onChange={(_, open) => setExpandedAccordion(open ? t : false)}
                elevation={0}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`accordion-content-${t}`}
                  id={`accordion-header-${t}`}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ color: tokens.primary }} aria-hidden="true">{iconFor(t)}</Box>
                    <Typography component="h2" sx={{ fontWeight: 700, color: tokens.primary, fontSize: 15 }}>{t}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails id={`accordion-content-${t}`} aria-labelledby={`accordion-header-${t}`}>
                  <Divider sx={{ mb: 1.5 }} />
                  <SectionContent text={sections[t] ?? ""} fontSize={14} />
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </>
      )}

      {/* ── Related Medicines ── */}
      {related.length > 0 && (
        <Box sx={{ bgcolor: "#F0F5FF", borderRadius: 4, p: { xs: "15px", md: "25px" } }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>Related Medicines</Typography>
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
