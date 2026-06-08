import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GalleryPaginationProps {
  currentPage: number;
  totalPages: number;
  buildPageUrl: (page: number) => string;
  className?: string;
}

export function GalleryPagination({
  currentPage,
  totalPages,
  buildPageUrl,
  className,
}: GalleryPaginationProps) {
  if (totalPages <= 1) return null;

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <nav
      className={cn("mt-10 flex items-center justify-between gap-4", className)}
      aria-label="Gallery pagination"
    >
      {prevPage ? (
        <Button asChild variant="outline">
          <Link href={buildPageUrl(prevPage)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Link>
        </Button>
      ) : (
        <div />
      )}

      <p className="text-muted-foreground text-sm">
        Page {currentPage} of {totalPages}
      </p>

      {nextPage ? (
        <Button asChild variant="outline">
          <Link href={buildPageUrl(nextPage)}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <div />
      )}
    </nav>
  );
}
