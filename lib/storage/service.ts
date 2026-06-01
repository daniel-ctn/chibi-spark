/**
 * StorageService — the only interface the rest of the app should depend on.
 *
 * Swap implementations (R2, S3, GCS, local FS) by changing which module
 * provides `storage`. Page, pipeline, and feature code never imports the
 * R2 implementation directly.
 */

export type StorageBody = Buffer | Uint8Array;

export interface UploadInput {
  /** Object key inside the bucket, e.g. `chibi/2026-06-01/abc123.png`. */
  key: string;
  body: StorageBody;
  contentType: string;
  /** When known, lets the SDK send a single PUT instead of chunked. */
  contentLength?: number;
  /** Defaults to a long-lived immutable cache header. */
  cacheControl?: string;
  /** Stored alongside the object, retrievable via HEAD. */
  metadata?: Record<string, string>;
}

export interface UploadResult {
  key: string;
  publicUrl: string;
  bytes: number;
}

export interface UploadFromUrlInput {
  key: string;
  url: string;
  /** Overrides the response content-type. */
  contentType?: string;
  /** Pass through extra headers to the fetch call. */
  headers?: Record<string, string>;
}

export interface ObjectInfo {
  key: string;
  publicUrl: string;
  bytes: number;
  contentType?: string;
}

export interface StorageService {
  upload(input: UploadInput): Promise<UploadResult>;
  uploadFromUrl(input: UploadFromUrlInput): Promise<UploadResult>;
  getPublicUrl(key: string): string;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
