import { ReceiptText, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/hub/EmptyState";
import { StatusBadge } from "@/components/hub/StatusBadge";
import { Button } from "@/components/ui/button";
import { useDistribution } from "@/contexts/DistributionContext";
import { formatCurrency, formatDate } from "@/domain/format";
import type { Movement, Origin } from "@/domain/schemas";
import { cn } from "@/lib/cn";

interface MovementListProps {
  movements: readonly Movement[];
  origins?: readonly Origin[];
  showActions?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  compactEmpty?: boolean;
}

const GRID = "lg:grid-cols-[88px_minmax(150px,1.2fr)_minmax(150px,1.1fr)_80px_112px_minmax(100px,0.8fr)_126px]";

function MovementRow({
  exercise,
  movement,
  onReverse,
  showActions,
}: {
  exercise: string;
  movement: Movement;
  onReverse: (id: string) => void;
  showActions: boolean;
}) {
  const reversed = movement.status === "reversed";

  return (
    <div className={cn("hub-row grid grid-cols-2 gap-3 rounded-md px-3 py-3 lg:items-center", GRID)}>
      <Field label="Data" value={formatDate(movement.date)} muted />
      <Entity label="Empresa" meta={movement.companyTaxId} name={movement.companyName} />
      <Entity label="Sócio" meta={movement.shareholderTaxId ?? "—"} name={movement.shareholderName} />
      <Field label="Exercício" value={exercise} muted />
      <Field
        className={reversed ? "line-through text-muted-foreground" : "text-foreground"}
        label="Valor"
        value={formatCurrency(movement.amount)}
      />
      <Field label="Comprovante" title={movement.proofName} value={movement.proofName || "—"} muted />
      <div className="col-span-2 flex min-w-0 items-center justify-between gap-2 lg:col-span-1 lg:justify-start">
        <span className="text-[9px] uppercase tracking-wide text-muted-foreground lg:hidden">Status</span>
        <div className="flex items-center gap-1.5">
          <StatusBadge
            label={reversed ? "Estornada" : "Efetiva"}
            status={reversed ? "cancelled" : "completed"}
          />
          {showActions && !reversed && (
            <Button
              aria-label="Estornar movimentação"
              className="h-8 w-8"
              onClick={() => onReverse(movement.id)}
              size="icon"
              title="Estornar"
              variant="ghost"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Entity({ label, meta, name }: { label: string; meta: string; name: string }) {
  return (
    <div className="col-span-2 min-w-0 lg:col-span-1">
      <span className="text-[9px] uppercase tracking-wide text-muted-foreground lg:hidden">{label}</span>
      <p className="truncate text-sm font-medium">{name}</p>
      <p className="truncate text-[11px] text-muted-foreground">{meta}</p>
    </div>
  );
}

function Field({
  className,
  label,
  muted = false,
  title,
  value,
}: {
  className?: string;
  label: string;
  muted?: boolean;
  title?: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <span className="text-[9px] uppercase tracking-wide text-muted-foreground lg:hidden">{label}</span>
      <p
        className={cn("truncate text-xs font-medium tabular-nums", muted && "text-muted-foreground", className)}
        title={title}
      >
        {value}
      </p>
    </div>
  );
}

export function MovementList({
  compactEmpty = true,
  emptyAction,
  emptyDescription = "A base inicia com R$ 0 distribuído. Registre a primeira distribuição para criar o histórico.",
  emptyTitle = "Nenhuma movimentação registrada",
  movements,
  origins = [],
  showActions = false,
}: MovementListProps) {
  const { reverseMovement } = useDistribution();
  const exerciseByOrigin = new Map(origins.map((origin) => [origin.id, origin.exercise]));

  async function reverse(id: string) {
    if (!window.confirm("Estornar esta movimentação? O histórico será preservado para auditoria.")) return;
    const result = await reverseMovement(id);
    if (result.ok) toast.success("Movimentação estornada.");
    else toast.error(result.message);
  }

  if (movements.length === 0) {
    return (
      <EmptyState
        action={emptyAction}
        compact={compactEmpty}
        description={emptyDescription}
        icon={<ReceiptText className="h-6 w-6" strokeWidth={1.75} />}
        title={emptyTitle}
      />
    );
  }

  return (
    <div className="space-y-1.5">
      <div className={cn("hidden gap-3 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground lg:grid", GRID)}>
        <span>Data</span><span>Empresa</span><span>Sócio</span><span>Exercício</span>
        <span>Valor</span><span>Comprovante</span><span>Status</span>
      </div>
      {movements.map((movement) => (
        <MovementRow
          exercise={exerciseByOrigin.get(movement.originId) ?? "—"}
          key={movement.id}
          movement={movement}
          onReverse={reverse}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
