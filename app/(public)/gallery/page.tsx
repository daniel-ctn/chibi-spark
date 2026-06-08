import { Suspense } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ChibiGridSkeleton } from "@/components/chibi/chibi-card-skeleton";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { PageHeader } from "@/components/site/page-header";
import {
  GALLERY_PAGE_SIZE,
  getAllTags,
  type GalleryFilters,
} from "@/features/gallery/queries";
import { cn } from "@/lib/utils";

interface GalleryPageProps {
  searchParams: Promise<{
    q?: string;
    tags?: string;
    animated?: string;
    page?: string;
  }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const search = params.q || "";
  const selectedTags = params.tags ? params.tags.split(",") : [];
  const animatedOnly = params.animated === "true";
  const rawPage = Number(params.page ?? "1");
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const filters: GalleryFilters = {
    search: search || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    animatedOnly: animatedOnly || undefined,
    limit: GALLERY_PAGE_SIZE,
    offset: (currentPage - 1) * GALLERY_PAGE_SIZE,
  };

  const allTags = await getAllTags();

  const buildGalleryQuery = (opts: {
    page?: number;
    addTag?: string;
    removeTag?: string;
    toggleAnimated?: string;
  }) => {
    const url = new URLSearchParams();
    if (search) url.set("q", search);

    const mergedTags = new Set(selectedTags);
    if (opts.addTag) mergedTags.add(opts.addTag);
    if (opts.removeTag) mergedTags.delete(opts.removeTag);

    if (opts.toggleAnimated !== undefined) {
      if (opts.toggleAnimated === "true") {
        url.set("animated", "true");
      }
    } else if (animatedOnly) {
      url.set("animated", "true");
    }

    if (mergedTags.size > 0) {
      url.set("tags", Array.from(mergedTags).join(","));
    }

    const page = opts.page ?? 1;
    if (page > 1) {
      url.set("page", String(page));
    }

    const queryString = url.toString();
    return queryString ? `/gallery?${queryString}` : "/gallery";
  };

  const buildFilterUrl = (baseParams: Record<string, string | undefined>) =>
    buildGalleryQuery({
      page: 1,
      addTag: baseParams.addTag,
      removeTag: baseParams.removeTag,
      toggleAnimated: baseParams.toggleAnimated,
    });

  const buildPageUrl = (page: number) => buildGalleryQuery({ page });

  return (
    <div className="container-wide py-10 sm:py-12">
      <PageHeader
        kicker="Gallery"
        title="Every chibi, free to keep"
        description="Search the archive, filter by tags, and download anything you like."
      />

      <div className="surface-panel mb-8 space-y-4 p-4 sm:p-5">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
          <form action="/gallery" method="GET">
            {selectedTags.length > 0 && (
              <input type="hidden" name="tags" value={selectedTags.join(",")} />
            )}
            {animatedOnly && <input type="hidden" name="animated" value="true" />}
            <Input
              name="q"
              placeholder="Search by title, theme, or description..."
              defaultValue={search}
              className="pl-11"
            />
          </form>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={buildFilterUrl({ toggleAnimated: animatedOnly ? "false" : "true" })}
            className={cn("filter-chip", animatedOnly && "filter-chip-active")}
          >
            Animated only
          </a>
          {allTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.slug);
            return (
              <a
                key={tag.id}
                href={buildFilterUrl(
                  isSelected ? { removeTag: tag.slug } : { addTag: tag.slug },
                )}
                className={cn("filter-chip", isSelected && "filter-chip-active")}
              >
                {tag.name}
              </a>
            );
          })}
        </div>
      </div>

      <Suspense fallback={<ChibiGridSkeleton count={12} />}>
        <GalleryGrid
          filters={filters}
          currentPage={currentPage}
          buildPageUrl={buildPageUrl}
        />
      </Suspense>
    </div>
  );
}
