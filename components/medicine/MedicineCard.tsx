// components/medicine/MedicineCard.tsx
import NextLink from "next/link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import MedicationIcon from "@mui/icons-material/Medication";
import { tokens } from "@/lib/theme";
import type { MedicineIndex } from "@/lib/scraped-data.server";

export default function MedicineCard({ med }: { med: MedicineIndex }) {
  return (
    <Paper
      component={NextLink}
      href={`/medicines/${med.slug}`}
      elevation={0}
      sx={{
        display: "block",
        textDecoration: "none",
        p: { xs: "12px", md: "15px" },
        borderRadius: tokens.radius,
        bgcolor: tokens.cardBg,
        boxShadow: tokens.shadow,
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "pointer",
        "&:hover": {
          boxShadow: tokens.shadowHover,
          transform: "translateY(-3px)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        {/* Icon */}
        <Box sx={{
          width: 52, height: 52, flexShrink: 0, borderRadius: "10px",
          background: `linear-gradient(135deg, ${tokens.primary}18, ${tokens.accent}22)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {med.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={med.image} alt={med.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <MedicationIcon sx={{ color: tokens.primary, fontSize: 26 }} />
          )}
        </Box>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: { xs: 14, md: 15 }, fontWeight: 700, color: tokens.primary, lineHeight: 1.3, mb: 0.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {med.name}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: { xs: 11, md: 12 }, mb: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: tokens.secondary }}>
            {med.manufacturer}
          </Typography>
          <Chip
            label={med.strength}
            size="small"
            sx={{ fontSize: { xs: 10, md: 11 }, height: 20, bgcolor: "#EEF2FF", color: tokens.accent, fontWeight: 600, "& .MuiChip-label": { px: 0.8 } }}
          />
        </Box>
      </Box>
    </Paper>
  );
}
