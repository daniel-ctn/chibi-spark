// Barrel — single import for the default text + image + animation services.
// Importing this file does not trigger any provider initialization;
// the underlying clients are created on first use.

export { openaiText } from "./text/openai";
export { openaiImage } from "./image/openai";
export { animationService } from "./animation";
export { falAnimation, replicateAnimation, ffmpegAnimation } from "./animation";

export type {
  TextGenerationService,
  ChibiMetadata,
  ExpandedPrompt,
  PickDailyThemesInput,
  PickedTheme,
  ProposalForPicking,
  SafetyClassification,
  SafetyLabel,
} from "./text/service";

export type {
  ImageGenerationService,
  ImageGenerationInput,
  GeneratedImage,
  ImageSize,
} from "./image/service";

export type {
  AnimationService,
  AnimationInput,
  AnimationResult,
  AnimationStatus,
  RunOptions,
  SubmittedAnimation,
} from "./animation/service";
