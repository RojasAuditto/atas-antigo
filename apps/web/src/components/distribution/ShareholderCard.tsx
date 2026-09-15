import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { distributionStatus, type ShareholderSummary } from "@/domain/aggregations";
import { formatCompactCurrency } from "@/domain/format";
import type { Movement } from "@/domain/schemas";
import { ProgressTimeline } from "@/components/hub/ProgressTimeline";
import { StatusBadge } from "@/components/hub/StatusBadge";
import { UserAvatar } from "@/components/hub/UserAvatar";
import { createEntityRouteId } from "@/lib/entity-id";
import { movementsForShareholder } from "@/domain/aggregations";
import { buildTimelineEvents } from "./timeline";

interface ShareholderCardProps {
  shareholder: ShareholderSummary;
  movements: readonly Movement[];
}

export function ShareholderCard({ movements, shareholder }: ShareholderCardProps) {
  const status = distributionStatus(shareholder.distributed, shareholder.balance);
  const shareholderMovements = movementsForShareholder(shareholder, movements);

  return (
    <Link
      className="hub-row group block min-h-40 rounded-3xl border p-4 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      to={`/socios/${createEntityRouteId(shareholder.key)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <UserAvatar name={shareholder.name} size={32} />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{shareholder.name}</h3>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">
              {shareholder.type} · {shareholder.taxId ?? "Sem documento"}
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2">
        <div><dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Direito</dt><dd className="mt-1 text-xs font-semibold tabular-nums">{formatCompactCurrency(shareholder.entitlement)}</dd></div>
        <div><dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Recebido</dt><dd className="mt-1 text-xs font-semibold tabular-nums text-success-ink">{formatCompactCurrency(shareholder.distributed)}</dd></div>
        <div><dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Saldo</dt><dd className="mt-1 text-xs font-semibold tabular-nums text-warning-ink">{formatCompactCurrency(shareholder.balance)}</dd></div>
      </dl>
      <ProgressTimeline
        className="mt-4"
        events={buildTimelineEvents(shareholderMovements, shareholder.entitlement)}
        label={`${shareholder.companyCount} ${shareholder.companyCount === 1 ? "empresa" : "empresas"}`}
        tone={shareholder.issues > 0 ? "amber" : status.tone}
        value={shareholder.progress}
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusBadge status={status.key} />
        <span className="text-[10px] text-muted-foreground">{shareholder.groupCount} {shareholder.groupCount === 1 ? "grupo" : "grupos"}</span>
      </div>
    </Link>
  );
}
