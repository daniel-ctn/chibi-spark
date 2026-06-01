import { z } from "zod";

/**
 * ChibiDrop environment variables.
 *
 * Validation runs on the server at module load. Most secrets are typed as
 * optional so the build can pass without them configured; provider modules
 * call `requireServerEnv()` at construction time so misconfiguration throws
 * a clear error at the first real call instead of failing silently.
 *
 * To skip validation (e.g. CI build before secrets are set), export
 * `SKIP_ENV_VALIDATION=1`. Next.js's production-build phase also skips it.
 */

const envSchema = z.object({
  // Runtime
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Site
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),

  // Database
  DATABASE_URL: z.string().url().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_TEXT_MODEL: z.string().default("gpt-5.4-mini"),
  OPENAI_IMAGE_MODEL: z.string().default("gpt-image-1"),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET_NAME: z.string().default("chibidrop-assets"),
  R2_PUBLIC_BASE_URL: z.string().url().optional(),

  // Animation (Fal)
  FAL_KEY: z.string().min(1).optional(),
  FAL_ANIMATION_ENDPOINT: z
    .string()
    .default("fal-ai/kling-video/v1.6/standard/image-to-video"),
  ANIMATE_PER_BATCH: z.coerce.number().int().min(0).max(4).default(2),

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // Cloudflare Turnstile
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),

  // Cron
  CRON_SECRET: z.string().min(16).optional(),
});

export type Env = z.infer<typeof envSchema>;

const isServer = typeof window === "undefined";
const shouldSkipValidation =
  !isServer ||
  process.env.SKIP_ENV_VALIDATION === "1" ||
  process.env.SKIP_ENV_VALIDATION === "true" ||
  process.env.NEXT_PHASE === "phase-production-build";

const parsed = (() => {
  if (shouldSkipValidation) {
    return envSchema.partial().safeParse(process.env ?? {});
  }
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("\u274c Invalid environment variables:");
    for (const issue of result.error.issues) {
      const key = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      console.error(`  ${key}: ${issue.message}`);
    }
    throw new Error("Invalid environment variables. See logs above.");
  }
  return result;
})();

const data: Partial<Env> = parsed.success ? parsed.data : {};

export const env = data as Env;

/**
 * Throw a clear error if a required server env var is missing.
 * Use this at call-time (not module load) in provider modules so the build
 * can pass without all secrets configured.
 */
export function requireServerEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const value = env[key];
  if (value === undefined || value === null || value === "") {
    throw new Error(
      `Missing required env var: ${String(key)}. ` +
        `Set it in .env.local or your hosting provider.`,
    );
  }
  return value as NonNullable<Env[K]>;
}
