import { Skeleton } from "@/components/ui/skeleton";

export function ChibiCardSkeleton() {
  return (
    <div className="surface-panel p-2">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-2 px-2 pt-3 pb-1">
        <Skeleton className="h-5 w-3/4 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ChibiGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ChibiCardSkeleton key={i} />
      ))}
    </div>
  );
}
