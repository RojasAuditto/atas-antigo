import { useState } from "react";
import { AlertTriangle, ArrowLeft, Building2, Database } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { DetailActions } from "@/components/distribution/DetailActions";
import { DetailHero } from "@/components/distribution/DetailHero";
import { InsightCard } from "@/components/distribution/InsightCard";
import { MovementList } from "@/components/distribution/MovementList";
import { SectionCard } from "@/components/distribution/SectionCard";
import { ShareholderCard } from "@/components/distribution/ShareholderCard";
import { EmptyState } from "@/components/hub/EmptyState";
import { PageHeader } from "@/components/hub/PageHeader";
import { Pagination } from "@/components/hub/Pagination";
import { StatCard } from "@/components/hub/StatCard";
import { StatusBadge } from "@/components/hub/StatusBadge";
import { Button } from "@/components/ui/button";
import { useDistribution } from "@/contexts/DistributionContext";
import { aggregateCompanies, aggregateShareholders, distributionStatus } from "@/domain/aggregations";
import { formatCompactCurrency, formatCurrency, formatDate, formatPercent } from "@/domain/format";
import { movementsForOrigin } from "@/domain/movements";
import { PAGE_SIZE_OPTIONS, paginate } from "@/domain/pagination";

export function CompanyPage() {
  const { originId = "" } = useParams();
  const { catalog, movements } = useDistribution();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const company = aggregateCompanies(catalog?.origins ?? [], movements)
    .find((candidate) => candidate.id === originId);

  if (!company) {
    return catalog ? (
      <EmptyState
        action={<Button asChild><Link to="/empresas">Voltar às empresas</Link></Button>}
        description="A origem pode ter sido removida da fonte ou o endereço está incorreto."
        title="Empresa não encontrada"
      />
    ) : null;
  }

  const shareholders = aggregateShareholders([company], movements).sort((a, b) => b.balance - a.balance);
  const paged = paginate(shareholders, page, pageSize);
  const companyMovements = movementsForOrigin(movements, company.id, true)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const status = distributionStatus(company.distributed, company.balance);
  const insight = company.distributed <= 0.005
    ? `A empresa possui ${formatCompactCurrency(company.availableAmount)} disponíveis e ainda não tem distribuição registrada. ${company.issue ? "Existe divergência entre a origem e os direitos atribuídos; revise a base antes de concluir." : "Os direitos dos sócios conciliam com o valor disponível."}`
    : `Foram distribuídos ${formatCompactCurrency(company.distributed)} (${formatPercent(company.progress)}), restando ${formatCompactCurrency(company.balance)} para os sócios desta empresa.`;

  return (
    <>
      <Button asChild className="mb-4" size="sm" variant="ghost">
        <Link to={`/grupos/${encodeURIComponent(company.groupName)}`}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />Voltar ao grupo
        </Link>
      </Button>
      <PageHeader
        actions={<DetailActions prefill={{ originId: company.id }} reportTo={`/relatorio?scope=company&company=${encodeURIComponent(company.id)}`} />}
        subtitle={`${company.companyTaxId} · ${company.groupName}`}
        title={company.companyName}
      />
      <DetailHero
        description={`Exercício ${company.exercise} · origem em ${formatDate(company.sourceDate)} · prazo ${formatDate(company.deadline)}`}
        eyebrow={`Empresa · ${company.companyTaxId}`}
        icon={<Building2 className="h-6 w-6" strokeWidth={1.75} />}
        status={<StatusBadge status={status.key} />}
        title={company.companyName}
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Direito original" subtitle="Valor da origem" tone="blue" value={formatCompactCurrency(company.availableAmount)} />
        <StatCard label="Distribuído" subtitle="Saídas efetivas" tone="emerald" value={formatCompactCurrency(company.distributed)} />
        <StatCard label="Saldo" subtitle="Ainda disponível" tone="amber" value={formatCompactCurrency(company.balance)} />
        <StatCard label="Sócios" subtitle="Participações registradas" tone="indigo" value={company.shareholders.length.toLocaleString("pt-BR")} />
        <StatCard label="Alocação" subtitle={`${formatPercent(company.allocationPercent)} informado`} tone={company.issue ? "rose" : "emerald"} value={formatCompactCurrency(company.allocatedAmount)} />
      </div>
      <InsightCard label="Leitura da empresa">{insight}</InsightCard>
      {company.issue && (
        <aside className="mb-4 flex gap-3 rounded-2xl border border-destructive/25 bg-destructive/[0.055] p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive-ink" strokeWidth={1.75} />
          <div>
            <strong className="text-destructive-ink">Divergência na base de direitos</strong>
            <p className="mt-1 leading-relaxed text-muted-foreground">
              Origem: {formatCurrency(company.availableAmount)} · direitos dos sócios: {formatCurrency(company.allocatedAmount)} · diferença: {formatCurrency(Math.abs(company.availableAmount - company.allocatedAmount))}. Os valores da fonte não são alterados pelo módulo.
            </p>
          </div>
        </aside>
      )}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]">
        <SectionCard note={`${shareholders.length} participações`} title="Sócios e saldos">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {paged.items.map((shareholder) => (
              <ShareholderCard key={shareholder.key} movements={movements} shareholder={shareholder} />
            ))}
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
        <div className="space-y-4">
          <SectionCard title="Origem do direito">
            <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <Database className="mt-0.5 h-5 w-5 text-primary" strokeWidth={1.75} />
                  <div>
                    <strong className="text-sm">Exercício {company.exercise} · {company.sourceStatus}</strong>
                    <p className="mt-1 text-xs text-muted-foreground">Data {formatDate(company.sourceDate)} · prazo {formatDate(company.deadline)}</p>
                  </div>
                </div>
                <StatusBadge label={company.issue ? "Atenção" : "Conciliada"} status={company.issue ? "alert" : "completed"} />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2">
                <MiniStat label="Origem" value={company.availableAmount} />
                <MiniStat label="Alocado" value={company.allocatedAmount} />
                <MiniStat label="Distribuído" value={company.distributed} />
              </dl>
            </div>
          </SectionCard>
          <SectionCard title="Últimas movimentações">
            <MovementList movements={companyMovements.slice(0, 8)} origins={catalog?.origins} />
          </SectionCard>
        </div>
      </div>
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-background/80 p-2">
      <dt className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-xs font-semibold tabular-nums" title={formatCurrency(value)}>{formatCompactCurrency(value)}</dd>
    </div>
  );
}
