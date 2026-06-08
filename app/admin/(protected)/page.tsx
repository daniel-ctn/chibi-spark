import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminDashboardData } from "@/features/admin/queries";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getAdminDashboardData();
  return (
    <div className="container-page py-8">
      <AdminDashboard data={data} />
    </div>
  );
}
