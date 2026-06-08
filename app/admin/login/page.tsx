import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin/auth";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (!isAdminConfigured()) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin unavailable</CardTitle>
            <CardDescription>
              Set <code className="text-xs">ADMIN_SECRET</code> in your environment to
              enable the admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{SITE_NAME} admin</CardTitle>
          <CardDescription>
            Sign in to review proposals and manage the pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
          <p className="text-muted-foreground mt-6 text-center text-xs">
            <Link
              href="/"
              className="hover:text-foreground underline-offset-4 hover:underline"
            >
              Back to site
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
