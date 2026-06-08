"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("ErrorBoundary caught an error:", error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[400px] items-center justify-center py-12">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
          <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            We encountered an unexpected error. Please try again.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="bg-muted scrollbar-chibi mb-4 overflow-auto rounded p-3 text-left text-xs">
              {error.message}
            </pre>
          )}
          <Button onClick={reset}>Try again</Button>
        </CardContent>
      </Card>
    </div>
  );
}
