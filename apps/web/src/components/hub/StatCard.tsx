import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { HUB_TONE_CLASSES, type HubTone } from "./tone";

interface StatCardProps {
  label: string;
  value: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  tone?: HubTone;
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  topRight?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const VALUE_SIZE = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
} as const;

export function StatCard({
  children,
  className,
  description,
  icon,
  label,
  size = "md",
  subtitle,
  tone = "blue",
  topRight,
  value,
}: StatCardProps) {
  const classes = HUB_TONE_CLASSES[tone];

  return (
    <section
      className={cn(
        "relative min-w-0 overflow-hidden rounded-3xl border p-4 sm:p-5",
        classes.surface,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-[10px] font-medium uppercase tracking-[0.09em] text-muted-foreground">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", classes.dot)} />
          <span className="truncate">{label}</span>
        </div>
        {(icon || topRight) && (
          <div className={cn("flex shrink-0 items-center gap-2", classes.ink)}>
            {topRight ?? icon}
          </div>
        )}
      </div>
      <div
        className={cn(
          "mt-3 truncate font-display font-semibold leading-none tracking-tight tabular-nums",
          VALUE_SIZE[size],
          classes.ink,
        )}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </div>
      {subtitle && <div className="mt-2 text-xs text-muted-foreground">{subtitle}</div>}
      {children && <div className="mt-4">{children}</div>}
      {description && (
        <div className="mt-3 border-t border-current/10 pt-3 text-[11px] text-muted-foreground">
          {description}
        </div>
      )}
    </section>
  );
}
