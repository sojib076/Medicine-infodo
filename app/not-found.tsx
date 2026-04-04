// app/not-found.tsx
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import NextLink from "next/link";
import { tokens } from "@/lib/theme";

export default function NotFound() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: "center", py: 12 }}>
        <Typography sx={{ fontSize: 80, lineHeight: 1, mb: 2 }}>💊</Typography>
        <Typography variant="h4" sx={{ mb: 1 }}>Page Not Found</Typography>
        <Typography variant="body1" sx={{ color: tokens.secondary, mb: 4 }}>
          The medicine or page you&apos;re looking for doesn&apos;t exist in our database.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button variant="contained" component={NextLink} href="/brands">Browse All Brands</Button>
          <Button variant="outlined" component={NextLink} href="/search">Search Medicines</Button>
        </Box>
      </Box>
    </Container>
  );
}
