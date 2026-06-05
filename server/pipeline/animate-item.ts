import { logger } from "@/lib/logger";
import { animationService } from "@/lib/ai";
import { getJob, updateJob, createChibiAsset, updateChibiItem } from "@/lib/db/queries";

export async function processAnimationJob(jobId: string): Promise<void> {
  const log = logger.child({ job: "animate-item", jobId });
  const job = await getJob(jobId);

  if (!job) {
    log.warn("job not found");
    return;
  }

  if (job.status !== "queued") {
    log.warn("job not in queued state", { status: job.status });
    return;
  }

  if (!job.chibiItemId) {
    log.error("job missing chibiItemId");
    await updateJob(jobId, {
      status: "failed",
      errorMessage: "Missing chibiItemId",
    });
    return;
  }

  await updateJob(jobId, { status: "running", startedAt: new Date() });
  log.info("processing animation job");

  try {
    const payload = job.inputPayload as {
      imageUrl?: string;
      prompt?: string;
      motionPrompt?: string;
    };

    if (!payload.imageUrl) {
      throw new Error("Missing imageUrl in inputPayload");
    }

    const result = await animationService.run(
      {
        imageUrl: payload.imageUrl,
        motionPrompt: payload.motionPrompt,
      },
      {
        storageKey: `chibi/animations/${job.chibiItemId}.mp4`,
      },
    );

    await createChibiAsset({
      chibiItemId: job.chibiItemId,
      assetType: "animation",
      provider: "fal",
      storageKey: `chibi/animations/${job.chibiItemId}.mp4`,
      publicUrl: result.videoUrl,
      mimeType: "video/mp4",
    });

    await updateChibiItem(job.chibiItemId, { isAnimated: true });
    await updateJob(jobId, {
      status: "succeeded",
      completedAt: new Date(),
      outputPayload: { publicUrl: result.videoUrl },
    });

    log.info("animation job succeeded", {
      chibiItemId: job.chibiItemId,
      publicUrl: result.videoUrl,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const attempts = (job.attempts ?? 0) + 1;

    if (attempts >= 3) {
      await updateJob(jobId, {
        status: "failed",
        errorMessage: errorMsg,
        attempts,
      });
      log.error("animation job failed permanently", {
        error: errorMsg,
        attempts,
      });
    } else {
      await updateJob(jobId, {
        status: "queued",
        errorMessage: errorMsg,
        attempts,
      });
      log.warn("animation job failed, will retry", {
        error: errorMsg,
        attempts,
      });
    }
  }
}
