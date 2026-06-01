import type { AnimationService } from "./service";

/**
 * FFmpeg fallback — NOT IMPLEMENTED in v1.
 *
 * Intended to be a documented escape hatch for environments where paid
 * i2v providers are unavailable or too expensive. A v1 implementation
 * would:
 *
 *   1. Download the still image.
 *   2. Run a Ken Burns / zoom-pan filter via `@ffmpeg-installer/ffmpeg`
 *      (e.g. `zoompan=z='min(zoom+0.0015,1.5)':d=125:s=1024x1024`).
 *   3. Upload the resulting MP4 to R2 and return the publicUrl.
 *
 * For now, every method throws to make the gap obvious. The method
 * shapes satisfy the AnimationService interface; the bodies never
 * actually look at the arguments.
 */
class FfmpegAnimationService implements AnimationService {
  private notImplemented(): never {
    throw new Error(
      "FfmpegAnimationService is not implemented in v1. " +
        "Use Fal (default) or Replicate instead.",
    );
  }

  submit: AnimationService["submit"] = () => this.notImplemented();
  getStatus: AnimationService["getStatus"] = () => this.notImplemented();
  run: AnimationService["run"] = () => this.notImplemented();
}

export const ffmpegAnimation: AnimationService = new FfmpegAnimationService();
