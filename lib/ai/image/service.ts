/**
 * ImageGenerationService — provider-agnostic interface for the still-image
 * generation step. Returns a single image as bytes (plus the provider's
 * revised prompt when available). The pipeline uploads the bytes to
 * permanent storage and persists the publicUrl.
 */

export type ImageSize = `${number}x${number}`;

export interface GeneratedImage {
  /** Raw image bytes (PNG or whatever the model produced). */
  bytes: Uint8Array;
  /** IANA media type, e.g. "image/png". */
  mimeType: string;
  /** Provider's revised prompt, if the model rewrote it. */
  revisedPrompt?: string;
}

export interface ImageGenerationInput {
  /** Expanded image prompt (chibi-style, no preamble). */
  prompt: string;
  /** WxH, e.g. "1024x1024". Defaults to "1024x1024". */
  size?: ImageSize;
  /** Optional seed for reproducibility. */
  seed?: number;
}

export interface ImageGenerationService {
  generate(input: ImageGenerationInput): Promise<GeneratedImage>;
}
