// components/ui/AppBreadcrumbs.tsx
import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { tokens } from "@/lib/theme";

const BASE_URL = "https://medinfo.com.bd";

interface Crumb { label: string; href?: string }

export default function AppBreadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: c.href ? `${BASE_URL}${c.href}` : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />
      <MuiBreadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 14, color: "#CCCCCC" }} />}
        sx={{ mb: "12px", fontSize: { xs: "12px", md: "13px" }, lineHeight: 1.4 }}
      >
        {crumbs.map((c, i) =>
          c.href ? (
            <Link key={i} component={NextLink} href={c.href} underline="hover" sx={{ color: tokens.secondary, fontSize: "inherit", "&:hover": { color: tokens.primary } }}>
              {c.label}
            </Link>
          ) : (
            <Typography key={i} sx={{ color: tokens.body, fontSize: "inherit", fontWeight: 600 }}>
              {c.label}
            </Typography>
          )
        )}
      </MuiBreadcrumbs>
    </>
  );
}
