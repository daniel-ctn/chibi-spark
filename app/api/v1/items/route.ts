import { NextResponse } from "next/server";

import {
  GALLERY_PAGE_SIZE,
  getGalleryItemCount,
  getGalleryItems,
} from "@/features/gallery/queries";
import { serializeGalleryItem } from "@/lib/api/serialize";

export const dynamic = "force-dynamic";

const MAX_LIMIT = 100;

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function parseNonNegativeInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.floor(parsed);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 24), MAX_LIMIT);
  const offset = parseNonNegativeInt(searchParams.get("offset"), 0);
  const search = searchParams.get("q") ?? undefined;
  const animatedOnly = searchParams.get("animated") === "true";
  const tagsParam = searchParams.get("tags");
  const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : undefined;

  const filters = {
    search: search || undefined,
    tags,
    animatedOnly: animatedOnly || undefined,
    limit,
    offset,
  };

  const [items, total] = await Promise.all([
    getGalleryItems(filters),
    getGalleryItemCount(filters),
  ]);

  return NextResponse.json(
    {
      items: items.map(serializeGalleryItem),
      pagination: {
        limit,
        offset,
        total,
        pageSize: GALLERY_PAGE_SIZE,
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  );
}
