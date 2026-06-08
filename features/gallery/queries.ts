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

export async function getGalleryItems(
  filters: GalleryFilters = {},
): Promise<GalleryItem[]> {
  const { search, tags, animatedOnly, limit = 50, offset = 0 } = filters;

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

  if (filters.batchId) {
    conditions.push(eq(chibiItems.batchId, filters.batchId));
  }

  if (tags && tags.length > 0) {
    const tagIds = await db
      .select({ id: chibiTags.id })
      .from(chibiTags)
      .where(inArray(chibiTags.slug, tags));

    if (tagIds.length > 0) {
      const itemIds = await db
        .select({ chibiItemId: chibiItemTags.chibiItemId })
        .from(chibiItemTags)
        .where(
          inArray(
            chibiItemTags.tagId,
            tagIds.map((t) => t.id),
          ),
        );

      if (itemIds.length > 0) {
        conditions.push(
          inArray(
            chibiItems.id,
            itemIds.map((i) => i.chibiItemId),
          ),
        );
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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
