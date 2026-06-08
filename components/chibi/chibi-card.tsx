"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

import type { GalleryItem } from "@/features/gallery/queries";
import { cn } from "@/lib/utils";

interface ChibiCardProps {
  item: GalleryItem;
  featured?: boolean;
}

export function ChibiCard({ item, featured = false }: ChibiCardProps) {
  const { item: chibi, assets, tags } = item;
  const imageAsset =
    assets.find((a) => a.assetType === "thumbnail") ??
    assets.find((a) => a.assetType === "image");
  const animationAsset = assets.find((a) => a.assetType === "animation");
  const displayTags = tags.slice(0, 2);
  const [hovering, setHovering] = useState(false);

  if (!imageAsset) {
    return null;
  }

  const showAnimation = hovering && Boolean(animationAsset);

  return (
    <Link
      href={`/gallery/${chibi.slug}`}
      className={cn("group block", featured && "sm:col-span-2 lg:col-span-2")}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <article className="sticker-frame h-full">
        <div
          className={cn(
            "bg-surface-inset relative overflow-hidden rounded-xl",
            featured ? "aspect-[16/10]" : "aspect-square",
          )}
        >
          {showAnimation && animationAsset ? (
            <video
              src={animationAsset.publicUrl}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
              poster={imageAsset.publicUrl}
            />
          ) : (
            <Image
              src={imageAsset.publicUrl}
              alt={chibi.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes={
                featured
                  ? "(max-width: 768px) 100vw, 50vw"
                  : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              }
            />
          )}

          {chibi.isAnimated && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
              <Play className="h-3 w-3 fill-current" />
              Motion
            </span>
          )}
        </div>

        <div className="space-y-2 px-2 pt-3 pb-1">
          <h3
            className={cn(
              "font-display line-clamp-1 font-semibold tracking-tight",
              featured ? "text-xl" : "text-base",
            )}
          >
            {chibi.title}
          </h3>

          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {displayTags.map((tag) => (
                <span key={tag.id} className="pill-tag">
                  {tag.name}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-muted-foreground text-[11px]">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
