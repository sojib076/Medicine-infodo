// app/layout.tsx
import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: { default: "MedInfoBD – Bangladesh Medicine Database", template: "%s | MedInfoBD" },
  description: "Search Bangladesh's largest online medicine database. Find brand names, generics, dosage, side effects, warnings, and pricing.",
  keywords: ["medicine bangladesh", "drug information bd", "DGDA approved medicines", "generic medicine"],
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
