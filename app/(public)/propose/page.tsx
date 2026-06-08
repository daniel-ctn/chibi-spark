import type { Metadata } from "next";
import { Lightbulb, MessageCircleHeart, ShieldCheck, Sparkles } from "lucide-react";

import { ProposalForm } from "@/components/proposals/proposal-form";
import { PageHeader } from "@/components/site/page-header";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Propose a chibi idea",
  description:
    "Suggest a cute chibi idea for future daily drops. No account needed, no strings attached.",
};

const NOTES = [
  {
    icon: MessageCircleHeart,
    title: "Anonymous submissions",
    body: "No account needed. We only store a hashed IP for rate limiting.",
  },
  {
    icon: Sparkles,
    title: "Community mix",
    body: "Safe proposals can appear in future daily drops alongside curated themes.",
  },
  {
    icon: ShieldCheck,
    title: "Moderated",
    body: "AI checks every idea before it enters the queue.",
  },
];

export default function ProposePage() {
  return (
    <div className="container-wide py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          kicker="Community"
          title="Propose tomorrow's chibi"
          description="Share a cute idea for a future drop. If it passes moderation, it may show up in the gallery."
        />

        <div className="surface-panel mb-8 p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="bg-primary/10 text-primary inline-flex h-11 w-11 items-center justify-center rounded-2xl">
              <Lightbulb className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold">Your idea</h2>
              <p className="text-muted-foreground text-sm">
                Keep it wholesome, specific, and chibi-friendly.
              </p>
            </div>
          </div>
          <ProposalForm />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {NOTES.map((note) => (
            <div key={note.title} className="surface-panel p-4">
              <note.icon className="text-primary mb-3 h-5 w-5" />
              <h3 className="font-display mb-1 text-sm font-semibold">{note.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{note.body}</p>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground mt-8 text-center text-sm">
          {SITE_NAME} is a playful experiment. All generated art is free for public use.
        </p>
      </div>
    </div>
  );
}
