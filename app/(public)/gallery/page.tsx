import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChibiGrid } from "@/components/chibi/chibi-grid";
import {
  getGalleryItems,
  getAllTags,
  type GalleryFilters,
} from "@/features/gallery/queries";

interface GalleryPageProps {
  searchParams: Promise<{
    q?: string;
    tags?: string;
    animated?: string;
  }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const search = params.q || "";
  const selectedTags = params.tags ? params.tags.split(",") : [];
  const animatedOnly = params.animated === "true";

  const filters: GalleryFilters = {
    search: search || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    animatedOnly: animatedOnly || undefined,
    limit: 50,
  };

  const [items, allTags] = await Promise.all([getGalleryItems(filters), getAllTags()]);

  const buildFilterUrl = (baseParams: Record<string, string | undefined>) => {
    const url = new URLSearchParams();
    if (search) url.set("q", search);
    if (animatedOnly) url.set("animated", "true");

    const mergedTags = new Set(selectedTags);
    if (baseParams.addTag) mergedTags.add(baseParams.addTag);
    if (baseParams.removeTag) mergedTags.delete(baseParams.removeTag);
    if (baseParams.toggleAnimated !== undefined) {
      if (baseParams.toggleAnimated === "true") {
        url.set("animated", "true");
      } else {
        url.delete("animated");
      }
    }

    if (mergedTags.size > 0) {
      url.set("tags", Array.from(mergedTags).join(","));
    }

    const queryString = url.toString();
    return queryString ? `/gallery?${queryString}` : "/gallery";
  };

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Gallery</h1>
        <p className="text-muted-foreground">
          Browse all chibi drops. Free to download and use.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <form action="/gallery" method="GET">
            {selectedTags.length > 0 && (
              <input type="hidden" name="tags" value={selectedTags.join(",")} />
            )}
            {animatedOnly && <input type="hidden" name="animated" value="true" />}
            <Input
              name="q"
              placeholder="Search chibis..."
              defaultValue={search}
              className="pl-10"
            />
          </form>
        </div>

        <div className="flex flex-wrap gap-2">
          <a href={buildFilterUrl({ toggleAnimated: animatedOnly ? "false" : "true" })}>
            <Badge
              variant={animatedOnly ? "default" : "outline"}
              className="cursor-pointer"
            >
              Animated only
            </Badge>
          </a>
          {allTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.slug);
            return (
              <a
                key={tag.id}
                href={buildFilterUrl(
                  isSelected ? { removeTag: tag.slug } : { addTag: tag.slug },
                )}
              >
                <Badge
                  variant={isSelected ? "default" : "secondary"}
                  className="cursor-pointer"
                >
                  {tag.name}
                </Badge>
              </a>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <ChibiGrid items={items} />

      {items.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            {search || selectedTags.length > 0 || animatedOnly
              ? "No chibis match your filters. Try adjusting your search."
              : "No chibis yet. The first batch is on its way!"}
          </p>
        </div>
      )}
    </div>
  );
}
