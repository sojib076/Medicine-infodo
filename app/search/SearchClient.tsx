"use client";
// app/search/SearchClient.tsx
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Pagination from "@mui/material/Pagination";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import NextLink from "next/link";
import MedicationIcon from "@mui/icons-material/Medication";
import AppBreadcrumbs from "@/components/ui/AppBreadcrumbs";
import { tokens } from "@/lib/theme";
import Chip from "@mui/material/Chip";
import type { MedicineIndex } from "@/lib/scraped-data.server";

const PER_PAGE = 8;

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "#FFF59D", borderRadius: 3, padding: "0 2px", fontWeight: 700 }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchClient({ medicines }: { medicines: MedicineIndex[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [page, setPage] = useState(1);

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
    router.replace(val ? `/search?q=${encodeURIComponent(val)}` : "/search", { scroll: false });
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: "15px", md: "25px" }, px: { xs: "10px", md: "20px" } }}>
      <AppBreadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Search" }]} />

      <Box sx={{ position: "sticky", top: { xs: 60, md: 70 }, zIndex: 10, bgcolor: tokens.bg, pt: 1, pb: 2 }}>
        <Typography variant="h4" sx={{ mb: 1.5, fontSize: { xs: 20, md: 28 } }}>Search Medicines</Typography>
        <TextField
          fullWidth
          autoFocus
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
              <Paper
                component={NextLink}
                href={`/medicines/${med.slug}`}
                elevation={0}
                sx={{
                  display: "block", textDecoration: "none",
                  p: { xs: "12px", md: "15px" },
                  borderRadius: tokens.radius,
                  bgcolor: tokens.cardBg,
                  boxShadow: tokens.shadow,
                  transition: "box-shadow 0.2s, transform 0.2s",
                  "&:hover": { boxShadow: tokens.shadowHover, transform: "translateY(-3px)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Box sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: "10px", background: `linear-gradient(135deg, ${tokens.primary}18, ${tokens.accent}22)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {med.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={med.image} alt={med.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <MedicationIcon sx={{ color: tokens.primary, fontSize: 24 }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: { xs: 14, md: 15 }, fontWeight: 700, color: tokens.primary, mb: 0.3 }}>
                      <Highlight text={med.name} query={query} />
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: 12, md: 13 }, mb: 0.6, color: tokens.secondary }}>
                      <Highlight text={med.manufacturer} query={query} />
                    </Typography>
                    <Chip label={med.strength} size="small" sx={{ fontSize: 10, height: 20, bgcolor: "#EEF2FF", color: tokens.accent, fontWeight: 600, "& .MuiChip-label": { px: 0.8 } }} />
                  </Box>
                </Box>
              </Paper>
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
