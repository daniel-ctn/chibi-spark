import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { newId, newSlug } from "@/lib/ids";
import { openaiText, openaiImage } from "@/lib/ai";
import { r2Storage } from "@/lib/storage/r2";
import { createThumbnail } from "@/lib/images/thumbnail";
import { CURATED_THEMES } from "@/lib/ai/themes";
import {
  createBatch,
  getBatchByDate,
  updateBatch,
  getApprovedProposalsForPicking,
  markProposalsAsUsed,
  createChibiItem,
  createChibiAsset,
  attachTags,
  createJob,
} from "@/lib/db/queries";
import { resolveBatchOutcome } from "@/server/pipeline/batch-outcome";

export interface DailyDropResult {
  status: "created" | "skipped_already_done" | "skipped_in_progress" | "failed";
  batchId?: string;
  itemCount?: number;
  expectedCount?: number;
  failedCount?: number;
  partial?: boolean;
  animatedCount?: number;
  themes?: string[];
  durationMs?: number;
  error?: string;
}

export interface DailyDropOptions {
  triggeredBy?: "cron" | "manual" | "api";
  date?: Date;
}

export async function runDailyDrop(
  opts: DailyDropOptions = {},
): Promise<DailyDropResult> {
  const start = Date.now();
  const date = opts.date ?? new Date();
  const ymd = date.toISOString().slice(0, 10);
  const log = logger.child({
    job: "daily-drop",
    ymd,
    triggeredBy: opts.triggeredBy ?? "unknown",
  });

  log.info("starting daily drop");

  // 1. Idempotency check
  const existing = await getBatchByDate(ymd);
  if (existing?.status === "done") {
    log.info("batch already done, skipping", { batchId: existing.id });
    return { status: "skipped_already_done", batchId: existing.id };
  }
  if (existing?.status === "running") {
    log.info("batch already running, skipping", { batchId: existing.id });
    return { status: "skipped_in_progress", batchId: existing.id };
  }

  // 2. Create or resume batch
  const batchId = existing?.id ?? newId();
  if (!existing) {
    await createBatch({ id: batchId, generationDate: ymd, status: "running" });
    log.info("created new batch", { batchId });
  } else {
    await updateBatch(batchId, { status: "running" });
    log.info("resumed failed batch", { batchId });
  }

  try {
    // 3. Pick themes
    const approvedProposals = await getApprovedProposalsForPicking(20);
    const picks = await openaiText.pickDailyThemes({
      curated: [...CURATED_THEMES],
      proposals: approvedProposals,
      count: 4,
      date: ymd,
    });
    log.info("picked themes", {
      picks: picks.map((p) => ({
        theme: p.theme,
        sourceProposalId: p.sourceProposalId,
      })),
    });

    // 4. Generate items
    const items: string[] = [];
    const animatedItems: string[] = [];
    const animateCount = env.ANIMATE_PER_BATCH;
    const usedProposalIds: string[] = [];

    for (let i = 0; i < picks.length; i++) {
      const pick = picks[i];
      if (!pick) {
        log.warn("skipped undefined pick", { index: i });
        continue;
      }

      const { theme, sourceProposalId } = pick;
      const itemStart = Date.now();
      const itemLog = log.child({ theme, index: i, sourceProposalId });

      try {
        // a. Expand prompt
        const { prompt } = await openaiText.expandPrompt({ theme });
        itemLog.info("expanded prompt", { promptLength: prompt.length });

        // b. Generate metadata
        const { title, shortDescription, tags } = await openaiText.generateMetadata({
          theme,
          prompt,
        });
        itemLog.info("generated metadata", { title, tags });

        // c. Generate image
        const { bytes, mimeType, revisedPrompt } = await openaiImage.generate({
          prompt,
        });
        itemLog.info("generated image", {
          bytes: bytes.length,
          mimeType,
        });

        // d. Upload to R2
        const key = `chibi/items/${ymd}/${newId()}.png`;
        const upload = await r2Storage.upload({
          key,
          body: bytes,
          contentType: mimeType,
        });
        itemLog.info("uploaded to R2", { key, publicUrl: upload.publicUrl });

        // e. Persist item
        const itemId = newId();
        const slug = newSlug(title);

        const thumbnail = await createThumbnail(Buffer.from(bytes));
        const thumbKey = `chibi/thumbnails/${ymd}/${itemId}.webp`;
        const thumbUpload = await r2Storage.upload({
          key: thumbKey,
          body: thumbnail.bytes,
          contentType: thumbnail.mimeType,
        });

        await createChibiItem({
          id: itemId,
          slug,
          batchId,
          sourceProposalId,
          title,
          theme,
          prompt,
          revisedPrompt,
          shortDescription,
          isAnimated: false,
          safetyLabel: "safe",
          publishedAt: new Date(),
        });
        await createChibiAsset({
          id: newId(),
          chibiItemId: itemId,
          assetType: "image",
          provider: "openai",
          storageKey: key,
          publicUrl: upload.publicUrl,
          mimeType,
          bytes: upload.bytes,
        });
        await createChibiAsset({
          id: newId(),
          chibiItemId: itemId,
          assetType: "thumbnail",
          provider: "openai",
          storageKey: thumbKey,
          publicUrl: thumbUpload.publicUrl,
          mimeType: thumbnail.mimeType,
          width: thumbnail.width,
          height: thumbnail.height,
          bytes: thumbUpload.bytes,
        });
        await attachTags(itemId, tags);

        items.push(itemId);

        if (sourceProposalId) {
          usedProposalIds.push(sourceProposalId);
        }

        // f. Queue animation if within quota
        if (i < animateCount) {
          const animationJobId = newId();
          await createJob({
            id: animationJobId,
            chibiItemId: itemId,
            jobType: "animation",
            status: "queued",
            provider: "fal",
            inputPayload: {
              imageUrl: upload.publicUrl,
              prompt,
              motionPrompt: "subtle motion, gentle kawaii animation",
            },
          });
          animatedItems.push(itemId);
          itemLog.info("queued animation", { animationJobId });
        }

        itemLog.info("item created", {
          itemId,
          elapsed: Date.now() - itemStart,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        itemLog.error("item failed", { error: errorMsg });

        await createJob({
          id: newId(),
          chibiItemId: null,
          jobType: "image",
          status: "failed",
          provider: "openai",
          errorMessage: errorMsg,
          inputPayload: { theme },
        });
      }
    }

    // 5. Update batch
    const expectedCount = picks.length;
    const { batchStatus, failedCount, partial } = resolveBatchOutcome(
      items.length,
      expectedCount,
    );

    await updateBatch(batchId, {
      status: batchStatus,
      itemCount: items.length,
      completedAt: batchStatus === "done" ? new Date() : null,
    });

    if (partial) {
      log.warn("daily drop completed with partial failures", {
        itemCount: items.length,
        expectedCount,
        failedCount,
      });
    }

    if (batchStatus === "failed") {
      const durationMs = Date.now() - start;
      log.error("daily drop produced no items", {
        expectedCount,
        failedCount,
        durationMs,
      });
      return {
        status: "failed",
        batchId,
        itemCount: 0,
        expectedCount,
        failedCount,
        error: "All item generations failed",
        durationMs,
      };
    }

    // 6. Mark proposals as used
    if (usedProposalIds.length > 0) {
      await markProposalsAsUsed(usedProposalIds);
      log.info("marked proposals as used", { count: usedProposalIds.length });
    }

    const durationMs = Date.now() - start;
    log.info("daily drop complete", {
      itemCount: items.length,
      animatedCount: animatedItems.length,
      durationMs,
    });

    return {
      status: "created",
      batchId,
      itemCount: items.length,
      expectedCount,
      failedCount,
      partial,
      animatedCount: animatedItems.length,
      themes: picks.map((p) => p.theme),
      durationMs,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await updateBatch(batchId, { status: "failed" });
    log.error("daily drop failed", { error: errorMsg });
    return { status: "failed", error: errorMsg };
  }
}
