// app/faq/page.tsx
import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import AppBreadcrumbs from "@/components/ui/AppBreadcrumbs";
import FaqAccordions from "./FaqAccordions";
import { faqs } from "@/lib/data";
import { tokens } from "@/lib/theme";

const BASE_URL = "https://medinfo.com.bd";

export const metadata: Metadata = {
  title: "FAQ – Frequently Asked Questions",
  description: "Get answers to common questions about MedInfoBD, medicine information, pricing, and database updates.",
  alternates: { canonical: `${BASE_URL}/faq` },
};

export default function FaqPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: "15px", md: "25px" }, px: { xs: "10px", md: "20px" } }}>
      <AppBreadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
      <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>Frequently Asked Questions</Typography>
      <Typography variant="body1" sx={{ color: tokens.secondary, mb: 4 }}>
        Everything you need to know about MedInfoBD
      </Typography>
      <FaqAccordions faqs={faqs} />
    </Container>
  );
}
