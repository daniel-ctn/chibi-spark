import { redirect } from "next/navigation";

import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin/auth";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!isAdminConfigured()) {
    redirect("/admin/login");
  }

  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return children;
}
