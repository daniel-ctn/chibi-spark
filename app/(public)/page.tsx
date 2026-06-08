import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarDays,
  Sparkles,
  Wand2,
  ImageIcon,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChibiGrid } from "@/components/chibi/chibi-grid";
import { SectionHeading } from "@/components/site/page-header";
import {
  getDropByDate,
  getGalleryItems,
  todayUtcDateString,
} from "@/features/gallery/queries";
import { SITE_TAGLINE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: SITE_TAGLINE,
  description:
    "A new set of 4 AI-generated chibis drops every morning — still images and short animated clips, free to download and use.",
};

const HOW_IT_WORKS = [
  {
    icon: Wand2,
    step: "01",
    title: "Pick a theme",
    body: "Curated ideas meet community proposals. Each day gets a fresh mix.",
  },
  {
    icon: ImageIcon,
    step: "02",
    title: "Generate four chibis",
    body: "Still art for every drop, with short animated clips on select pieces.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Share freely",
    body: "Browse, download, remix — no account, no paywall, no strings attached.",
  },
];

export default async function HomePage() {
  const today = todayUtcDateString();
  const [{ items: todaysDrop }, latestItems] = await Promise.all([
    getDropByDate(today),
    getGalleryItems({ limit: 8 }),
  ]);

  return (
    <div className="flex flex-col">
      <section className="border-border/70 relative overflow-hidden border-b">
        <div className="bg-primary/10 pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full" />
        <div className="bg-secondary/80 pointer-events-none absolute bottom-8 -left-10 h-40 w-40 rounded-full" />

        <div className="container-wide relative grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="space-y-6">
            <p className="section-kicker inline-flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              Daily drop · 9:00 UTC
            </p>

            <h1 className="max-w-xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Cute chibi art,
              <span className="text-primary block">delivered every morning.</span>
            </h1>

            <p className="text-muted-foreground max-w-lg text-base leading-relaxed text-pretty sm:text-lg">
              Four AI-generated chibis land in the gallery each day — still images and
              short animated clips you can download, remix, and share.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/gallery">
                  Browse gallery <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/propose">Propose an idea</Link>
              </Button>
            </div>
          </div>

          <div className="surface-panel grid gap-3 p-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              { label: "New daily", value: "4 chibis" },
              { label: "Cost", value: "Free" },
              { label: "Sign-up", value: "None" },
            ].map((stat) => (
              <div key={stat.label} className="surface-inset rounded-xl px-4 py-3">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                  {stat.label}
                </p>
                <p className="font-display mt-1 text-lg font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {todaysDrop.length > 0 && (
        <section className="container-wide py-16 sm:py-20">
          <SectionHeading
            kicker="Today's drop"
            title="Fresh from this morning"
            description="The newest batch, hot off the pipeline."
            action={
              <Button asChild variant="outline">
                <Link href={`/drops/${today}`}>
                  View full drop <ArrowRight />
                </Link>
              </Button>
            }
          />
          <ChibiGrid items={todaysDrop} featuredFirst />
        </section>
      )}

      <section className="border-border/70 bg-surface-inset/50 border-y">
        <div className="container-wide py-16 sm:py-20">
          <SectionHeading
            kicker="How it works"
            title="From idea to adorable"
            description="A small daily pipeline — good prompts, good models, a little curation."
          />

          <ol className="grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <li key={step.title} className="surface-panel p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="bg-primary/10 text-primary font-display inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold">
                    {step.step}
                  </span>
                  <step.icon className="text-muted-foreground h-5 w-5" />
                </div>
                <h3 className="font-display mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-wide py-16 pb-24 sm:py-20">
        <SectionHeading
          kicker="Archive"
          title="Latest from the gallery"
          action={
            <Button asChild variant="outline">
              <Link href="/gallery">
                View all <ArrowRight />
              </Link>
            </Button>
          }
        />

        {latestItems.length > 0 ? (
          <ChibiGrid items={latestItems} featuredFirst />
        ) : (
          <div className="surface-panel border-dashed p-10 text-center sm:p-14">
            <div className="bg-accent text-accent-foreground mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl">
              <Video className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-semibold">First drop incoming</h3>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
              Once the daily cron runs, the newest chibis will appear here automatically.
            </p>
            <Button asChild className="mt-6" variant="secondary">
              <Link href="/propose">
                <Sparkles className="mr-1 h-4 w-4" />
                Propose the first idea
              </Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
