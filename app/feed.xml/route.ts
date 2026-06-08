import { buildFeedItem, buildRssDocument } from "@/lib/feed/rss";
import { getGalleryItems } from "@/features/gallery/queries";
import { env } from "@/lib/env";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;
  const items = await getGalleryItems({ limit: 50 });

  const feedItems = items.map(({ item, assets }) => {
    const imageAsset =
      assets.find((a) => a.assetType === "image") ??
      assets.find((a) => a.assetType === "thumbnail");
    const animationAsset = assets.find((a) => a.assetType === "animation");
    const description = item.shortDescription ?? item.theme;
    const pubDate = item.publishedAt ?? item.createdAt;

    return buildFeedItem({
      title: item.title,
      link: `${baseUrl}/gallery/${item.slug}`,
      guid: `${baseUrl}/gallery/${item.slug}`,
      description,
      pubDate,
      enclosureUrl: animationAsset?.publicUrl ?? imageAsset?.publicUrl,
      enclosureType: animationAsset?.mimeType ?? imageAsset?.mimeType,
    });
  });

  const xml = buildRssDocument({
    title: `${SITE_NAME} — Daily Chibi Drops`,
    link: baseUrl,
    description: SITE_DESCRIPTION,
    items: feedItems,
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
