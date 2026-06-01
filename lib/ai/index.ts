// Barrel — single import for the default text + image services.
// Importing this file does not trigger any provider initialization;
// the underlying clients are created on first use.

export { openaiText } from "./text/openai";
export { openaiImage } from "./image/openai";

export type {
  TextGenerationService,
  ChibiMetadata,
  ExpandedPrompt,
  PickDailyThemesInput,
  SafetyClassification,
  SafetyLabel,
} from "./text/service";

export type {
  ImageGenerationService,
  ImageGenerationInput,
  GeneratedImage,
  ImageSize,
} from "./image/service";
