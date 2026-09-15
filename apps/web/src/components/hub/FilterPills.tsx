import { cn } from "@/lib/cn";
import { HUB_TONE_CLASSES, type HubTone } from "./tone";

export interface FilterPillOption<T extends string> {
  key: T;
  label: string;
  count?: number;
  tone?: HubTone;
}

interface FilterPillsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly FilterPillOption<T>[];
  fullWidth?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function FilterPills<T extends string>({
  ariaLabel = "Filtros",
  className,
  fullWidth = false,
  onChange,
  options,
  value,
}: FilterPillsProps<T>) {
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "hub-scroll flex max-w-full items-center gap-0.5 overflow-x-auto rounded-2xl bg-muted/65 p-0.5 dark:bg-[hsl(215_15%_11%)]",
        fullWidth && "w-full",
        className,
      )}
      role="group"
    >
      {options.map((option) => {
        const active = option.key === value;
        const tone = HUB_TONE_CLASSES[option.tone ?? "neutral"];

        return (
          <button
            aria-pressed={active}
            className={cn(
              "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-transparent px-3 text-xs font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              fullWidth && "flex-1",
              active ? tone.active : "hover:bg-card/70 hover:text-foreground",
            )}
            key={option.key}
            onClick={() => onChange(option.key)}
            type="button"
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  "grid min-w-[18px] place-items-center rounded-md bg-black/[0.05] px-1.5 py-0.5 text-[9px] tabular-nums dark:bg-white/[0.07]",
                  active && "bg-current/10",
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
