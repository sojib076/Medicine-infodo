"use client";
// app/categories/[slug]/CategoryFilters.tsx
import { useState } from "react";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import { tokens } from "@/lib/theme";

const SORT_OPTIONS = ["A-Z", "Popular", "New"];

export default function CategoryFilters() {
  const [manufacturer, setManufacturer] = useState("all");
  const [strength, setStrength] = useState("all");
  const [sortBy, setSortBy] = useState("A-Z");

  return (
    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", my: 3 }}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Manufacturer</InputLabel>
        <Select value={manufacturer} label="Manufacturer" onChange={(e) => setManufacturer(e.target.value)}>
          <MenuItem value="all">All Manufacturers</MenuItem>
          <MenuItem value="beximco">Beximco Pharma</MenuItem>
          <MenuItem value="square">Square Pharma</MenuItem>
          <MenuItem value="incepta">Incepta Pharma</MenuItem>
          <MenuItem value="aci">ACI Limited</MenuItem>
          <MenuItem value="renata">Renata Limited</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Strength</InputLabel>
        <Select value={strength} label="Strength" onChange={(e) => setStrength(e.target.value)}>
          <MenuItem value="all">All Strengths</MenuItem>
          <MenuItem value="250mg">250mg</MenuItem>
          <MenuItem value="500mg">500mg</MenuItem>
          <MenuItem value="1000mg">1000mg</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ ml: { sm: "auto" }, display: "flex", gap: 0.8 }}>
        {SORT_OPTIONS.map((s) => (
          <Button
            key={s}
            size="small"
            variant={sortBy === s ? "contained" : "outlined"}
            onClick={() => setSortBy(s)}
            sx={{
              minHeight: 36, fontSize: 13, fontWeight: 700,
              ...(sortBy === s ? { bgcolor: tokens.primary } : { color: tokens.accent, borderColor: tokens.accent }),
            }}
          >
            {s}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
