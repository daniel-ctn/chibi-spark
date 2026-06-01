import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { env, requireServerEnv } from "@/lib/env";

import type {
  ObjectInfo,
  StorageBody,
  StorageService,
  UploadFromUrlInput,
  UploadInput,
  UploadResult,
} from "./service";

/**
 * R2 implementation of StorageService. Cloudflare R2 is S3-compatible, so
 * we use the official AWS S3 SDK pointed at the R2 endpoint with `auto`
 * as the region.
 *
 * The client is created lazily and cached, so the module is importable
 * without env vars configured. `requireServerEnv` runs the first time
 * a method is actually called.
 */

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${requireServerEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireServerEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireServerEnv("R2_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: true,
  });
  return _client;
}

function getBucket(): string {
  return requireServerEnv("R2_BUCKET_NAME");
}

function getPublicBase(): string {
  return requireServerEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
}

class R2StorageService implements StorageService {
  getPublicUrl(key: string): string {
    return `${getPublicBase()}/${key.replace(/^\/+/, "")}`;
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    const body = toAwsBody(input.body);
    const bytes = input.contentLength ?? input.body.byteLength;

    await getClient().send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: input.key,
        Body: body,
        ContentType: input.contentType,
        ContentLength: bytes,
        CacheControl: input.cacheControl ?? "public, max-age=31536000, immutable",
        Metadata: input.metadata,
      }),
    );

    return {
      key: input.key,
      publicUrl: this.getPublicUrl(input.key),
      bytes,
    };
  }

  async uploadFromUrl(input: UploadFromUrlInput): Promise<UploadResult> {
    const res = await fetch(input.url, {
      headers: input.headers,
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(
        `uploadFromUrl: fetch failed (${res.status} ${res.statusText}) for ${input.url}`,
      );
    }
    const arrayBuffer = await res.arrayBuffer();
    const body = Buffer.from(arrayBuffer);
    const contentType =
      input.contentType ?? res.headers.get("content-type") ?? "application/octet-stream";

    return this.upload({
      key: input.key,
      body,
      contentType,
      contentLength: body.length,
    });
  }

  async delete(key: string): Promise<void> {
    await getClient().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
  }

  async exists(key: string): Promise<boolean> {
    try {
      await getClient().send(new HeadObjectCommand({ Bucket: getBucket(), Key: key }));
      return true;
    } catch {
      return false;
    }
  }
}

function toAwsBody(body: StorageBody): Uint8Array {
  return body instanceof Uint8Array ? body : new Uint8Array(body);
}

export const r2Storage: StorageService = new R2StorageService();

/** Sanity helper used by smoke tests. */
export async function headObject(key: string): Promise<ObjectInfo | null> {
  try {
    const res = await getClient().send(
      new HeadObjectCommand({ Bucket: getBucket(), Key: key }),
    );
    return {
      key,
      publicUrl: r2Storage.getPublicUrl(key),
      bytes: res.ContentLength ?? 0,
      contentType: res.ContentType,
    };
  } catch {
    return null;
  }
}

// Re-export the env so storage consumers can read non-required knobs.
export const storageConfig = {
  publicBase: () => env.R2_PUBLIC_BASE_URL,
};
