import { cn } from "@/lib/cn";
import { HUB_TONE_CLASSES, type HubTone } from "./tone";

export interface TimelineEvent {
  id: string;
  label: string;
  position: number;
}

interface ProgressTimelineProps {
  value: number;
  tone?: HubTone;
  events?: readonly TimelineEvent[];
  label?: string;
  className?: string;
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

export function ProgressTimeline({
  className,
  events = [],
  label = "concluído",
  tone = "blue",
  value,
}: ProgressTimelineProps) {
  const progress = clampPercent(value);
  const classes = HUB_TONE_CLASSES[tone];

  return (
    <div className={cn("min-w-0", className)}>
      <div
        aria-label={`${progress.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% ${label}`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        className="relative h-3"
        role="progressbar"
      >
        <div className="absolute inset-x-0 top-1 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-[width] duration-300 ease-hub", classes.dot)}
            style={{ width: `${progress}%` }}
          />
        </div>
        {events.map((event) => (
          <span
            aria-label={event.label}
            className={cn(
              "absolute top-1 h-2.5 w-2.5 -translate-x-1/2 -translate-y-0.5 rounded-full border-2 border-background bg-background shadow-sm ring-1 ring-current",
              classes.ink,
            )}
            key={event.id}
            role="img"
            style={{ left: `${clampPercent(event.position)}%` }}
            title={event.label}
          />
        ))}
      </div>
      <div className="mt-1 flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
        <strong className={cn("font-semibold tabular-nums", classes.ink)}>
          {progress.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
        </strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
