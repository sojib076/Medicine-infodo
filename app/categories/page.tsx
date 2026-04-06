// app/categories/page.tsx — redirects to medicines
import { redirect } from "next/navigation";
export default function CategoriesPage() {
  redirect("/medicines");
}
