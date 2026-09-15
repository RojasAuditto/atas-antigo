import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface DetailHeroProps {
  icon: ReactNode;
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  status: ReactNode;
  className?: string;
}

export function DetailHero({
  className,
  description,
  eyebrow,
  icon,
  status,
  title,
}: DetailHeroProps) {
  return (
    <section
      className={cn(
        "mb-4 flex items-center gap-4 rounded-3xl border border-primary/15 bg-[hsl(var(--hub-blue)/.045)] p-5",
        className,
      )}
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-1 truncate text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{status}</div>
    </section>
  );
}
