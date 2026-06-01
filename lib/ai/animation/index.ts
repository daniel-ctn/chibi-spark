// Barrel — default animation service is Fal.ai. Swap by changing this export.

export { falAnimation } from "./fal";
export { replicateAnimation } from "./replicate";
export { ffmpegAnimation } from "./ffmpeg";

import type { AnimationService } from "./service";
import { falAnimation } from "./fal";

export const animationService: AnimationService = falAnimation;

export type {
  AnimationService,
  AnimationInput,
  AnimationResult,
  AnimationStatus,
  RunOptions,
  SubmittedAnimation,
} from "./service";
