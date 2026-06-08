import { NextResponse } from "next/server";

import { getChibiBySlug } from "@/features/gallery/queries";
import { serializeGalleryItem } from "@/lib/api/serialize";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const item = await getChibiBySlug(slug);

  if (!item) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(
    { item: serializeGalleryItem(item) },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
