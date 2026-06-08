import { ChibiCard } from "@/components/chibi/chibi-card";
import type { GalleryItem } from "@/features/gallery/queries";

interface ChibiGridProps {
  items: GalleryItem[];
  featuredFirst?: boolean;
}

export function ChibiGrid({ items, featuredFirst = false }: ChibiGridProps) {
  if (items.length === 0) {
    return (
      <div className="surface-inset flex min-h-[320px] items-center justify-center p-10 text-center">
        <p className="text-muted-foreground">No chibis found yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, index) => (
        <ChibiCard
          key={item.item.id}
          item={item}
          featured={featuredFirst && index === 0 && items.length > 1}
        />
      ))}
    </div>
  );
}
