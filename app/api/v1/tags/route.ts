import { NextResponse } from "next/server";

import { getAllTags } from "@/features/gallery/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const tags = await getAllTags();

  return NextResponse.json(
    {
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
