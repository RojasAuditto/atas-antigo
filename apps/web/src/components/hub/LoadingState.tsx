import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface LoadingStateProps {
  label?: string;
  fullPage?: boolean;
  className?: string;
}

export function LoadingState({
  className,
  fullPage = false,
  label = "Carregando",
}: LoadingStateProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 text-sm text-muted-foreground",
        fullPage ? "min-h-[40vh]" : "min-h-24",
        className,
      )}
      role="status"
    >
      <Loader2 className="h-5 w-5 animate-spin text-primary" strokeWidth={1.75} />
      <span>{label}</span>
    </div>
  );
}
