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
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "MedInfoBD",
        description: "Bangladesh's largest online medicine information database.",
        inLanguage: "en-BD",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "MedInfoBD",
        url: BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: "support@medinfo.com.bd",
          contactType: "customer support",
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* Font preconnect for performance – avoids render-blocking DNS */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeRegistry>
          <Header />
          <main style={{ minHeight: "80vh" }}>{children}</main>
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  );
}
