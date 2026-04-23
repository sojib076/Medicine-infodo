"use client";
// app/categories/CategoryCard.tsx
import NextLink from "next/link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { tokens } from "@/lib/theme";
import type { Category } from "@/lib/data";

export default function CategoryCard({ cat }: { cat: Category }) {
  return (
    <Paper
      component={NextLink}
      href={`/categories/${cat.slug}`}
      elevation={0}
      sx={{
        display: "block", textDecoration: "none",
        p: { xs: "15px", md: "20px" },
        borderRadius: tokens.radius,
        bgcolor: tokens.cardBg,
        boxShadow: tokens.shadow,
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "pointer",
        "&:hover": {
          boxShadow: tokens.shadowHover,
          transform: "translateY(-4px)",
        },
      }}
    >
      <Typography sx={{ fontSize: { xs: 28, md: 34 }, mb: 1, lineHeight: 1 }}>{cat.icon}</Typography>
      <Typography sx={{ fontSize: { xs: 14, md: 16 }, fontWeight: 700, color: tokens.primary, mb: 0.5 }}>{cat.name}</Typography>
      <Typography variant="body2" sx={{ fontSize: { xs: 12, md: 13 }, lineHeight: 1.5, mb: 1 }}>{cat.desc}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ fontSize: { xs: 11, md: 12 }, color: tokens.accent, fontWeight: 700 }}>{cat.count} brands</Typography>
        <ArrowForwardIcon sx={{ fontSize: 13, color: tokens.accent }} />
      </Box>
    </Paper>
  );
}
