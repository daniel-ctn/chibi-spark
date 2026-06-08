import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="container-wide flex flex-col items-center justify-center gap-6 py-28 text-center sm:py-36">
      <p className="section-kicker">404</p>
      <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        This chibi wandered off the page.
      </h1>
      <p className="text-muted-foreground max-w-md text-base leading-relaxed">
        The URL might be wrong, or this drop hasn&apos;t happened yet. Head home and
        browse what&apos;s live.
      </p>
      <Button asChild size="lg">
        <Link href="/">Back to {SITE_NAME}</Link>
      </Button>
    </div>
  );
}
