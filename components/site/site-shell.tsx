"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

interface SiteShellProps {
  children: React.ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <div className="flex min-h-screen flex-col">{children}</div>;
  }

  return (
    <div className="surface-dots flex min-h-screen flex-col">
      <SiteHeader activePath={pathname} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
