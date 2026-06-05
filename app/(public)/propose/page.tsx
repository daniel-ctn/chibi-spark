import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";

import { ProposalForm } from "@/components/proposals/proposal-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Propose a chibi idea",
  description:
    "Suggest a cute chibi idea for future daily drops. No account needed, no strings attached.",
};

export default function ProposePage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
            <Lightbulb className="text-primary h-8 w-8" />
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Propose a chibi idea
          </h1>
          <p className="text-muted-foreground text-lg">
            Suggest a cute chibi idea for future daily drops. No account needed, no
            strings attached.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your idea</CardTitle>
            <CardDescription>
              Fill out the form below. We&apos;ll review your idea and it may be selected
              for a future daily drop.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProposalForm />
          </CardContent>
        </Card>

        <div className="border-border/60 bg-card/50 mt-8 rounded-lg border p-6">
          <h2 className="mb-3 text-lg font-semibold">How it works</h2>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>
              <strong className="text-foreground">No account needed:</strong> Submit ideas
              anonymously. We only store a hashed version of your IP for rate limiting.
            </li>
            <li>
              <strong className="text-foreground">Free to use:</strong> All generated
              chibis are free to download and use for any purpose.
            </li>
            <li>
              <strong className="text-foreground">Community-driven:</strong> Some
              proposals may be selected for future daily drops. We mix your ideas with
              curated themes.
            </li>
            <li>
              <strong className="text-foreground">Moderated:</strong> We use AI to check
              submissions for safety. Unsafe content is rejected.
            </li>
          </ul>
        </div>

        <div className="text-muted-foreground mt-6 text-center text-sm">
          <p>
            {SITE_NAME} is a fun, experimental project. All content is AI-generated and
            free for public use.
          </p>
        </div>
      </div>
    </div>
  );
}
