"use client";
// app/search/SearchClient.tsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Pagination from "@mui/material/Pagination";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import AppBreadcrumbs from "@/components/ui/AppBreadcrumbs";
import MedicineCard from "@/components/medicine/MedicineCard";
import { tokens } from "@/lib/theme";
import type { MedicineIndex } from "@/lib/scraped-data.server";

const PER_PAGE = 8;

export default function SearchClient({ medicines }: { medicines: MedicineIndex[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return medicines;
    return medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.generic.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q)
    );
  }, [query, medicines]);

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const paginated = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.replace(val ? `/search?q=${encodeURIComponent(val)}` : "/search", { scroll: false });
    }, 350);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: "15px", md: "25px" }, px: { xs: "10px", md: "20px" } }}>
      <AppBreadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Search" }]} />

      <Box sx={{ position: "sticky", top: { xs: 60, md: 70 }, zIndex: 10, bgcolor: tokens.bg, pt: 1, pb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1.5, fontSize: { xs: 20, md: 28 } }}>Search Medicines</Typography>
        <TextField
          fullWidth
          autoFocus
          label="Search medicines"
          placeholder="Search by brand name, generic, manufacturer…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: tokens.secondary }} /></InputAdornment>,
            sx: { height: 52, fontSize: { xs: 14, md: 16 }, maxWidth: 600 },
          }}
          sx={{ maxWidth: 600 }}
        />
        {query && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>{results.length}</strong> result{results.length !== 1 ? "s" : ""} for &quot;<strong>{query}</strong>&quot;
          </Typography>
        )}
      </Box>

      {paginated.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" sx={{ color: tokens.secondary }}>No results found</Typography>
          <Typography variant="body2">Try a different search term.</Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 1, md: 2 }} sx={{ mb: 4 }}>
          {paginated.map((med) => (
            <Grid item xs={12} sm={6} md={3} key={med.slug}>
              <MedicineCard med={med} highlightQuery={query} />
            </Grid>
          ))}
        </Grid>
      )}

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
