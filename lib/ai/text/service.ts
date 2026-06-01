/**
 * TextGenerationService — provider-agnostic interface for the language model
 * tasks ChibiDrop needs: prompt expansion, metadata generation, daily theme
 * selection, and content moderation.
 *
 * The pipeline and feature code only depend on this interface. Swap
 * implementations (OpenAI, Anthropic, local) by changing which module
 * provides `textService`.
 */

export interface ExpandedPrompt {
  /** A clean, image-model-ready prompt (no preamble, no negation). */
  prompt: string;
}

export interface ChibiMetadata {
  title: string;
  shortDescription: string;
  /** Lowercased tag words, e.g. ["wizard", "cat", "pastel"]. */
  tags: string[];
}

export type SafetyLabel = "safe" | "borderline" | "unsafe";

export interface SafetyClassification {
  label: SafetyLabel;
  /** One-line explanation, useful for logs and admin review. */
  reason?: string;
}

export interface PickDailyThemesInput {
  /** Curated default themes, safe picks. */
  curated: string[];
  /** User-submitted proposals that have already been approved as safe. */
  proposals: string[];
  /** How many themes to pick. */
  count: number;
  /** ISO date string for the drop, e.g. "2026-06-01". */
  date: string;
}

export interface TextGenerationService {
  /** Turn a short theme + optional style hints into a richer image prompt. */
  expandPrompt(input: { theme: string; hints?: string }): Promise<ExpandedPrompt>;

  /** Generate gallery metadata for a chibi (title, description, tags). */
  generateMetadata(input: { theme: string; prompt: string }): Promise<ChibiMetadata>;

  /** Pick a balanced set of themes for the day's batch. */
  pickDailyThemes(input: PickDailyThemesInput): Promise<string[]>;

  /** Classify free text for safety. Used to gate user-submitted proposals. */
  classifySafety(input: { text: string }): Promise<SafetyClassification>;
}
