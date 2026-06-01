import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";
import { generateImage } from "ai";

import { env, requireServerEnv } from "@/lib/env";

import type {
  GeneratedImage,
  ImageGenerationInput,
  ImageGenerationService,
} from "./service";

/**
 * OpenAI implementation of ImageGenerationService.
 *
 * Uses `gpt-image-1` (configurable via `OPENAI_IMAGE_MODEL`). The SDK
 * returns base64 PNG bytes which we surface as a `Uint8Array`.
 *
 * The provider client is created lazily so the module is importable
 * without env vars.
 */

class OpenAIImageService implements ImageGenerationService {
  private client: OpenAIProvider | null = null;

  private getClient(): OpenAIProvider {
    if (this.client) return this.client;
    this.client = createOpenAI({ apiKey: requireServerEnv("OPENAI_API_KEY") });
    return this.client;
  }

  private imageModel() {
    return this.getClient().image(env.OPENAI_IMAGE_MODEL);
  }

  async generate(input: ImageGenerationInput): Promise<GeneratedImage> {
    const { image, providerMetadata } = await generateImage({
      model: this.imageModel(),
      prompt: input.prompt,
      size: input.size ?? "1024x1024",
      seed: input.seed,
      providerOptions: {
        openai: {
          quality: "high",
          outputFormat: "png",
          moderation: "auto",
        },
      },
    });

    const metadata = providerMetadata?.openai as { revisedPrompt?: string } | undefined;

    return {
      bytes: image.uint8Array,
      mimeType: image.mediaType || "image/png",
      revisedPrompt: metadata?.revisedPrompt,
    };
  }
}

export const openaiImage: ImageGenerationService = new OpenAIImageService();
