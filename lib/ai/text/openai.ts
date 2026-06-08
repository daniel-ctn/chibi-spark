import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

import { env, requireServerEnv } from "@/lib/env";

import type {
  ChibiMetadata,
  ExpandedPrompt,
  PickDailyThemesInput,
  PickedTheme,
  SafetyClassification,
  TextGenerationService,
} from "./service";

/**
 * OpenAI implementation of TextGenerationService.
 *
 * Uses `generateObject` with Zod schemas for structured output. The model
 * id is read from `OPENAI_TEXT_MODEL` (defaults to `gpt-5.4-mini`).
 *
 * The provider client is created lazily so the module is importable
 * without env vars. `requireServerEnv` throws at first use if the key
 * is missing.
 */

const expandPromptSchema = z.object({
  prompt: z.string().min(40, "prompt too short").max(1500, "prompt too long"),
});

const metadataSchema = z.object({
  title: z.string().min(3).max(80),
  shortDescription: z.string().min(10).max(280),
  tags: z.array(z.string().min(2).max(24)).min(2).max(6),
});

const pickThemesSchema = z.object({
  picks: z
    .array(
      z.object({
        theme: z.string().min(2).max(80),
        sourceProposalId: z.string().nullable(),
      }),
    )
    .min(1)
    .max(8),
});

const safetySchema = z.object({
  label: z.enum(["safe", "borderline", "unsafe"]),
  reason: z.string().max(240).optional(),
});

const SYSTEM_PROMPT = `You are a careful assistant for a public, all-ages chibi art app.
Never produce content that is sexual, hateful, depicts minors in unsafe
contexts, encourages self-harm, or references real public figures. If a
request would lead to such content, refuse it and explain briefly.`;

class OpenAITextService implements TextGenerationService {
  private client: OpenAIProvider | null = null;

  private getClient(): OpenAIProvider {
    if (this.client) return this.client;
    this.client = createOpenAI({ apiKey: requireServerEnv("OPENAI_API_KEY") });
    return this.client;
  }

  private textModel() {
    return this.getClient().responses(env.OPENAI_TEXT_MODEL);
  }

  async expandPrompt(input: { theme: string; hints?: string }): Promise<ExpandedPrompt> {
    const { object } = await generateObject({
      model: this.textModel(),
      schema: expandPromptSchema,
      system: `${SYSTEM_PROMPT}\n\nYou write single, clean image-generation prompts for a chibi art style. Output ONLY the prompt text.`,
      prompt: [
        `Theme: ${input.theme}`,
        input.hints ? `Style hints: ${input.hints}` : null,
        `Expand this into one concise chibi image prompt.`,
        `Requirements: chibi proportions (oversized head, big eyes, small body),`,
        `kawaii aesthetic, soft pastel palette, simple clean background,`,
        `no text or watermarks, no real people, no logos.`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
    return { prompt: object.prompt };
  }

  async generateMetadata(input: {
    theme: string;
    prompt: string;
  }): Promise<ChibiMetadata> {
    const { object } = await generateObject({
      model: this.textModel(),
      schema: metadataSchema,
      system: `${SYSTEM_PROMPT}\n\nYou write short, tasteful gallery metadata.`,
      prompt: [
        `Generate gallery metadata for a chibi image.`,
        ``,
        `Theme: ${input.theme}`,
        `Prompt: ${input.prompt}`,
        ``,
        `Return:`,
        `- a short, catchy title (max 60 chars)`,
        `- a one-sentence description (max 240 chars)`,
        `- 3-6 short tag words (lowercase, no spaces, kebab-case friendly)`,
      ].join("\n"),
    });
    return object;
  }

  async pickDailyThemes(input: PickDailyThemesInput): Promise<PickedTheme[]> {
    const proposalIds = new Set(input.proposals.map((p) => p.id));

    const { object } = await generateObject({
      model: this.textModel(),
      schema: pickThemesSchema,
      system: `${SYSTEM_PROMPT}\n\nYou pick a small, varied set of cute chibi themes.`,
      prompt: [
        `Pick exactly ${input.count} themes for the chibi drop on ${input.date}.`,
        ``,
        `Curated defaults (cute, safe, broad appeal):`,
        ...input.curated.map((t) => `- ${t}`),
        ``,
        `User proposals (already approved as safe):`,
        ...(input.proposals.length
          ? input.proposals.map((p) => `- [id: ${p.id}] ${p.ideaText}`)
          : ["(none this round)"]),
        ``,
        `Mix curated and user proposals so the drop feels fresh.`,
        `Return exactly ${input.count} picks. For each pick:`,
        `- "theme": a short chibi theme string`,
        `- "sourceProposalId": the proposal id if based on a user proposal, otherwise null`,
      ].join("\n"),
    });

    return object.picks.slice(0, input.count).map((pick) => ({
      theme: pick.theme,
      sourceProposalId:
        pick.sourceProposalId && proposalIds.has(pick.sourceProposalId)
          ? pick.sourceProposalId
          : null,
    }));
  }

  async classifySafety(input: { text: string }): Promise<SafetyClassification> {
    const { object } = await generateObject({
      model: this.textModel(),
      schema: safetySchema,
      system: `${SYSTEM_PROMPT}\n\nYou classify user-submitted text for safety on an all-ages chibi art app.`,
      prompt: [
        `Classify the following text. Return "safe" if it could plausibly`,
        `be turned into cute chibi art, "borderline" if it is edgy but`,
        `might be OK with sanitization, and "unsafe" if it contains hate,`,
        `sexual content, real-person references, or anything clearly`,
        `inappropriate for a public all-ages app.`,
        ``,
        `Text: ${input.text}`,
      ].join("\n"),
    });
    return object;
  }
}

export const openaiText: TextGenerationService = new OpenAITextService();
