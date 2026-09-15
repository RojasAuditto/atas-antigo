import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { distributionStatus, type GroupSummary } from "@/domain/aggregations";
import { formatCompactCurrency, formatDate } from "@/domain/format";
import { movementsForGroup } from "@/domain/movements";
import type { Movement, Origin } from "@/domain/schemas";
import { ProgressTimeline } from "@/components/hub/ProgressTimeline";
import { StatusBadge } from "@/components/hub/StatusBadge";
import { buildTimelineEvents } from "./timeline";

interface GroupCardProps {
  group: GroupSummary;
  allOrigins: readonly Origin[];
  movements: readonly Movement[];
}

export function GroupCard({ allOrigins, group, movements }: GroupCardProps) {
  const status = distributionStatus(group.distributed, group.balance);
  const groupMovements = movementsForGroup(allOrigins, movements, group.name, false);
  const tone = group.issues > 0 ? "amber" : status.tone;

  return (
    <Link
      className="hub-row group block min-h-40 rounded-3xl border p-4 transition-[transform,border-color,background-color] hover:-translate-y-0.5 hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      to={`/grupos/${encodeURIComponent(group.name)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{group.name}</h3>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {group.companyCount} {group.companyCount === 1 ? "empresa" : "empresas"} · {group.shareholderCount} {group.shareholderCount === 1 ? "sócio" : "sócios"}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2">
        <div><dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Disponível</dt><dd className="mt-1 text-xs font-semibold tabular-nums">{formatCompactCurrency(group.available)}</dd></div>
        <div><dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Distribuído</dt><dd className="mt-1 text-xs font-semibold tabular-nums text-success-ink">{formatCompactCurrency(group.distributed)}</dd></div>
        <div><dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Saldo</dt><dd className="mt-1 text-xs font-semibold tabular-nums text-warning-ink">{formatCompactCurrency(group.balance)}</dd></div>
      </dl>
      <ProgressTimeline
        className="mt-4"
        events={buildTimelineEvents(groupMovements, group.available)}
        label={groupMovements.length === 1 ? "1 lançamento" : `${groupMovements.length} lançamentos`}
        tone={tone}
        value={group.progress}
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusBadge status={status.key} />
        <span className="text-[10px] text-muted-foreground">Prazo {formatDate(group.deadline)}</span>
      </div>
      {group.issues > 0 && (
        <p className="mt-2 text-[10px] font-medium text-warning-ink">
          {group.issues} {group.issues === 1 ? "divergência de base" : "divergências de base"}
        </p>
      )}
    </Link>
  );
}
