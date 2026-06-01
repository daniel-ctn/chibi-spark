import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center gap-6 py-32 text-center">
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        This chibi wandered off.
      </h1>
      <p className="text-muted-foreground max-w-md text-sm sm:text-base">
        The page you were looking for doesn&apos;t exist (or hasn&apos;t been dropped
        yet). Head back home and try again.
      </p>
      <Button asChild>
        <Link href="/">Back to {SITE_NAME}</Link>
      </Button>
    </div>
  );
}
