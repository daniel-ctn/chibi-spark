import Link from "next/link";
import { Sparkles } from "lucide-react";

import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  className?: string;
}

export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "border-border/60 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur",
        className,
      )}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="bg-primary/10 text-primary ring-primary/20 group-hover:bg-primary/15 grid h-8 w-8 place-items-center rounded-lg ring-1 transition">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-base">{SITE_NAME}</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
