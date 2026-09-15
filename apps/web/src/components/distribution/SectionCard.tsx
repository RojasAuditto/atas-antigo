import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionCardProps {
  title: ReactNode;
  note?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  action,
  children,
  className,
  contentClassName,
  note,
  title,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-4 sm:p-5",
        className,
      )}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {title}
          </h2>
          {note && <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>}
        </div>
        {action}
      </header>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
