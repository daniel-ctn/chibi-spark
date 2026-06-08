import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Calendar, Sparkles, Wand2, Image as ImageIcon, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChibiGrid } from "@/components/chibi/chibi-grid";
import { getDropByDate, getGalleryItems, todayUtcDateString } from "@/features/gallery/queries";
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
    title: "We pick a theme",
    body: "Every day we mix a curated idea with suggestions from the community and expand it into a clean chibi prompt.",
  },
  {
    icon: ImageIcon,
    title: "We draw 4 chibis",
    body: "An image model creates the still art, and a short animated clip is generated for a couple of the drops.",
  },
  {
    icon: Sparkles,
    title: "You take it from there",
    body: "Browse the gallery, download anything for free, and propose your own ideas for future drops.",
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
      {/* Hero */}
      <section className="border-border/60 border-b">
        <div className="container-page flex flex-col items-center gap-8 py-20 text-center sm:py-28">
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-1 text-xs font-medium"
          >
            <Sparkles className="text-primary mr-1.5 h-3.5 w-3.5" />
            Daily drops, freshly chibified
          </Badge>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Cute chibi art, every day. <span className="text-primary">Free to use.</span>
          </h1>

          <p className="text-muted-foreground max-w-2xl text-base text-pretty sm:text-lg">
            A new set of 4 AI-generated chibis drops every morning — still images and
            short animated clips you can download, remix, and share. No account. No
            paywall. No nonsense.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/gallery">
                Browse gallery <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/propose">Propose an idea</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16 sm:py-20">
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            How a drop is made
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm sm:text-base">
            A small, observable pipeline runs once a day. Nothing fancy — just good
            prompts, good models, and a sprinkle of curation.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <Card key={step.title} className="border-border/60">
              <CardHeader>
                <div className="bg-primary/10 text-primary ring-primary/20 mb-1 inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1">
                  <step.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {step.body}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {todaysDrop.length > 0 && (
        <section className="border-border/60 container-page border-b py-16 sm:py-20">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                Today&apos;s drop
              </Badge>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Fresh from this morning
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href={`/drops/${today}`}>
                View drop <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ChibiGrid items={todaysDrop} />
        </section>
      )}

      {/* Latest drops */}
      <section className="container-page pb-20">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Latest drops
          </h2>
          <Button asChild variant="outline">
            <Link href="/gallery">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {latestItems.length > 0 ? (
          <ChibiGrid items={latestItems} />
        ) : (
          <div className="border-border/80 bg-card/40 rounded-2xl border border-dashed p-8 text-center sm:p-12">
            <div className="bg-accent text-accent-foreground mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
              <Video className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Latest drops appear here</h3>
            <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
              The first batch is on its way. Once the daily cron runs, you&apos;ll see the
              newest chibis right on this page.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
