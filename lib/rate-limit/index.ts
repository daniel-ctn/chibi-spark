import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

let redis: Redis | null = null;
let hourlyLimit: Ratelimit | null = null;
let dailyLimit: Ratelimit | null = null;

function initRateLimit() {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });

    hourlyLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "proposals:hourly",
      analytics: true,
    });

    dailyLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 d"),
      prefix: "proposals:daily",
      analytics: true,
    });
  }

  return { hourlyLimit, dailyLimit };
}

export async function checkRateLimit(
  identifier: string,
): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
  const limits = initRateLimit();

  if (!limits) {
    return { allowed: true };
  }

  try {
    if (!limits || !limits.hourlyLimit || !limits.dailyLimit) {
      return { allowed: true };
    }

    const hourlyResult = await limits.hourlyLimit.limit(identifier);
    if (!hourlyResult.success) {
      return {
        allowed: false,
        reason: "Too many proposals. Please wait an hour before trying again.",
        remaining: hourlyResult.remaining,
      };
    }

    const dailyResult = await limits.dailyLimit.limit(identifier);
    if (!dailyResult.success) {
      return {
        allowed: false,
        reason: "Daily proposal limit reached. Please try again tomorrow.",
        remaining: dailyResult.remaining,
      };
    }

    return {
      allowed: true,
      remaining: Math.min(hourlyResult.remaining, dailyResult.remaining),
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true };
  }
}
