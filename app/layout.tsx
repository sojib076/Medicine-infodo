// app/layout.tsx
import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const BASE_URL = "https://medinfo.com.bd";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: "MedInfoBD – Bangladesh Medicine Database", template: "%s | MedInfoBD" },
  description:
    "Search Bangladesh's largest online medicine database. Find brand names, generics, dosage, side effects, warnings, and DGDA-approved pricing.",
  keywords: [
    "medicine bangladesh",
    "drug information bd",
    "DGDA approved medicines",
    "generic medicine",
    "medicine price bangladesh",
    "pharma bd",
  ],
  authors: [{ name: "MedInfoBD", url: BASE_URL }],
  openGraph: {
    title: "MedInfoBD – Bangladesh Medicine Database",
    description:
      "Search Bangladesh's largest online medicine database covering brand names, generics, dosage, side effects, and pricing.",
    url: BASE_URL,
    siteName: "MedInfoBD",
    locale: "en_BD",
    type: "website",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "MedInfoBD – Bangladesh Medicine Database",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MedInfoBD – Bangladesh Medicine Database",
    description:
      "Bangladesh's most comprehensive online medicine information database.",
    images: [`${BASE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <Header />
          <main style={{ minHeight: "80vh" }}>{children}</main>
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  );
}
