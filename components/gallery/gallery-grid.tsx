import { ChibiGrid } from "@/components/chibi/chibi-grid";
import { getGalleryItems, type GalleryFilters } from "@/features/gallery/queries";

interface GalleryGridProps {
  filters: GalleryFilters;
}

export async function GalleryGrid({ filters }: GalleryGridProps) {
  const items = await getGalleryItems(filters);

  return (
    <>
      <ChibiGrid items={items} />
      {items.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            {filters.search || filters.tags || filters.animatedOnly
              ? "No chibis match your filters. Try adjusting your search."
              : "No chibis yet. The first batch is on its way!"}
          </p>
        </div>
      )}
    </>
  );
}
