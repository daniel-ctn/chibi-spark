import { createFalClient, type FalClient, type QueueStatus } from "@fal-ai/client";

import { env, requireServerEnv } from "@/lib/env";
import { r2Storage } from "@/lib/storage/r2";

import type {
  AnimationInput,
  AnimationResult,
  AnimationService,
  AnimationStatus,
  RunOptions,
  SubmittedAnimation,
} from "./service";

/**
 * Default AnimationService implementation — Fal.ai image-to-video.
 *
 * Uses the v1 `createFalClient` API (no global state), the `queue.submit`
 * + `queue.status` + `queue.result` trio for full control, and uploads
 * the resulting MP4 to R2 for permanence.
 *
 * Configurable endpoint via `FAL_ANIMATION_ENDPOINT`. Default is Kling
 * 1.6 standard i2v.
 */

const DEFAULT_TIMEOUT_MS = 180_000;
const DEFAULT_POLL_MS = 3_000;

class FalAnimationService implements AnimationService {
  private client: FalClient | null = null;

  private getClient(): FalClient {
    if (this.client) return this.client;
    this.client = createFalClient({ credentials: requireServerEnv("FAL_KEY") });
    return this.client;
  }

  private getEndpoint(): string {
    return requireServerEnv("FAL_ANIMATION_ENDPOINT");
  }

  private buildInput(input: AnimationInput): Record<string, unknown> {
    return {
      image_url: input.imageUrl,
      prompt: input.motionPrompt ?? "subtle motion, gentle kawaii animation",
      duration: String(input.durationSeconds ?? 5),
      ...(input.seed !== undefined ? { seed: input.seed } : {}),
      ...(input.providerOptions ?? {}),
    };
  }

  async submit(input: AnimationInput): Promise<SubmittedAnimation> {
    const queued = await this.getClient().queue.submit(this.getEndpoint(), {
      input: this.buildInput(input),
    });
    return {
      providerJobId: queued.request_id,
      status: toOurStatus(queued.status),
    };
  }

  async getStatus(providerJobId: string): Promise<SubmittedAnimation> {
    const status: QueueStatus = await this.getClient().queue.status(this.getEndpoint(), {
      requestId: providerJobId,
    });
    return {
      providerJobId,
      status: toOurStatus(status.status),
    };
  }

  async run(input: AnimationInput, opts: RunOptions = {}): Promise<AnimationResult> {
    const start = Date.now();
    const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const pollIntervalMs = opts.pollIntervalMs ?? DEFAULT_POLL_MS;

    const client = this.getClient();
    const endpoint = this.getEndpoint();

    const queued = await client.queue.submit(endpoint, {
      input: this.buildInput(input),
    });
    const requestId = queued.request_id;

    const deadline = start + timeoutMs;
    while (true) {
      if (Date.now() > deadline) {
        throw new Error(`Animation job ${requestId} timed out after ${timeoutMs}ms`);
      }
      const status: QueueStatus = await client.queue.status(endpoint, {
        requestId,
      });
      switch (status.status) {
        case "IN_QUEUE":
        case "IN_PROGRESS":
          await sleep(pollIntervalMs);
          continue;
        case "COMPLETED":
          break;
      }
      break;
    }

    const result = await client.queue.result(endpoint, { requestId });
    const videoUrl = extractVideoUrl(result);
    if (!videoUrl) {
      throw new Error(
        `Animation job ${requestId} completed but no video URL was returned`,
      );
    }

    const key = opts.storageKey ?? `chibi/animations/${requestId}.mp4`;
    const uploaded = await r2Storage.uploadFromUrl({ key, url: videoUrl });

    return {
      videoUrl: uploaded.publicUrl,
      status: "succeeded",
      elapsedSeconds: (Date.now() - start) / 1000,
      providerJobId: requestId,
    };
  }
}

function toOurStatus(s: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED"): AnimationStatus {
  if (s === "IN_QUEUE") return "queued";
  if (s === "IN_PROGRESS") return "running";
  return "succeeded";
}

function extractVideoUrl(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  const r = result as Record<string, unknown>;
  const data = r.data as Record<string, unknown> | undefined;
  const video = (data?.video ?? r.video) as Record<string, unknown> | undefined;
  return (video?.url as string | undefined) ?? undefined;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const falAnimation: AnimationService = new FalAnimationService();

/** Exposed so the default provider in `index.ts` can read the env knob. */
export const falConfig = {
  endpoint: () => env.FAL_ANIMATION_ENDPOINT,
};
