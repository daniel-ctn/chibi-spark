import Link from "next/link";

import { NAV_LINKS, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border/70 mt-20 border-t">
      <div className="container-wide py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            <p className="font-display text-xl font-semibold tracking-tight">
              {SITE_NAME}
            </p>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              {SITE_TAGLINE} Four fresh chibis every morning — stills and short
              animations, free to download and remix.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="section-kicker mb-3">Explore</p>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/feed.xml"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    RSS feed
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="section-kicker mb-3">Fine print</p>
              <ul className="text-muted-foreground space-y-2">
                <li>Free for personal & commercial use</li>
                <li>No account required</li>
                <li>New drop daily at 9:00 UTC</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-border/60 text-muted-foreground mt-10 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {SITE_NAME}. Made for fun.
          </span>
          <span>AI-generated art · Handle with joy</span>
        </div>
      </div>
    </footer>
  );
}
