import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about ChibiDrop — how we generate cute chibi art daily, why it's free, and how you can use it.",
};

const FAQ_ITEMS = [
  {
    question: "Is this really free?",
    answer:
      "Yes. Every chibi is free to download and use for personal, commercial, or educational projects. No attribution required.",
  },
  {
    question: "How are the chibis made?",
    answer:
      "A daily pipeline picks themes, expands prompts, generates still art, uploads assets, and optionally animates a couple of pieces.",
  },
  {
    question: "Can I request themes?",
    answer:
      "Absolutely. Submit ideas on the Propose page. Safe submissions may appear in a future drop.",
  },
  {
    question: "How often is new art added?",
    answer: "Four new chibis every day at 9:00 UTC, with animations on select pieces.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-wide py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          kicker="About"
          title="A tiny daily zine of chibi art"
          description="ChibiDrop generates cute characters every morning and puts them in a public gallery for anyone to enjoy."
        />

        <div className="surface-panel mb-8 space-y-4 p-6 sm:p-8">
          <p className="leading-relaxed">
            We built ChibiDrop as a small, observable experiment: one pipeline, four
            characters, zero friction. Browse the gallery, download what you love, and
            propose ideas if you want to steer future drops.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Everything here is AI-generated, moderated for an all-ages audience, and
            released for free use.
          </p>
        </div>

        <div className="mb-10 grid gap-3 sm:grid-cols-2">
          <div className="surface-panel p-5">
            <p className="section-kicker mb-2">License</p>
            <p className="font-display text-lg font-semibold">Free to use</p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Personal, commercial, remix — all good. No paywall, no sign-up.
            </p>
          </div>
          <div className="surface-panel p-5">
            <p className="section-kicker mb-2">Cadence</p>
            <p className="font-display text-lg font-semibold">4 chibis / day</p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              New drop at 9:00 UTC. Follow the RSS feed if you want every update.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-display mb-4 text-2xl font-semibold">FAQ</h2>
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="surface-panel group p-5">
              <summary className="font-display cursor-pointer list-none font-semibold marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {item.question}
                  <span className="text-muted-foreground text-lg transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/gallery">Browse gallery</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/propose">Propose an idea</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
