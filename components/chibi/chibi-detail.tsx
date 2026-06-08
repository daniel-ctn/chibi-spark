import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download, Play } from "lucide-react";

import { ChibiGrid } from "@/components/chibi/chibi-grid";
import { SectionHeading } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import type { GalleryItem } from "@/features/gallery/queries";
import { cn } from "@/lib/utils";

interface ChibiDetailProps {
  item: GalleryItem;
  relatedItems?: GalleryItem[];
}

function MetaBlock({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">
        {label}
      </p>
      <div>{children}</div>
    </div>
  );
}

export function ChibiDetail({ item, relatedItems = [] }: ChibiDetailProps) {
  const { item: chibi, assets, tags, sourceProposal } = item;
  const imageAsset = assets.find((a) => a.assetType === "image");
  const animationAsset = assets.find((a) => a.assetType === "animation");

  if (!imageAsset) {
    return (
      <div className="surface-inset flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Image not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <Button variant="ghost" asChild className="-ml-2 rounded-full">
        <Link href="/gallery">
          <ArrowLeft />
          Back to gallery
        </Link>
      </Button>

      <div className="grid gap-10 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="sticker-frame p-3">
            <div className="bg-surface-inset relative aspect-square overflow-hidden rounded-xl">
              <Image
                src={imageAsset.publicUrl}
                alt={chibi.title}
                fill
                className="object-contain p-2"
                sizes="(max-width: 1280px) 100vw, 60vw"
                priority
              />
            </div>
          </div>

          {animationAsset && (
            <div className="surface-panel p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <Play className="text-primary h-4 w-4" />
                <h2 className="font-display text-lg font-semibold">Animated clip</h2>
              </div>
              <video
                src={animationAsset.publicUrl}
                controls
                className="w-full rounded-xl"
                poster={imageAsset.publicUrl}
              />
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <p className="section-kicker">Chibi detail</p>
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {chibi.title}
            </h1>
            {chibi.shortDescription && (
              <p className="text-muted-foreground text-lg leading-relaxed">
                {chibi.shortDescription}
              </p>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild size="lg" className="w-full">
              <a href={imageAsset.publicUrl} download>
                <Download />
                Download image
              </a>
            </Button>
            {animationAsset && (
              <Button asChild size="lg" variant="outline" className="w-full">
                <a href={animationAsset.publicUrl} download>
                  <Download />
                  Download clip
                </a>
              </Button>
            )}
          </div>

          {tags.length > 0 && (
            <MetaBlock label="Tags">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/gallery?tags=${tag.slug}`}
                    className="pill-tag"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </MetaBlock>
          )}

          <MetaBlock label="Theme">
            <p className="text-muted-foreground leading-relaxed">{chibi.theme}</p>
          </MetaBlock>

          {sourceProposal && (
            <MetaBlock label="Community idea">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Suggested by{" "}
                <span className="text-foreground font-medium">
                  {sourceProposal.nickname ?? "Anonymous"}
                </span>
                : &ldquo;{sourceProposal.ideaText}&rdquo;
              </p>
            </MetaBlock>
          )}

          {chibi.prompt && (
            <MetaBlock label="Prompt">
              <p className="surface-inset text-muted-foreground rounded-xl p-4 text-sm leading-relaxed">
                {chibi.prompt}
              </p>
            </MetaBlock>
          )}

          <div className="surface-panel border-primary/15 bg-accent/40 p-4">
            <p className="text-sm leading-relaxed">
              <span className="text-primary font-semibold">Free to use.</span> Download
              and use for any purpose — personal, commercial, remix, whatever. No
              attribution required.
            </p>
          </div>

          <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span>
              Published{" "}
              {chibi.publishedAt
                ? new Date(chibi.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Unknown"}
            </span>
            {chibi.viewCount > 0 && <span>{chibi.viewCount.toLocaleString()} views</span>}
          </div>
        </div>
      </div>

      {relatedItems.length > 0 && (
        <section>
          <SectionHeading
            kicker="More like this"
            title="Related chibis"
            className="mb-6"
          />
          <ChibiGrid items={relatedItems} />
        </section>
      )}
    </div>
  );
}
