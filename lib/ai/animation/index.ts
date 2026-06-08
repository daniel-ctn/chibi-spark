// Barrel — default animation service is Fal.ai. Swap by changing this export.

export { falAnimation } from "./fal";
export { replicateAnimation } from "./replicate";
export { ffmpegAnimation } from "./ffmpeg";
export { failoverAnimation } from "./failover";

import type { AnimationService } from "./service";
import { failoverAnimation } from "./failover";

export const animationService: AnimationService = failoverAnimation;

export type {
  AnimationService,
  AnimationInput,
  AnimationResult,
  AnimationStatus,
  RunOptions,
  SubmittedAnimation,
} from "./service";
