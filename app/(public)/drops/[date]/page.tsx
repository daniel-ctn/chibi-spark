import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Calendar } from "lucide-react";

import { ChibiGrid } from "@/components/chibi/chibi-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getDropByDate,
  getRecentDropDates,
} from "@/features/gallery/queries";

interface DropPageProps {
  params: Promise<{ date: string }>;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function formatDropDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00.000Z`);
  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function generateMetadata({ params }: DropPageProps): Promise<Metadata> {
  const { date } = await params;
  if (!DATE_PATTERN.test(date)) {
    return { title: "Not found" };
  }

  const { items } = await getDropByDate(date);
  const formatted = formatDropDate(date);

  return {
    title: `Drop of ${formatted}`,
    description:
      items.length > 0
        ? `${items.length} chibis from the ${formatted} daily drop. Free to download and use.`
        : `Daily chibi drop for ${formatted}.`,
  };
}

export default async function DropPage({ params }: DropPageProps) {
  const { date } = await params;

  if (!DATE_PATTERN.test(date)) {
    notFound();
  }

  const [{ batch, items }, recentDates] = await Promise.all([
    getDropByDate(date),
    getRecentDropDates(14),
  ]);

  if (!batch || batch.status !== "done") {
    notFound();
  }

  const otherDates = recentDates.filter((d) => d !== date);

  return (
    <div className="container-page py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </Button>

      <div className="mb-8">
        <Badge variant="secondary" className="mb-3">
          <Calendar className="mr-1.5 h-3.5 w-3.5" />
          Daily drop
        </Badge>
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {formatDropDate(date)}
        </h1>
        <p className="text-muted-foreground">
          {items.length} chibi{items.length === 1 ? "" : "s"} in this drop. Free to
          download and use.
        </p>
      </div>

      {items.length > 0 ? (
        <ChibiGrid items={items} />
      ) : (
        <div className="border-border/80 bg-card/40 rounded-2xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground">This drop has no published items yet.</p>
        </div>
      )}

      {otherDates.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">Other drops</h2>
          <div className="flex flex-wrap gap-2">
            {otherDates.map((dropDate) => (
              <Link key={dropDate} href={`/drops/${dropDate}`}>
                <Badge variant="outline" className="cursor-pointer">
                  {dropDate}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
