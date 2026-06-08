import sharp from "sharp";

const THUMBNAIL_SIZE = 400;

export async function createThumbnail(
  imageBytes: Buffer,
  size = THUMBNAIL_SIZE,
): Promise<{ bytes: Buffer; mimeType: string; width: number; height: number }> {
  const output = await sharp(imageBytes)
    .resize(size, size, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  return {
    bytes: output.data,
    mimeType: "image/webp",
    width: output.info.width,
    height: output.info.height,
  };
}
