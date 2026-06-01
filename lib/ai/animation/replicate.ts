import { requireServerEnv } from "@/lib/env";
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
 * Replicate implementation of AnimationService.
 *
 * Uses Replicate's REST API directly. The endpoint is the model `version`
 * hash (e.g. `stability-ai/stable-video-diffusion:xxxxx`), configurable
 * via `REPLICATE_ANIMATION_VERSION`. Default model is left for the env
 * to specify — Replicate's model ids change with each version bump.
 *
 * This implementation is intentionally minimal; it does not stream logs
 * or surface Replicate-specific metrics.
 */

const DEFAULT_TIMEOUT_MS = 180_000;
const DEFAULT_POLL_MS = 3_000;
const REPLICATE_API = "https://api.replicate.com/v1/predictions";

class ReplicateAnimationService implements AnimationService {
  async submit(input: AnimationInput): Promise<SubmittedAnimation> {
    const res = await fetch(REPLICATE_API, {
      method: "POST",
      headers: {
        Authorization: `Token ${requireServerEnv("REPLICATE_API_TOKEN")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: requireServerEnv("REPLICATE_ANIMATION_VERSION"),
        input: {
          input_image: input.imageUrl,
          ...(input.motionPrompt ? { prompt: input.motionPrompt } : {}),
          ...(input.seed !== undefined ? { seed: input.seed } : {}),
          ...(input.providerOptions ?? {}),
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Replicate submit failed: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as { id: string; status: string };
    return {
      providerJobId: data.id,
      status: replicateStatusToOurs(data.status),
    };
  }

  async getStatus(providerJobId: string): Promise<SubmittedAnimation> {
    const res = await fetch(`${REPLICATE_API}/${providerJobId}`, {
      headers: {
        Authorization: `Token ${requireServerEnv("REPLICATE_API_TOKEN")}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Replicate status failed: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as {
      id: string;
      status: string;
      output?: unknown;
    };
    const resultUrl = extractReplicateVideoUrl(data.output);
    return {
      providerJobId: data.id,
      status: replicateStatusToOurs(data.status),
      resultUrl,
    };
  }

  async run(input: AnimationInput, opts: RunOptions = {}): Promise<AnimationResult> {
    const start = Date.now();
    const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const pollIntervalMs = opts.pollIntervalMs ?? DEFAULT_POLL_MS;

    const { providerJobId } = await this.submit(input);
    const deadline = start + timeoutMs;

    let last: SubmittedAnimation | null = null;
    while (true) {
      if (Date.now() > deadline) {
        throw new Error(`Animation job ${providerJobId} timed out after ${timeoutMs}ms`);
      }
      last = await this.getStatus(providerJobId);
      if (last.status === "succeeded") break;
      if (last.status === "failed" || last.status === "canceled") {
        throw new Error(`Animation job ${providerJobId} ${last.status}`);
      }
      await sleep(pollIntervalMs);
    }

    const resultUrl = last?.resultUrl;
    if (!resultUrl) {
      throw new Error(`Animation job ${providerJobId} succeeded but no output URL`);
    }

    const key = opts.storageKey ?? `chibi/animations/${providerJobId}.mp4`;
    const uploaded = await r2Storage.uploadFromUrl({ key, url: resultUrl });

    return {
      videoUrl: uploaded.publicUrl,
      status: "succeeded",
      elapsedSeconds: (Date.now() - start) / 1000,
      providerJobId,
    };
  }
}

function replicateStatusToOurs(s: string): AnimationStatus {
  if (s === "starting" || s === "processing") return "running";
  if (s === "succeeded") return "succeeded";
  if (s === "failed") return "failed";
  if (s === "canceled") return "canceled";
  return "queued";
}

function extractReplicateVideoUrl(output: unknown): string | undefined {
  if (!output) return undefined;
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  if (typeof output === "object") {
    const o = output as Record<string, unknown>;
    if (typeof o.url === "string") return o.url;
    if (typeof o.video === "string") return o.video;
  }
  return undefined;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const replicateAnimation: AnimationService = new ReplicateAnimationService();
