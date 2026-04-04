"use client";
import { createTheme } from "@mui/material";
import { tokens } from "./theme";

const theme = createTheme({
  palette: {
    primary: { main: tokens.primary },
    secondary: { main: tokens.secondary },
    background: { default: tokens.bg, paper: tokens.cardBg },
    text: { primary: tokens.body, secondary: tokens.secondary },
  },
  typography: {
    fontFamily: `"DM Sans", "Segoe UI", sans-serif`,
    h4: {
      fontSize: 28,
      fontWeight: 700,
      lineHeight: 1.3,
      color: tokens.primary,
    }, // H1
    h5: {
      fontSize: 22,
      fontWeight: 700,
      lineHeight: 1.4,
      color: tokens.primary,
    }, // H2
    h6: {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: 1.5,
      color: tokens.primary,
    }, // H3
    body1: { fontSize: 16, lineHeight: 1.6, color: tokens.body },
    body2: { fontSize: 14, lineHeight: 1.5, color: tokens.secondary },
    button: { fontSize: 16, fontWeight: 700, textTransform: "none" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.bg,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          color: tokens.body,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.cardBg,
          borderRadius: 12,
          boxShadow: tokens.shadow,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 44,
          fontSize: 15,
          fontWeight: 700,
          textTransform: "none",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        contained: {
          backgroundColor: tokens.primary,
          "&:hover": { backgroundColor: "#0a3a82" },
        },
        outlined: {
          borderColor: tokens.accent,
          color: tokens.accent,
          "&:hover": { backgroundColor: "#E3F0FF", borderColor: tokens.accent },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 20, fontWeight: 600, minHeight: 36 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          fontSize: 15,
          color: tokens.secondary,
          minHeight: 48,
          "&.Mui-selected": { color: tokens.primary },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: "12px !important",
          marginBottom: 12,
          boxShadow: tokens.shadow,
          "&:before": { display: "none" },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: "#fff",
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          "& .MuiPaginationItem-root": {
            color: tokens.accent,
            "&.Mui-selected": {
              backgroundColor: tokens.primary,
              color: "#fff",
            },
          },
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: { fontSize: 12, color: tokens.secondary },
        separator: { color: "#CCCCCC" },
      },
    },
  },
});

export default theme;
