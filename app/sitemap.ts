import type { MetadataRoute } from "next";
import { desc, eq } from "drizzle-orm";

import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { chibiItems, dailyBatches } from "@/lib/db/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/propose`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const [items, batches] = await Promise.all([
      db
        .select({
          slug: chibiItems.slug,
          publishedAt: chibiItems.publishedAt,
        })
        .from(chibiItems)
        .orderBy(desc(chibiItems.publishedAt))
        .limit(5000),
      db
        .select({ generationDate: dailyBatches.generationDate })
        .from(dailyBatches)
        .where(eq(dailyBatches.status, "done"))
        .orderBy(desc(dailyBatches.generationDate))
        .limit(365),
    ]);

    const itemRoutes: MetadataRoute.Sitemap = items.map((item) => ({
      url: `${baseUrl}/gallery/${item.slug}`,
      lastModified: item.publishedAt ?? new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    const dropRoutes: MetadataRoute.Sitemap = batches.map((batch) => ({
      url: `${baseUrl}/drops/${batch.generationDate}`,
      lastModified: new Date(`${batch.generationDate}T12:00:00.000Z`),
      changeFrequency: "never",
      priority: 0.6,
    }));

    return [...staticRoutes, ...dropRoutes, ...itemRoutes];
  } catch {
    return staticRoutes;
  }
}
