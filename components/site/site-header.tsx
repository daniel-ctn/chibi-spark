import Link from "next/link";
import { Sparkles } from "lucide-react";

import { NAV_LINKS, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  className?: string;
  activePath?: string;
}

export function SiteHeader({ className, activePath = "" }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "border-border/70 bg-background/95 sticky top-0 z-40 w-full border-b",
        className,
      )}
    >
      <div className="container-wide flex h-[4.25rem] items-center justify-between gap-4">
        <Link href="/" className="group inline-flex min-w-0 items-center gap-3">
          <span className="bg-primary text-primary-foreground grid h-10 w-10 shrink-0 place-items-center rounded-2xl shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
            <Sparkles className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0">
            <span className="font-display block text-base leading-none font-semibold tracking-tight">
              {SITE_NAME}
            </span>
            <span className="text-muted-foreground mt-0.5 hidden truncate text-[11px] sm:block">
              {SITE_TAGLINE}
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              activePath === link.href || activePath.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn("nav-link", isActive && "nav-link-active")}
              >
                {link.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
