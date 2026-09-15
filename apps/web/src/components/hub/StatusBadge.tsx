import { cn } from "@/lib/cn";

export type HubStatus =
  | "pending"
  | "late"
  | "in_progress"
  | "completed_on_time"
  | "delivered_late"
  | "not_sent"
  | "overdue_not_sent"
  | "approved"
  | "pending_approval"
  | "adjustment_requested"
  | "rejected"
  | "not_started"
  | "completed"
  | "delayed"
  | "cancelled"
  | "praise"
  | "improvement"
  | "guidance"
  | "alert"
  | "mixed";

type StatusTone = "info" | "success" | "warning" | "destructive" | "neutral";

interface StatusConfig {
  label: string;
  tone: StatusTone;
}

interface StatusBadgeProps {
  status: HubStatus;
  label?: string;
  className?: string;
}

const STATUS: Record<HubStatus, StatusConfig> = {
  pending: { label: "Pendente", tone: "warning" },
  late: { label: "Atrasado", tone: "destructive" },
  in_progress: { label: "Em andamento", tone: "info" },
  completed_on_time: { label: "Enviado no prazo", tone: "success" },
  delivered_late: { label: "Entregue com atraso", tone: "warning" },
  not_sent: { label: "Não enviado", tone: "neutral" },
  overdue_not_sent: { label: "Vencido e não enviado", tone: "destructive" },
  approved: { label: "Aprovado", tone: "success" },
  pending_approval: { label: "Aguardando aprovação", tone: "warning" },
  adjustment_requested: { label: "Ajuste solicitado", tone: "warning" },
  rejected: { label: "Rejeitado", tone: "destructive" },
  not_started: { label: "Não iniciada", tone: "neutral" },
  completed: { label: "Concluída", tone: "success" },
  delayed: { label: "Atrasada", tone: "destructive" },
  cancelled: { label: "Cancelada", tone: "neutral" },
  praise: { label: "Elogio", tone: "success" },
  improvement: { label: "Melhoria", tone: "warning" },
  guidance: { label: "Orientação", tone: "info" },
  alert: { label: "Alerta", tone: "destructive" },
  mixed: { label: "Misto", tone: "info" },
};

const TONE_CLASS: Record<StatusTone, string> = {
  info: "border-primary/30 bg-primary/10 text-info-ink dark:text-primary",
  success: "border-success/30 bg-success/10 text-success-ink",
  warning: "border-warning/30 bg-warning/10 text-warning-ink",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive-ink",
  neutral: "border-border bg-muted text-neutral-ink dark:text-muted-foreground",
};

export function StatusBadge({ className, label, status }: StatusBadgeProps) {
  const config = STATUS[status];

  return (
    <span
      className={cn(
        "inline-flex min-h-6 max-w-full items-center rounded-md border px-2 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.04em]",
        TONE_CLASS[config.tone],
        className,
      )}
    >
      {label ?? config.label}
    </span>
  );
}
