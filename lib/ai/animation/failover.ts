import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

import { falAnimation } from "./fal";
import { replicateAnimation } from "./replicate";

import type {
  AnimationInput,
  AnimationResult,
  AnimationService,
  RunOptions,
  SubmittedAnimation,
} from "./service";

function isReplicateConfigured(): boolean {
  return Boolean(env.REPLICATE_API_TOKEN && env.REPLICATE_ANIMATION_VERSION);
}

function buildProviderChain(): AnimationService[] {
  const providers: AnimationService[] = [falAnimation];
  if (isReplicateConfigured()) {
    providers.push(replicateAnimation);
  }
  return providers;
}

class FailoverAnimationService implements AnimationService {
  private readonly providers = buildProviderChain();
  private readonly log = logger.child({ service: "animation-failover" });

  async submit(input: AnimationInput): Promise<SubmittedAnimation> {
    return this.providers[0]!.submit(input);
  }

  async getStatus(providerJobId: string): Promise<SubmittedAnimation> {
    return this.providers[0]!.getStatus(providerJobId);
  }

  async run(input: AnimationInput, opts?: RunOptions): Promise<AnimationResult> {
    let lastError: unknown;

    for (const provider of this.providers) {
      try {
        const result = await provider.run(input, opts);
        this.log.info("animation provider succeeded", {
          providerJobId: result.providerJobId,
        });
        return result;
      } catch (error) {
        lastError = error;
        this.log.warn("animation provider failed, trying next", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("All animation providers failed");
  }
}

export const failoverAnimation: AnimationService = new FailoverAnimationService();
