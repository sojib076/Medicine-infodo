"use client";
// app/brands/page.tsx

import React, { useState, useMemo } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import AppBreadcrumbs from "@/components/ui/AppBreadcrumbs";
import MedicineCard from "@/components/medicine/MedicineCard";
import { medicines } from "@/lib/data";
import { tokens } from "@/lib/theme";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PER_PAGE = 8;

export default function AllBrandsPage() {
  const [activeLetter, setActiveLetter] = useState("A");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (search.trim().length >= 1) {
      return medicines.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.generic.toLowerCase().includes(search.toLowerCase())
      );
    }
    return medicines.filter((m) => m.name.toUpperCase().startsWith(activeLetter));
  }, [search, activeLetter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleLetterClick = (letter: string) => {
    setActiveLetter(letter);
    setSearch("");
    setPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: "15px", md: "25px" }, px: { xs: "10px", md: "20px" } }}>
      <AppBreadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "All Brands" }]} />

      <Typography variant="h4" sx={{ mb: 0.5 }}>All Brands</Typography>
      <Typography variant="body1" sx={{ color: tokens.secondary, mb: 3 }}>
        Explore medicines registered in Bangladesh
      </Typography>

      {/* Search */}
      <Box sx={{ mb: 3, maxWidth: 480 }}>
        <TextField
          fullWidth
          placeholder="Search medicine by name or generic"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: tokens.secondary }} /></InputAdornment>,
            sx: { height: 48, fontSize: { xs: 14, md: 16 } },
          }}
        />
      </Box>

      {/* Alphabet filter */}
      <Box sx={{ display: "flex", flexWrap: "wrap", mb: 3, gap: 0 }}>
        {ALPHABET.map((letter) => {
          const isActive = activeLetter === letter && !search;
          const hasItems = medicines.some((m) => m.name.toUpperCase().startsWith(letter));
          return (
            <Button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              disabled={!hasItems}
              size="small"
              variant={isActive ? "contained" : "outlined"}
              sx={{
                minWidth: 38, height: 36, m: "3px", p: 0, fontSize: 13, fontWeight: 700,
                ...(isActive
                  ? { bgcolor: tokens.primary, color: "#fff", "&:hover": { bgcolor: "#0a3a82" } }
                  : { color: tokens.accent, borderColor: tokens.accent, bgcolor: "#fff" }),
                "&.Mui-disabled": { opacity: 0.35 },
              }}
            >
              {letter}
            </Button>
          );
        })}
      </Box>

      {/* Results count */}
      <Typography variant="body2" sx={{ mb: 2, color: tokens.secondary }}>
        {filtered.length} result{filtered.length !== 1 ? "s" : ""}{search ? ` for "${search}"` : ` for letter "${activeLetter}"`}
      </Typography>

      {/* Grid */}
      {paginated.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8, color: tokens.secondary }}>
          <Typography variant="h6" sx={{ color: tokens.secondary }}>No medicines found</Typography>
          <Typography variant="body2">Try a different letter or search term.</Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 1, md: 2 }} sx={{ mb: 4 }}>
          {paginated.map((med) => (
            <Grid item xs={12} sm={6} md={3} key={med.slug}>
              <MedicineCard med={med} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Container>
  );
}
