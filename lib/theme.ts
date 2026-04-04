
import { createTheme } from "@mui/material/styles";
import { DM_Sans } from "next/font/google";

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// ── Design Tokens ──────────────────────────────────────────────────────────
export const tokens = {
  primary: "#0D47A1",
  secondary: "#555555",
  body: "#1A1A1A",
  accent: "#1976D2",
  bg: "#FFFFFF",
  cardBg: "#F9F9F9",
  badge: "#FFB300",
  border: "#E0E0E0",
  shadow: "0 1px 4px rgba(0,0,0,0.10)",
  shadowHover: "0 6px 24px rgba(13,71,161,0.13)",
  radius: "12px",
} as const;

// ── MUI Theme ──────────────────────────────────────────────────────────────

