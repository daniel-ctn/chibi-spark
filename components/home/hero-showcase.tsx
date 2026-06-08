import Image from "next/image";

import type { GalleryItem } from "@/features/gallery/queries";
import { HERO_SHOWCASE_ITEMS, type HeroShowcaseItem } from "@/lib/hero-showcase";
import { cn } from "@/lib/utils";

const COLLAGE_LAYOUT = [
  "left-[2%] top-[4%] z-10 w-[46%] -rotate-6",
  "right-[0%] top-[8%] z-20 w-[48%] rotate-5",
  "bottom-[6%] left-[4%] z-[15] w-[44%] rotate-4",
  "right-[6%] bottom-[2%] z-30 w-[50%] -rotate-3",
] as const;

function galleryToShowcase(items: GalleryItem[]): HeroShowcaseItem[] {
  return items
    .map((entry) => {
      const imageAsset =
        entry.assets.find((a) => a.assetType === "thumbnail") ??
        entry.assets.find((a) => a.assetType === "image");

      if (!imageAsset) {
        return null;
      }

      return {
        src: imageAsset.publicUrl,
        title: entry.item.title,
        tag: entry.tags[0]?.name ?? "Gallery pick",
        className: "",
      };
    })
    .filter((item): item is Omit<HeroShowcaseItem, "className"> & { className: string } =>
      Boolean(item),
    )
    .slice(0, 4)
    .map((item, index) => ({
      ...item,
      className: COLLAGE_LAYOUT[index] ?? COLLAGE_LAYOUT[0],
    }));
}

interface HeroShowcaseProps {
  galleryItems?: GalleryItem[];
  className?: string;
}

export function HeroShowcase({ galleryItems, className }: HeroShowcaseProps) {
  const mappedGallery = galleryItems ? galleryToShowcase(galleryItems) : [];
  const useGallery = mappedGallery.length >= 4;
  const items = useGallery ? mappedGallery : HERO_SHOWCASE_ITEMS;

  return (
    <div className={cn("relative mx-auto w-full max-w-lg lg:max-w-none", className)}>
      <div className="relative aspect-[4/5] min-h-[320px] sm:min-h-[380px] lg:min-h-[440px]">
        {items.map((item) => (
          <figure
            key={`${item.src}-${item.title}`}
            className={cn(
              "sticker-frame absolute transition-transform duration-500 ease-out hover:z-40 hover:scale-[1.03]",
              item.className,
            )}
          >
            <div className="bg-surface-inset relative aspect-square overflow-hidden rounded-xl">
              <Image
                src={item.src}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 45vw, 240px"
                priority
              />
            </div>
            <figcaption className="space-y-1 px-2 pt-2 pb-1">
              <p className="font-display line-clamp-1 text-sm font-semibold tracking-tight">
                {item.title}
              </p>
              <span className="pill-tag">{item.tag}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="text-muted-foreground mt-4 text-center text-xs sm:text-left">
        {useGallery
          ? "Live picks from the gallery."
          : "Sample chibis — your daily drops will look like this."}
      </p>
    </div>
  );
}
