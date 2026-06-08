"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { GalleryItem } from "@/features/gallery/queries";

interface ChibiCardProps {
  item: GalleryItem;
}

export function ChibiCard({ item }: ChibiCardProps) {
  const { item: chibi, assets, tags } = item;
  const imageAsset =
    assets.find((a) => a.assetType === "thumbnail") ??
    assets.find((a) => a.assetType === "image");
  const animationAsset = assets.find((a) => a.assetType === "animation");
  const displayTags = tags.slice(0, 3);
  const [hovering, setHovering] = useState(false);

  if (!imageAsset) {
    return null;
  }

  const showAnimation = hovering && Boolean(animationAsset);

  return (
    <Link href={`/gallery/${chibi.slug}`}>
      <Card
        className="group overflow-hidden transition-all hover:shadow-lg"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="relative aspect-square overflow-hidden">
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
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          {chibi.isAnimated && (
            <div className="absolute top-2 right-2">
              <Badge className="gap-1 bg-black/70 text-white hover:bg-black/80">
                <Play className="h-3 w-3 fill-current" />
                Animated
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold">{chibi.title}</h3>
          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {displayTags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
