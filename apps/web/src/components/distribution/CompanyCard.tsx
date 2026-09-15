import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { distributionStatus, type CompanySummary } from "@/domain/aggregations";
import { formatCompactCurrency, formatDate } from "@/domain/format";
import { movementsForOrigin } from "@/domain/movements";
import type { Movement } from "@/domain/schemas";
import { ProgressTimeline } from "@/components/hub/ProgressTimeline";
import { StatusBadge } from "@/components/hub/StatusBadge";
import { buildTimelineEvents } from "./timeline";

interface CompanyCardProps {
  company: CompanySummary;
  movements: readonly Movement[];
}

export function CompanyCard({ company, movements }: CompanyCardProps) {
  const status = distributionStatus(company.distributed, company.balance);
  const companyMovements = movementsForOrigin(movements, company.id);

  return (
    <Link
      className="hub-row group block min-h-40 rounded-3xl border p-4 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      to={`/empresas/${company.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{company.companyName}</h3>
          <p className="mt-1.5 truncate text-[11px] text-muted-foreground">
            {company.companyTaxId} · Exercício {company.exercise}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2">
        <div><dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Disponível</dt><dd className="mt-1 text-xs font-semibold tabular-nums">{formatCompactCurrency(company.availableAmount)}</dd></div>
        <div><dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Distribuído</dt><dd className="mt-1 text-xs font-semibold tabular-nums text-success-ink">{formatCompactCurrency(company.distributed)}</dd></div>
        <div><dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Saldo</dt><dd className="mt-1 text-xs font-semibold tabular-nums text-warning-ink">{formatCompactCurrency(company.balance)}</dd></div>
      </dl>
      <ProgressTimeline
        className="mt-4"
        events={buildTimelineEvents(companyMovements, company.availableAmount)}
        label={companyMovements.length === 1 ? "1 lançamento" : `${companyMovements.length} lançamentos`}
        tone={company.issue ? "amber" : status.tone}
        value={company.progress}
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusBadge status={status.key} />
        <span className="text-[10px] text-muted-foreground">Prazo {formatDate(company.deadline)}</span>
      </div>
      {company.issue && <p className="mt-2 text-[10px] font-medium text-warning-ink">Divergência entre origem e direitos alocados</p>}
    </Link>
  );
}
