"use client";
// components/layout/Header.tsx

import React, { useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import { tokens } from "@/lib/theme";

const navItems = [
  { label: "Medicines", href: "/medicines" },
  { label: "Brands",    href: "/brands" },
  { label: "Search",    href: "/search" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ height: { xs: 60, md: 70 }, gap: 2, px: { xs: "10px", md: "20px" } }}>
          {/* Logo */}
          <NextLink href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <Box sx={{ width: 36, height: 36, bgcolor: tokens.primary, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LocalPharmacyIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: { xs: 17, md: 20 }, fontWeight: 800, color: tokens.primary, letterSpacing: -0.5, lineHeight: 1 }}>
              MedInfo<span style={{ color: tokens.accent, fontWeight: 400 }}>BD</span>
            </Typography>
          </NextLink>

          {/* Search – hidden on xs */}
          <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, maxWidth: 440, display: { xs: "none", sm: "block" } }}>
            <TextField
              fullWidth
              size="small"
              label="Search medicine"
              placeholder="Search medicine by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: tokens.secondary, fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: { height: 44, fontSize: { xs: 14, md: 16 } },
              }}
            />
          </Box>

          {/* Desktop nav */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, ml: "auto" }}>
            {navItems.map((item) => (
              <Button
                key={item.href}
                component={NextLink}
                href={item.href}
                sx={{
                  color: pathname.startsWith(item.href) ? tokens.primary : "#444",
                  fontSize: 15,
                  fontWeight: 700,
                  borderBottom: pathname.startsWith(item.href) ? `2.5px solid ${tokens.primary}` : "2.5px solid transparent",
                  borderRadius: 0,
                  px: 1.5,
                  minHeight: 44,
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Mobile hamburger */}
          <IconButton
            sx={{ display: { md: "none" }, ml: "auto", color: tokens.primary }}
            onClick={() => setMobileOpen(true)}
            aria-label="open menu"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 280, pt: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, pb: 1 }}>
            <Typography sx={{ fontWeight: 800, color: tokens.primary, fontSize: 18 }}>MedInfoBD</Typography>
            <IconButton onClick={() => setMobileOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <Box component="form" onSubmit={handleSearch} sx={{ px: 2, pb: 2 }}>
            <TextField
              fullWidth size="small"
              label="Search medicine"
              placeholder="Search medicine…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
            />
          </Box>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={NextLink}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  selected={pathname.startsWith(item.href)}
                  sx={{ "&.Mui-selected": { color: tokens.primary, fontWeight: 700, bgcolor: "#E8F0FE" } }}
                >
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
