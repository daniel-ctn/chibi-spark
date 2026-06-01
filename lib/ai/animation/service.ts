/**
 * AnimationService — provider-agnostic interface for image-to-video
 * generation. Returns a permanent R2 URL via the `run()` method so
 * callers don't need to care whether the underlying provider is async
 * (Fal/Replicate) or sync (FFmpeg fallback).
 *
 * The `submit()` + `getStatus()` methods are exposed for fire-and-forget
 * workflows (e.g. a worker that picks jobs from a queue).
 */

export type AnimationStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";

export interface AnimationInput {
  /** Public URL of the still chibi to animate. */
  imageUrl: string;
  /** Short motion description. Falls back to "subtle motion" if omitted. */
  motionPrompt?: string;
  /** Target duration in seconds (3-10 typical). */
  durationSeconds?: number;
  /** Seed for reproducibility. */
  seed?: number;
  /** Provider-specific passthrough for things like negative_prompt, cfg_scale. */
  providerOptions?: Record<string, unknown>;
}

export interface SubmittedAnimation {
  providerJobId: string;
  status: AnimationStatus;
  /** Only set if the result is already ready (sync providers, cached, etc.). */
  resultUrl?: string;
}

export interface RunOptions {
  /** Total timeout in ms before giving up. Default 180_000 (3 min). */
  timeoutMs?: number;
  /** Interval between status polls in ms. Default 3_000. */
  pollIntervalMs?: number;
  /** Override the R2 storage key. */
  storageKey?: string;
}

export interface AnimationResult {
  /** Permanent public URL of the video (uploaded to R2). */
  videoUrl: string;
  status: Extract<AnimationStatus, "succeeded">;
  /** Wall-clock time the run took. */
  elapsedSeconds: number;
  /** Provider's job id (kept for tracking in generation_jobs). */
  providerJobId: string;
}

export interface AnimationService {
  /** Fire-and-forget submission. */
  submit(input: AnimationInput): Promise<SubmittedAnimation>;
  /** Poll a previously submitted job. */
  getStatus(providerJobId: string): Promise<SubmittedAnimation>;
  /** Submit, wait, fetch, and upload to permanent storage. */
  run(input: AnimationInput, opts?: RunOptions): Promise<AnimationResult>;
}
