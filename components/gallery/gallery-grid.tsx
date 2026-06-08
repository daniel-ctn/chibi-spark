import { ChibiGrid } from "@/components/chibi/chibi-grid";
import { GalleryPagination } from "@/components/gallery/gallery-pagination";
import {
  GALLERY_PAGE_SIZE,
  getGalleryItemCount,
  getGalleryItems,
  type GalleryFilters,
} from "@/features/gallery/queries";

interface GalleryGridProps {
  filters: GalleryFilters;
  currentPage: number;
  buildPageUrl: (page: number) => string;
}

export async function GalleryGrid({ filters, currentPage, buildPageUrl }: GalleryGridProps) {
  const [items, total] = await Promise.all([
    getGalleryItems(filters),
    getGalleryItemCount(filters),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / GALLERY_PAGE_SIZE));

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
      <GalleryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildPageUrl={buildPageUrl}
      />
    </>
  );
}
