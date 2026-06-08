import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChibiDetail } from "@/components/chibi/chibi-detail";
import { getChibiBySlug, getRelatedItems } from "@/features/gallery/queries";
import { incrementChibiViewCount } from "@/lib/db/queries/chibi-items";

interface DetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getChibiBySlug(slug);

  if (!item) {
    return { title: "Not found" };
  }

  const { item: chibi, assets } = item;
  const imageAsset = assets.find((a) => a.assetType === "image");
  const description = chibi.shortDescription ?? chibi.theme;

  return {
    title: chibi.title,
    description,
    openGraph: {
      title: chibi.title,
      description,
      type: "article",
      ...(imageAsset
        ? { images: [{ url: imageAsset.publicUrl, alt: chibi.title }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: chibi.title,
      description,
      ...(imageAsset ? { images: [imageAsset.publicUrl] } : {}),
    },
  };
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const item = await getChibiBySlug(slug);

  if (!item) {
    notFound();
  }

  const relatedItems = await getRelatedItems(slug);
  await incrementChibiViewCount(slug);

  return (
    <div className="container-wide py-10 sm:py-12">
      <ChibiDetail item={item} relatedItems={relatedItems} />
    </div>
  );
}
