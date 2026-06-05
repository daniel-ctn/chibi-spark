import { ChibiCard } from "@/components/chibi/chibi-card";
import type { GalleryItem } from "@/features/gallery/queries";

interface ChibiGridProps {
  items: GalleryItem[];
}

export function ChibiGrid({ items }: ChibiGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">No chibis found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ChibiCard key={item.item.id} item={item} />
      ))}
    </div>
  );
}
