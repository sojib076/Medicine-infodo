// app/categories/[slug]/page.tsx — redirects to medicines
import { redirect } from "next/navigation";
export default function CategoryDetailPage() {
  redirect("/medicines");
}
