import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { ChibiGrid } from "@/components/chibi/chibi-grid";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { getDropByDate, getRecentDropDates } from "@/features/gallery/queries";

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
    <div className="container-wide py-10 sm:py-12">
      <Button variant="ghost" asChild className="mb-6 -ml-2 rounded-full">
        <Link href="/">
          <ArrowLeft />
          Back to home
        </Link>
      </Button>

      <PageHeader
        kicker="Daily drop"
        title={formatDropDate(date)}
        description={`${items.length} chibi${items.length === 1 ? "" : "s"} in this batch. Free to download and use.`}
      />

      {items.length > 0 ? (
        <ChibiGrid items={items} featuredFirst />
      ) : (
        <div className="surface-panel border-dashed p-12 text-center">
          <p className="text-muted-foreground">This drop has no published items yet.</p>
        </div>
      )}

      {otherDates.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display mb-4 text-xl font-semibold">Other drops</h2>
          <div className="flex flex-wrap gap-2">
            {otherDates.map((dropDate) => (
              <Link key={dropDate} href={`/drops/${dropDate}`} className="filter-chip">
                {dropDate}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
