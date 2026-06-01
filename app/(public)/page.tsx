import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Sparkles, Wand2, Image as ImageIcon, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SITE_TAGLINE } from "@/lib/constants";

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

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b border-border/60">
        <div className="container-page flex flex-col items-center gap-8 py-20 text-center sm:py-28">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
            Daily drops, freshly chibified
          </Badge>

          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Cute chibi art, every day. <span className="text-primary">Free to use.</span>
          </h1>

          <p className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            A new set of 4 AI-generated chibis drops every morning — still images
            and short animated clips you can download, remix, and share.
            No account. No paywall. No nonsense.
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
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            A small, observable pipeline runs once a day. Nothing fancy — just
            good prompts, good models, and a sprinkle of curation.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <Card key={step.title} className="border-border/60">
              <CardHeader>
                <div className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
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

      {/* Latest drops placeholder */}
      <section className="container-page pb-20">
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center sm:p-12">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Video className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">Latest drops appear here</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            The first batch is on its way. Once the daily cron runs, you&apos;ll
            see the newest chibis right on this page.
          </p>
          <div className="mt-5">
            <Button asChild variant="outline">
              <Link href="/gallery">Open the gallery</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
