import { useState } from "react";
import { ArrowLeft, Building2, ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { DetailActions } from "@/components/distribution/DetailActions";
import { DetailHero } from "@/components/distribution/DetailHero";
import { InsightCard } from "@/components/distribution/InsightCard";
import { MovementList } from "@/components/distribution/MovementList";
import { SectionCard } from "@/components/distribution/SectionCard";
import { EmptyState } from "@/components/hub/EmptyState";
import { PageHeader } from "@/components/hub/PageHeader";
import { Pagination } from "@/components/hub/Pagination";
import { ProgressTimeline } from "@/components/hub/ProgressTimeline";
import { StatCard } from "@/components/hub/StatCard";
import { StatusBadge } from "@/components/hub/StatusBadge";
import { UserAvatar } from "@/components/hub/UserAvatar";
import { Button } from "@/components/ui/button";
import { useDistribution } from "@/contexts/DistributionContext";
import {
  aggregateShareholders,
  distributionStatus,
  type ShareholderPosition,
} from "@/domain/aggregations";
import { formatCompactCurrency, formatPercent, normalizeText } from "@/domain/format";
import { PAGE_SIZE_OPTIONS, paginate } from "@/domain/pagination";
import { createEntityRouteId } from "@/lib/entity-id";

export function ShareholderPage() {
  const { entityId = "" } = useParams();
  const { catalog, movements } = useDistribution();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const shareholder = aggregateShareholders(catalog?.origins ?? [], movements)
    .find((candidate) => createEntityRouteId(candidate.key) === entityId);

  if (!shareholder) {
    return catalog ? (
      <EmptyState
        action={<Button asChild><Link to="/socios">Voltar aos sócios</Link></Button>}
        description="A pessoa pode ter sido removida da fonte ou o endereço está incorreto."
        title="Sócio não encontrado"
      />
    ) : null;
  }

  const rows = [...shareholder.rows].sort((a, b) => b.balance - a.balance);
  const paged = paginate(rows, page, pageSize);
  const originIds = new Set(rows.map((row) => row.origin.id));
  const shareholderMovements = movements
    .filter((movement) => {
      if (!originIds.has(movement.originId)) return false;
      return shareholder.taxId !== null
        ? movement.shareholderTaxId === shareholder.taxId
        : movement.shareholderTaxId === null
          && normalizeText(movement.shareholderName) === normalizeText(shareholder.name);
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const status = distributionStatus(shareholder.distributed, shareholder.balance);
  const insight = shareholder.distributed <= 0.005
    ? `${shareholder.name} possui ${formatCompactCurrency(shareholder.entitlement)} de direito consolidado e ainda não tem recebimentos registrados neste módulo.`
    : `${shareholder.name} recebeu ${formatCompactCurrency(shareholder.distributed)} de ${formatCompactCurrency(shareholder.entitlement)} (${formatPercent(shareholder.progress)}). Restam ${formatCompactCurrency(shareholder.balance)} em ${shareholder.companyCount} empresa(s).`;
  const prefill = rows.length === 1
    ? { originId: rows[0]?.origin.id, shareholderTaxId: shareholder.taxId }
    : undefined;

  return (
    <>
      <Button asChild className="mb-4" size="sm" variant="ghost">
        <Link to="/socios"><ArrowLeft className="h-4 w-4" strokeWidth={1.75} />Voltar aos sócios</Link>
      </Button>
      <PageHeader
        actions={<DetailActions prefill={prefill} reportTo={`/relatorio?scope=shareholder&shareholder=${encodeURIComponent(entityId)}`} />}
        subtitle={`${shareholder.type} · ${shareholder.taxId ?? "Sem documento"} · posição em toda a base`}
        title={shareholder.name}
      />
      <DetailHero
        description={`${shareholder.companyCount} empresas · ${shareholder.groupCount} grupos`}
        eyebrow={shareholder.taxId ? `Sócio · ${shareholder.taxId}` : "Sócio"}
        icon={<UserAvatar name={shareholder.name} size={48} />}
        status={<StatusBadge status={status.key} />}
        title={shareholder.name}
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Direito total" subtitle="Snapshot das participações" tone="blue" value={formatCompactCurrency(shareholder.entitlement)} />
        <StatCard label="Recebido" subtitle="Distribuições efetivas" tone="emerald" value={formatCompactCurrency(shareholder.distributed)} />
        <StatCard label="Saldo" subtitle="Ainda disponível" tone="amber" value={formatCompactCurrency(shareholder.balance)} />
        <StatCard label="Empresas" subtitle="Origens com participação" tone="indigo" value={shareholder.companyCount.toLocaleString("pt-BR")} />
        <StatCard label="Progresso" subtitle="Recebido sobre direito" tone="blue" value={formatPercent(shareholder.progress)} />
      </div>
      <InsightCard label="Leitura do sócio">{insight}</InsightCard>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,.8fr)]">
        <SectionCard note={`${rows.length} participações`} title="Composição do direito">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {paged.items.map((row) => <OriginPositionCard key={row.origin.id} row={row} />)}
          </div>
          <Pagination
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            page={paged.page}
            pageSize={paged.perPage}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            total={paged.total}
          />
        </SectionCard>
        <SectionCard title="Histórico de recebimentos">
          <MovementList movements={shareholderMovements} origins={catalog?.origins} />
        </SectionCard>
      </div>
    </>
  );
}

function OriginPositionCard({ row }: { row: ShareholderPosition }) {
  const status = distributionStatus(row.distributed, row.balance);
  const progress = row.shareholder.entitlement > 0
    ? (row.distributed / row.shareholder.entitlement) * 100
    : 0;
  return (
    <Link
      className="hub-row group block rounded-3xl border p-4 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      to={`/empresas/${row.origin.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <strong className="block truncate text-sm">{row.origin.companyName}</strong>
            <span className="mt-1 block truncate text-[11px] text-muted-foreground">{row.origin.companyTaxId} · exercício {row.origin.exercise}</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2">
        <PositionValue label="Direito" value={formatCompactCurrency(row.shareholder.entitlement)} />
        <PositionValue label="Recebido" value={formatCompactCurrency(row.distributed)} />
        <PositionValue label="Saldo" value={formatCompactCurrency(row.balance)} />
      </dl>
      <ProgressTimeline className="mt-4" label={`${formatPercent(row.shareholder.percentage)} de participação`} tone={status.tone} value={progress} />
      <div className="mt-3"><StatusBadge status={status.key} /></div>
    </Link>
  );
}

function PositionValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-xs font-semibold tabular-nums" title={value}>{value}</dd>
    </div>
  );
}
