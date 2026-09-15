import { Sparkles } from "lucide-react";

interface InsightCardProps {
  label: string;
  children: string;
}

export function InsightCard({ children, label }: InsightCardProps) {
  return (
    <aside className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/[0.055] px-4 py-3.5">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
      <div>
        <strong className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
          {label}
        </strong>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">{children}</p>
      </div>
    </aside>
  );
}
