"use client";
// components/home/HomeSearch.tsx
// Hero search bar on the landing page – navigates to /search on submit.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

export default function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    else router.push("/search");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        gap: { xs: 1, sm: 1.5 },
        maxWidth: 600,
        mx: "auto",
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <TextField
        fullWidth
        autoComplete="off"
        placeholder="Search by brand name, generic, or manufacturer…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#90CAF9", fontSize: 22 }} />
            </InputAdornment>
          ),
          sx: {
            height: 52,
            bgcolor: "rgba(255,255,255,0.95)",
            borderRadius: "10px",
            fontSize: { xs: 14, md: 16 },
            "& fieldset": { border: "none" },
          },
        }}
      />
      <Button
        type="submit"
        variant="contained"
        sx={{
          height: 52,
          px: { xs: 3, sm: 4 },
          bgcolor: "#FFB300",
          color: "#1A1A1A",
          fontWeight: 800,
          fontSize: 15,
          flexShrink: 0,
          borderRadius: "10px",
          "&:hover": { bgcolor: "#FFA000" },
        }}
      >
        Search
      </Button>
    </Box>
  );
}
