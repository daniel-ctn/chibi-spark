import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { GalleryItem } from "@/features/gallery/queries";
import { ChibiGrid } from "@/components/chibi/chibi-grid";

interface ChibiDetailProps {
  item: GalleryItem;
  relatedItems?: GalleryItem[];
}

export function ChibiDetail({ item, relatedItems = [] }: ChibiDetailProps) {
  const { item: chibi, assets, tags, sourceProposal } = item;
  const imageAsset = assets.find((a) => a.assetType === "image");
  const animationAsset = assets.find((a) => a.assetType === "animation");

  if (!imageAsset) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Image not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/gallery">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to gallery
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image/Animation Display */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={imageAsset.publicUrl}
                  alt={chibi.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </CardContent>
          </Card>

          {animationAsset && (
            <Card>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  <h3 className="font-semibold">Animation</h3>
                </div>
                <video
                  src={animationAsset.publicUrl}
                  controls
                  className="w-full rounded-lg"
                  poster={imageAsset.publicUrl}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{chibi.title}</h1>
            {chibi.shortDescription && (
              <p className="text-muted-foreground text-lg">{chibi.shortDescription}</p>
            )}
          </div>

          {tags.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link key={tag.id} href={`/gallery?tags=${tag.slug}`}>
                    <Badge
                      variant="secondary"
                      className="hover:bg-secondary/80 cursor-pointer"
                    >
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-2 font-semibold">Theme</h3>
            <p className="text-muted-foreground">{chibi.theme}</p>
          </div>

          {sourceProposal && (
            <div>
              <h3 className="mb-2 font-semibold">Community idea</h3>
              <p className="text-muted-foreground text-sm">
                Suggested by{" "}
                <span className="text-foreground font-medium">
                  {sourceProposal.nickname ?? "Anonymous"}
                </span>
                : &ldquo;{sourceProposal.ideaText}&rdquo;
              </p>
            </div>
          )}

          {chibi.prompt && (
            <div>
              <h3 className="mb-2 font-semibold">Prompt</h3>
              <p className="bg-muted rounded-lg p-3 text-sm">{chibi.prompt}</p>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold">Download</h3>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <a href={imageAsset.publicUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download image
                </a>
              </Button>
              {animationAsset && (
                <Button asChild variant="outline" className="w-full">
                  <a href={animationAsset.publicUrl} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download animation
                  </a>
                </Button>
              )}
            </div>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm">
                <strong className="text-primary">Free to use:</strong> All ChibiDrop
                content is free to download and use for any purpose. No attribution
                required.
              </p>
            </CardContent>
          </Card>

          <div className="text-muted-foreground text-xs">
            <p>
              Published:{" "}
              {chibi.publishedAt
                ? new Date(chibi.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Unknown"}
            </p>
            {chibi.viewCount > 0 && <p>Views: {chibi.viewCount}</p>}
          </div>
        </div>
      </div>

      {relatedItems.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">Related chibis</h2>
          <ChibiGrid items={relatedItems} />
        </section>
      )}
    </div>
  );
}
