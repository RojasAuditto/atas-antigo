import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  action,
  className,
  compact = false,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-dashed border-border bg-card text-center",
        compact ? "px-4 py-8" : "px-6 py-12",
        className,
      )}
    >
      {icon && (
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </section>
  );
}
