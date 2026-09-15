import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ actions, className, eyebrow, subtitle, title }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-start",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
            {eyebrow}
          </div>
        )}
        <h1 className="m-0 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
