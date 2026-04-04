"use client";
// app/faq/FaqAccordions.tsx
import { useState } from "react";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Script from "next/script";
import { tokens } from "@/lib/theme";

interface Faq { q: string; a: string }

export default function FaqAccordions({ faqs }: { faqs: Faq[] }) {
  const [expanded, setExpanded] = useState<number | false>(0);

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      {/* SEO schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <Box sx={{ maxWidth: 780 }}>
        {faqs.map((faq, i) => (
          <Accordion
            key={i}
            expanded={expanded === i}
            onChange={(_, open) => setExpanded(open ? i : false)}
            elevation={0}
            sx={{ mb: "12px" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: tokens.primary }} />}
              sx={{ py: 0.5, "& .MuiAccordionSummary-content": { my: 1.5 } }}
            >
              <Typography sx={{
                fontSize: { xs: "14px", md: "16px" },
                fontWeight: 700,
                color: tokens.primary,
                lineHeight: 1.4,
                pr: 2,
              }}>
                {faq.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Divider sx={{ mb: 1.5 }} />
              <Typography sx={{
                fontSize: { xs: "12px", md: "14px" },
                color: tokens.body,
                lineHeight: 1.7,
              }}>
                {faq.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </>
  );
}
