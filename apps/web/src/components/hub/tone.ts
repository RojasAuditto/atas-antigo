export type HubTone = "blue" | "emerald" | "amber" | "rose" | "indigo" | "neutral";

interface ToneClasses {
  active: string;
  dot: string;
  ink: string;
  surface: string;
}

export const HUB_TONE_CLASSES: Record<HubTone, ToneClasses> = {
  blue: {
    active:
      "border-[hsl(var(--hub-blue)/.28)] bg-[hsl(var(--hub-blue)/.10)] text-info-ink dark:text-hub-blue",
    dot: "bg-hub-blue",
    ink: "text-info-ink dark:text-hub-blue",
    surface:
      "border-[hsl(var(--hub-blue)/.18)] bg-[hsl(var(--hub-blue)/.045)]",
  },
  emerald: {
    active:
      "border-[hsl(var(--success)/.28)] bg-[hsl(var(--success)/.10)] text-success-ink",
    dot: "bg-hub-emerald",
    ink: "text-success-ink",
    surface:
      "border-[hsl(var(--success)/.18)] bg-[hsl(var(--success)/.045)]",
  },
  amber: {
    active:
      "border-[hsl(var(--warning)/.30)] bg-[hsl(var(--warning)/.11)] text-warning-ink",
    dot: "bg-hub-amber",
    ink: "text-warning-ink",
    surface:
      "border-[hsl(var(--warning)/.20)] bg-[hsl(var(--warning)/.055)]",
  },
  rose: {
    active:
      "border-[hsl(var(--destructive)/.28)] bg-[hsl(var(--destructive)/.10)] text-destructive-ink",
    dot: "bg-hub-rose",
    ink: "text-destructive-ink",
    surface:
      "border-[hsl(var(--destructive)/.18)] bg-[hsl(var(--destructive)/.045)]",
  },
  indigo: {
    active:
      "border-[hsl(var(--hub-indigo)/.30)] bg-[hsl(var(--hub-indigo)/.10)] text-info-ink dark:text-hub-indigo",
    dot: "bg-hub-indigo",
    ink: "text-info-ink dark:text-hub-indigo",
    surface:
      "border-[hsl(var(--hub-indigo)/.20)] bg-[hsl(var(--hub-indigo)/.05)]",
  },
  neutral: {
    active: "border-border bg-card text-foreground shadow-sm",
    dot: "bg-muted-foreground",
    ink: "text-foreground",
    surface: "border-border/60 bg-card",
  },
};
