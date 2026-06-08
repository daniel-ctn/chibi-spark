import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  chibiAssets,
  chibiItemTags,
  chibiItems,
  chibiTags,
  type ChibiAsset,
  type ChibiItem,
  type ChibiTag,
} from "@/lib/db/schema";
import { newId, slugify } from "@/lib/ids";

export async function createChibiItem(input: {
  id?: string;
  slug: string;
  batchId: string | null;
  sourceProposalId?: string | null;
  title: string;
  theme: string;
  prompt: string;
  revisedPrompt?: string | null;
  shortDescription?: string | null;
  isAnimated?: boolean;
  safetyLabel?: "safe" | "borderline" | "unsafe" | "pending";
  publishedAt?: Date;
}): Promise<ChibiItem> {
  const [row] = await db
    .insert(chibiItems)
    .values({
      id: input.id ?? newId(),
      slug: input.slug,
      batchId: input.batchId,
      sourceProposalId: input.sourceProposalId ?? null,
      title: input.title,
      theme: input.theme,
      prompt: input.prompt,
      revisedPrompt: input.revisedPrompt ?? null,
      shortDescription: input.shortDescription ?? null,
      isAnimated: input.isAnimated ?? false,
      safetyLabel: input.safetyLabel ?? "pending",
      publishedAt: input.publishedAt ?? null,
    })
    .returning();
  if (!row) throw new Error("Failed to create chibi item");
  return row;
}

export async function createChibiAsset(input: {
  id?: string;
  chibiItemId: string;
  assetType: "image" | "animation" | "thumbnail";
  provider: "openai" | "fal" | "replicate" | "ffmpeg";
  storageKey: string;
  publicUrl: string;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
  bytes?: number | null;
}): Promise<ChibiAsset> {
  const [row] = await db
    .insert(chibiAssets)
    .values({
      id: input.id ?? newId(),
      chibiItemId: input.chibiItemId,
      assetType: input.assetType,
      provider: input.provider,
      storageKey: input.storageKey,
      publicUrl: input.publicUrl,
      mimeType: input.mimeType,
      width: input.width ?? null,
      height: input.height ?? null,
      durationSeconds: input.durationSeconds ?? null,
      bytes: input.bytes ?? null,
    })
    .returning();
  if (!row) throw new Error("Failed to create chibi asset");
  return row;
}

async function ensureTags(names: string[]): Promise<ChibiTag[]> {
  if (names.length === 0) return [];

  const normalized = names.map((n) => n.toLowerCase().trim()).filter(Boolean);
  const slugs = normalized.map((n) => slugify(n));
  const rows = normalized.map((name, i) => ({
    id: newId(),
    name,
    slug: slugs[i] ?? slugify(name),
  }));

  await db.insert(chibiTags).values(rows).onConflictDoNothing({ target: chibiTags.name });

  return db.select().from(chibiTags).where(inArray(chibiTags.name, normalized));
}

export async function updateChibiItem(
  id: string,
  updates: Partial<Omit<ChibiItem, "id" | "createdAt">>,
): Promise<ChibiItem> {
  const [row] = await db
    .update(chibiItems)
    .set(updates)
    .where(eq(chibiItems.id, id))
    .returning();
  if (!row) throw new Error("Failed to update chibi item");
  return row;
}

export async function attachTags(itemId: string, tagNames: string[]) {
  const tags = await ensureTags(tagNames);
  if (tags.length === 0) return;

  const joins = tags.map((tag) => ({
    chibiItemId: itemId,
    tagId: tag.id,
  }));

  await db.insert(chibiItemTags).values(joins).onConflictDoNothing();
}

export async function incrementChibiViewCount(slug: string): Promise<void> {
  await db
    .update(chibiItems)
    .set({ viewCount: sql`${chibiItems.viewCount} + 1` })
    .where(eq(chibiItems.slug, slug));
}
