import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ──────────────────────────────────────────────────────────────────────────
 * Enums
 * ────────────────────────────────────────────────────────────────────────── */

export const proposalStatusEnum = pgEnum("proposal_status", [
  "pending",
  "selected",
  "used",
  "rejected",
]);

export const safetyLabelEnum = pgEnum("safety_label", [
  "pending",
  "safe",
  "borderline",
  "unsafe",
]);

export const batchStatusEnum = pgEnum("batch_status", [
  "pending",
  "running",
  "done",
  "failed",
]);

export const assetTypeEnum = pgEnum("asset_type", ["image", "animation", "thumbnail"]);

export const assetProviderEnum = pgEnum("asset_provider", [
  "openai",
  "fal",
  "replicate",
  "ffmpeg",
]);

export const jobTypeEnum = pgEnum("job_type", ["text", "image", "animation", "metadata"]);

export const jobStatusEnum = pgEnum("job_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
  "skipped",
]);

/* ──────────────────────────────────────────────────────────────────────────
 * proposals — anonymous chibi idea submissions
 * ────────────────────────────────────────────────────────────────────────── */

export const proposals = pgTable(
  "proposals",
  {
    id: text("id").primaryKey(),
    nickname: text("nickname"),
    ideaText: text("idea_text").notNull(),
    styleHints: text("style_hints"),
    status: proposalStatusEnum("status").notNull().default("pending"),
    safetyLabel: safetyLabelEnum("safety_label").notNull().default("pending"),
    sourceIpHash: text("source_ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("proposals_status_created_idx").on(t.status, t.createdAt),
    index("proposals_safety_idx").on(t.safetyLabel),
  ],
);

/* ──────────────────────────────────────────────────────────────────────────
 * daily_batches — one row per daily generation run
 * ────────────────────────────────────────────────────────────────────────── */

export const dailyBatches = pgTable(
  "daily_batches",
  {
    id: text("id").primaryKey(),
    generationDate: date("generation_date").notNull(),
    status: batchStatusEnum("status").notNull().default("pending"),
    itemCount: integer("item_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("daily_batches_date_unique").on(t.generationDate)],
);

/* ──────────────────────────────────────────────────────────────────────────
 * chibi_items — public chibi entries shown in the gallery
 * ────────────────────────────────────────────────────────────────────────── */

export const chibiItems = pgTable(
  "chibi_items",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    batchId: text("batch_id").references(() => dailyBatches.id, {
      onDelete: "set null",
    }),
    sourceProposalId: text("source_proposal_id").references(() => proposals.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    theme: text("theme").notNull(),
    prompt: text("prompt").notNull(),
    revisedPrompt: text("revised_prompt"),
    shortDescription: text("short_description"),
    isAnimated: boolean("is_animated").notNull().default(false),
    safetyLabel: safetyLabelEnum("safety_label").notNull().default("pending"),
    viewCount: integer("view_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("chibi_items_slug_unique").on(t.slug),
    index("chibi_items_published_idx").on(t.publishedAt),
    index("chibi_items_animated_published_idx").on(t.isAnimated, t.publishedAt),
    index("chibi_items_batch_idx").on(t.batchId),
    index("chibi_items_safety_idx").on(t.safetyLabel),
  ],
);

/* ──────────────────────────────────────────────────────────────────────────
 * chibi_assets — R2 objects (image, animation, thumbnail)
 * ────────────────────────────────────────────────────────────────────────── */

export const chibiAssets = pgTable(
  "chibi_assets",
  {
    id: text("id").primaryKey(),
    chibiItemId: text("chibi_item_id")
      .notNull()
      .references(() => chibiItems.id, { onDelete: "cascade" }),
    assetType: assetTypeEnum("asset_type").notNull(),
    provider: assetProviderEnum("provider").notNull(),
    storageKey: text("storage_key").notNull(),
    publicUrl: text("public_url").notNull(),
    mimeType: text("mime_type").notNull(),
    width: integer("width"),
    height: integer("height"),
    durationSeconds: real("duration_seconds"),
    bytes: integer("bytes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("chibi_assets_storage_key_unique").on(t.storageKey),
    index("chibi_assets_item_idx").on(t.chibiItemId, t.assetType),
  ],
);

/* ──────────────────────────────────────────────────────────────────────────
 * chibi_tags — reusable tag dictionary
 * ────────────────────────────────────────────────────────────────────────── */

export const chibiTags = pgTable(
  "chibi_tags",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (t) => [
    uniqueIndex("chibi_tags_name_unique").on(t.name),
    uniqueIndex("chibi_tags_slug_unique").on(t.slug),
  ],
);

/* ──────────────────────────────────────────────────────────────────────────
 * chibi_item_tags — many-to-many join
 * ────────────────────────────────────────────────────────────────────────── */

export const chibiItemTags = pgTable(
  "chibi_item_tags",
  {
    chibiItemId: text("chibi_item_id")
      .notNull()
      .references(() => chibiItems.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => chibiTags.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.chibiItemId, t.tagId] }),
    index("chibi_item_tags_tag_idx").on(t.tagId),
  ],
);

/* ──────────────────────────────────────────────────────────────────────────
 * generation_jobs — async job log for the pipeline
 * ────────────────────────────────────────────────────────────────────────── */

export const generationJobs = pgTable(
  "generation_jobs",
  {
    id: text("id").primaryKey(),
    chibiItemId: text("chibi_item_id").references(() => chibiItems.id, {
      onDelete: "set null",
    }),
    jobType: jobTypeEnum("job_type").notNull(),
    status: jobStatusEnum("status").notNull().default("queued"),
    provider: text("provider"),
    providerJobId: text("provider_job_id"),
    inputPayload: jsonb("input_payload").notNull().default({}),
    outputPayload: jsonb("output_payload"),
    errorMessage: text("error_message"),
    attempts: integer("attempts").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("generation_jobs_status_type_idx").on(t.status, t.jobType),
    index("generation_jobs_item_idx").on(t.chibiItemId),
    index("generation_jobs_provider_job_idx").on(t.provider, t.providerJobId),
  ],
);

/* ──────────────────────────────────────────────────────────────────────────
 * Relations (for Drizzle's typed query API)
 * ────────────────────────────────────────────────────────────────────────── */

export const proposalsRelations = relations(proposals, ({ many }) => ({
  chibiItems: many(chibiItems),
}));

export const dailyBatchesRelations = relations(dailyBatches, ({ many }) => ({
  chibiItems: many(chibiItems),
}));

export const chibiItemsRelations = relations(chibiItems, ({ one, many }) => ({
  batch: one(dailyBatches, {
    fields: [chibiItems.batchId],
    references: [dailyBatches.id],
  }),
  sourceProposal: one(proposals, {
    fields: [chibiItems.sourceProposalId],
    references: [proposals.id],
  }),
  assets: many(chibiAssets),
  itemTags: many(chibiItemTags),
  jobs: many(generationJobs),
}));

export const chibiAssetsRelations = relations(chibiAssets, ({ one }) => ({
  chibiItem: one(chibiItems, {
    fields: [chibiAssets.chibiItemId],
    references: [chibiItems.id],
  }),
}));

export const chibiTagsRelations = relations(chibiTags, ({ many }) => ({
  itemTags: many(chibiItemTags),
}));

export const chibiItemTagsRelations = relations(chibiItemTags, ({ one }) => ({
  chibiItem: one(chibiItems, {
    fields: [chibiItemTags.chibiItemId],
    references: [chibiItems.id],
  }),
  tag: one(chibiTags, {
    fields: [chibiItemTags.tagId],
    references: [chibiTags.id],
  }),
}));

export const generationJobsRelations = relations(generationJobs, ({ one }) => ({
  chibiItem: one(chibiItems, {
    fields: [generationJobs.chibiItemId],
    references: [chibiItems.id],
  }),
}));

/* ──────────────────────────────────────────────────────────────────────────
 * Inferred row types (use these everywhere instead of redeclaring shapes)
 * ────────────────────────────────────────────────────────────────────────── */

export type Proposal = typeof proposals.$inferSelect;
export type NewProposal = typeof proposals.$inferInsert;
export type DailyBatch = typeof dailyBatches.$inferSelect;
export type NewDailyBatch = typeof dailyBatches.$inferInsert;
export type ChibiItem = typeof chibiItems.$inferSelect;
export type NewChibiItem = typeof chibiItems.$inferInsert;
export type ChibiAsset = typeof chibiAssets.$inferSelect;
export type NewChibiAsset = typeof chibiAssets.$inferInsert;
export type ChibiTag = typeof chibiTags.$inferSelect;
export type NewChibiTag = typeof chibiTags.$inferInsert;
export type ChibiItemTag = typeof chibiItemTags.$inferSelect;
export type NewChibiItemTag = typeof chibiItemTags.$inferInsert;
export type GenerationJob = typeof generationJobs.$inferSelect;
export type NewGenerationJob = typeof generationJobs.$inferInsert;
