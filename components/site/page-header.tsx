import { cn } from "@/lib/utils";

interface PageHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  kicker,
  title,
  description,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-3">
        {kicker && <p className="section-kicker">{kicker}</p>}
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-base leading-relaxed text-pretty sm:text-lg">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeading({
  kicker,
  title,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        {kicker && <p className="section-kicker">{kicker}</p>}
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        {description && (
          <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
