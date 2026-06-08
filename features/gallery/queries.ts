import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getBatchByDate } from "@/lib/db/queries/daily-batches";
import {
  chibiAssets,
  chibiItemTags,
  chibiItems,
  chibiTags,
  dailyBatches,
  proposals,
  type ChibiAsset,
  type ChibiItem,
  type ChibiTag,
  type DailyBatch,
  type Proposal,
} from "@/lib/db/schema";

export interface GalleryFilters {
  search?: string;
  tags?: string[];
  animatedOnly?: boolean;
  batchId?: string;
  limit?: number;
  offset?: number;
}

export interface GalleryItem {
  item: ChibiItem;
  assets: ChibiAsset[];
  tags: ChibiTag[];
  sourceProposal?: Pick<Proposal, "id" | "nickname" | "ideaText"> | null;
}

export const GALLERY_PAGE_SIZE = 24;

async function buildGalleryConditions(filters: GalleryFilters) {
  const { search, tags, animatedOnly, batchId } = filters;
  const conditions = [];

  if (search) {
    conditions.push(
      sql`(
        ${chibiItems.title} ILIKE ${`%${search}%`} OR
        ${chibiItems.shortDescription} ILIKE ${`%${search}%`} OR
        ${chibiItems.theme} ILIKE ${`%${search}%`}
      )`,
    );
  }

  if (animatedOnly) {
    conditions.push(eq(chibiItems.isAnimated, true));
  }

  if (batchId) {
    conditions.push(eq(chibiItems.batchId, batchId));
  }

  if (tags && tags.length > 0) {
    const tagIds = await db
      .select({ id: chibiTags.id })
      .from(chibiTags)
      .where(inArray(chibiTags.slug, tags));

    if (tagIds.length === 0) {
      return { whereClause: undefined, empty: true as const };
    }

    const itemIds = await db
      .select({ chibiItemId: chibiItemTags.chibiItemId })
      .from(chibiItemTags)
      .where(
        inArray(
          chibiItemTags.tagId,
          tagIds.map((t) => t.id),
        ),
      );

    if (itemIds.length === 0) {
      return { whereClause: undefined, empty: true as const };
    }

    conditions.push(
      inArray(
        chibiItems.id,
        itemIds.map((i) => i.chibiItemId),
      ),
    );
  }

  return {
    whereClause: conditions.length > 0 ? and(...conditions) : undefined,
    empty: false as const,
  };
}

export async function getGalleryItemCount(filters: GalleryFilters = {}): Promise<number> {
  const { whereClause, empty } = await buildGalleryConditions(filters);
  if (empty) return 0;

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(chibiItems)
    .where(whereClause);

  return row?.count ?? 0;
}

export async function getGalleryItems(
  filters: GalleryFilters = {},
): Promise<GalleryItem[]> {
  const { limit = 50, offset = 0 } = filters;
  const { whereClause, empty } = await buildGalleryConditions(filters);
  if (empty) return [];

  const items = await db
    .select()
    .from(chibiItems)
    .where(whereClause)
    .orderBy(desc(chibiItems.publishedAt))
    .limit(limit)
    .offset(offset);

  const galleryItems: GalleryItem[] = [];

  for (const item of items) {
    const assets = await db
      .select()
      .from(chibiAssets)
      .where(eq(chibiAssets.chibiItemId, item.id));

    const tagRows = await db
      .select({ tag: chibiTags })
      .from(chibiItemTags)
      .innerJoin(chibiTags, eq(chibiItemTags.tagId, chibiTags.id))
      .where(eq(chibiItemTags.chibiItemId, item.id));

    galleryItems.push({
      item,
      assets,
      tags: tagRows.map((r) => r.tag),
    });
  }

  return galleryItems;
}

export async function getDropByDate(
  generationDate: string,
): Promise<{ batch: DailyBatch | null; items: GalleryItem[] }> {
  const batch = await getBatchByDate(generationDate);
  if (!batch || batch.status !== "done") {
    return { batch: batch ?? null, items: [] };
  }

  const items = await getGalleryItems({ batchId: batch.id, limit: 20 });
  return { batch, items };
}

export async function getRecentDropDates(limit = 14): Promise<string[]> {
  const batches = await db
    .select({ generationDate: dailyBatches.generationDate })
    .from(dailyBatches)
    .where(eq(dailyBatches.status, "done"))
    .orderBy(desc(dailyBatches.generationDate))
    .limit(limit);

  return batches.map((b) => b.generationDate);
}

export function todayUtcDateString(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export async function getChibiBySlug(slug: string): Promise<GalleryItem | null> {
  const [item] = await db
    .select()
    .from(chibiItems)
    .where(eq(chibiItems.slug, slug))
    .limit(1);

  if (!item) return null;

  const assets = await db
    .select()
    .from(chibiAssets)
    .where(eq(chibiAssets.chibiItemId, item.id));

  const tagRows = await db
    .select({ tag: chibiTags })
    .from(chibiItemTags)
    .innerJoin(chibiTags, eq(chibiItemTags.tagId, chibiTags.id))
    .where(eq(chibiItemTags.chibiItemId, item.id));

  let sourceProposal: GalleryItem["sourceProposal"] = null;
  if (item.sourceProposalId) {
    const [proposal] = await db
      .select({
        id: proposals.id,
        nickname: proposals.nickname,
        ideaText: proposals.ideaText,
      })
      .from(proposals)
      .where(eq(proposals.id, item.sourceProposalId))
      .limit(1);
    sourceProposal = proposal ?? null;
  }

  return {
    item,
    assets,
    tags: tagRows.map((r) => r.tag),
    sourceProposal,
  };
}

export async function getAllTags(): Promise<ChibiTag[]> {
  return db.select().from(chibiTags).orderBy(chibiTags.name);
}

export async function getRelatedItems(slug: string, limit = 4): Promise<GalleryItem[]> {
  const current = await getChibiBySlug(slug);
  if (!current) return [];

  const excludeId = current.item.id;
  const collected: GalleryItem[] = [];
  const seen = new Set<string>([excludeId]);

  const addItems = (items: GalleryItem[]) => {
    for (const entry of items) {
      if (seen.has(entry.item.id)) continue;
      seen.add(entry.item.id);
      collected.push(entry);
      if (collected.length >= limit) return;
    }
  };

  if (current.item.batchId) {
    addItems(
      await getGalleryItems({
        batchId: current.item.batchId,
        limit: limit + 1,
      }),
    );
  }

  if (collected.length < limit && current.tags.length > 0) {
    addItems(
      await getGalleryItems({
        tags: current.tags.slice(0, 3).map((tag) => tag.slug),
        limit: limit + 5,
      }),
    );
  }

  if (collected.length < limit) {
    addItems(await getGalleryItems({ limit: limit + 5 }));
  }

  return collected.slice(0, limit);
}
