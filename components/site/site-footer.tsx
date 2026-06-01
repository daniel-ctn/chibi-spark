import Link from "next/link";

import { SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="container-page flex flex-col items-start justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-foreground">{SITE_NAME}</span>
          <span>
            AI-generated chibi art, free to download and use. Made for fun.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/gallery" className="hover:text-foreground">
            Gallery
          </Link>
          <Link href="/propose" className="hover:text-foreground">
            Propose an idea
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <span className="text-xs opacity-70">© {year}</span>
        </div>
      </div>
    </footer>
  );
}
