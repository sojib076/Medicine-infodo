// components/ui/MedicineBadge.tsx
import Chip from "@mui/material/Chip";
import StarIcon from "@mui/icons-material/Star";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import { tokens } from "@/lib/theme";

interface Props { badge?: "Popular" | "New" | "" }

export default function MedicineBadge({ badge }: Props) {
  if (!badge) return null;
  if (badge === "Popular") {
    return (
      <Chip
        label="Popular"
        size="small"
        icon={<StarIcon sx={{ fontSize: "14px !important", color: "#fff !important" }} />}
        sx={{ bgcolor: tokens.badge, color: "#fff", fontSize: { xs: 10, md: 12 }, fontWeight: 700, height: 22, "& .MuiChip-label": { px: 0.8 } }}
      />
    );
  }
  return (
    <Chip
      label="New"
      size="small"
      icon={<FiberNewIcon sx={{ fontSize: "14px !important", color: "#fff !important" }} />}
      sx={{ bgcolor: "#43A047", color: "#fff", fontSize: { xs: 10, md: 12 }, fontWeight: 700, height: 22, "& .MuiChip-label": { px: 0.8 } }}
    />
  );
}
