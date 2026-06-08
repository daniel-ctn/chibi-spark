import type { GalleryItem } from "@/features/gallery/queries";

export interface ApiGalleryItem {
  id: string;
  slug: string;
  title: string;
  theme: string;
  description: string | null;
  isAnimated: boolean;
  publishedAt: string | null;
  viewCount: number;
  tags: Array<{ name: string; slug: string }>;
  assets: Array<{
    type: string;
    url: string;
    mimeType: string;
    width: number | null;
    height: number | null;
  }>;
}

export function serializeGalleryItem(item: GalleryItem): ApiGalleryItem {
  const { item: chibi, assets, tags } = item;

  return {
    id: chibi.id,
    slug: chibi.slug,
    title: chibi.title,
    theme: chibi.theme,
    description: chibi.shortDescription,
    isAnimated: chibi.isAnimated,
    publishedAt: chibi.publishedAt?.toISOString() ?? null,
    viewCount: chibi.viewCount,
    tags: tags.map((tag) => ({ name: tag.name, slug: tag.slug })),
    assets: assets.map((asset) => ({
      type: asset.assetType,
      url: asset.publicUrl,
      mimeType: asset.mimeType,
      width: asset.width,
      height: asset.height,
    })),
  };
}
