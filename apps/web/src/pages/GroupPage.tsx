import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Building2, CheckCircle2 } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CompanyCard } from "@/components/distribution/CompanyCard";
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
import {
  aggregateCompanies,
  aggregateGroups,
  aggregateShareholders,
  distributionStatus,
  filterOriginsByExercise,
} from "@/domain/aggregations";
import { formatCompactCurrency, formatCurrency, formatDate, formatPercent } from "@/domain/format";
import { movementsForGroup } from "@/domain/movements";
import { PAGE_SIZE_OPTIONS, paginate } from "@/domain/pagination";
import { cn } from "@/lib/cn";

type GroupTab = "overview" | "companies" | "shareholders" | "movements";

const TABS: readonly { id: GroupTab; label: string }[] = [
  { id: "overview", label: "Visão geral" },
  { id: "companies", label: "Empresas" },
  { id: "shareholders", label: "Sócios" },
  { id: "movements", label: "Movimentações" },
];

function isGroupTab(value: string | null): value is GroupTab {
  return TABS.some((tab) => tab.id === value);
}

export function GroupPage() {
  const { groupName = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { catalog, movements } = useDistribution();
  const [exercise, setExercise] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const tabParam = searchParams.get("tab");
  const tab: GroupTab = isGroupTab(tabParam) ? tabParam : "overview";

  const allOrigins = useMemo(() => catalog?.origins ?? [], [catalog]);
  const groupOrigins = useMemo(
    () => allOrigins.filter((origin) => origin.groupName === groupName),
    [allOrigins, groupName],
  );
  const exercises = useMemo(
    () => [...new Set(groupOrigins.map((origin) => origin.exercise))].sort().reverse(),
    [groupOrigins],
  );
  const origins = filterOriginsByExercise(groupOrigins, exercise);
  const group = aggregateGroups(origins, movements)[0];
  const companies = aggregateCompanies(origins, movements).sort((a, b) => b.balance - a.balance);
  const shareholders = aggregateShareholders(origins, movements).sort((a, b) => b.balance - a.balance);
  const groupMovements = movementsForGroup(allOrigins, movements, groupName)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  if (catalog && groupOrigins.length === 0) {
    return (
      <EmptyState
        action={<Button asChild><Link to="/">Voltar à Central</Link></Button>}
        description="O grupo pode ter sido removido da fonte ou o endereço está incorreto."
        title="Grupo não encontrado"
      />
    );
  }
  if (!group) return null;

  const status = distributionStatus(group.distributed, group.balance);
  const completed = companies.filter((company) => company.balance <= 0.005).length;
  const notStarted = companies.filter((company) => company.distributed <= 0.005).length;
  const partial = Math.max(0, companies.length - completed - notStarted);
  const insight = group.distributed <= 0.005
    ? `O grupo possui ${formatCompactCurrency(group.available)} disponíveis em ${companies.length} empresas. Ainda não há distribuição registrada. ${group.issues ? `${group.issues} origem(ns) precisam de conciliação.` : "A base está conciliada entre origem e direitos dos sócios."}`
    : `Foram distribuídos ${formatCompactCurrency(group.distributed)} de ${formatCompactCurrency(group.available)} (${formatPercent(group.progress)}). Restam ${formatCompactCurrency(group.balance)}; ${completed} empresa(s) estão concluídas, ${partial} em andamento e ${notStarted} não iniciaram.`;

  function selectTab(next: GroupTab) {
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (next === "overview") params.delete("tab");
    else params.set("tab", next);
    setSearchParams(params, { replace: true });
  }

  return (
    <>
      <Button asChild className="mb-4" size="sm" variant="ghost">
        <Link to="/"><ArrowLeft className="h-4 w-4" strokeWidth={1.75} />Voltar à Central</Link>
      </Button>
      <PageHeader
        actions={(
          <>
            <label className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-2 text-xs text-muted-foreground">
              Exercício
              <select
                className="bg-transparent font-medium text-foreground outline-none"
                onChange={(event) => { setExercise(event.target.value); setPage(1); }}
                value={exercise}
              >
                <option value="all">Todos</option>
                {exercises.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <DetailActions reportTo={`/relatorio?scope=group&group=${encodeURIComponent(groupName)}`} />
          </>
        )}
        subtitle="Dossiê consolidado da distribuição de lucros do cliente."
        title={groupName}
      />
      <DetailHero
        description={`${group.companyCount} empresas · ${group.shareholderCount} sócios · prazo padrão ${formatDate(group.deadline)}`}
        eyebrow="Grupo"
        icon={<Building2 className="h-6 w-6" strokeWidth={1.75} />}
        status={<StatusBadge status={status.key} />}
        title={groupName}
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Disponível" subtitle="Direito original" tone="blue" value={formatCompactCurrency(group.available)} />
        <StatCard label="Distribuído" subtitle="Movimentações efetivas" tone="emerald" value={formatCompactCurrency(group.distributed)} />
        <StatCard label="Saldo" subtitle="Ainda disponível" tone="amber" value={formatCompactCurrency(group.balance)} />
        <StatCard label="Progresso" subtitle={`${completed} empresas concluídas`} tone="indigo" value={formatPercent(group.progress)} />
        <StatCard label="Alertas" subtitle="Divergências de origem/alocação" tone={group.issues ? "rose" : "emerald"} value={group.issues.toLocaleString("pt-BR")} />
      </div>
      <InsightCard label="Leitura da posição">{insight}</InsightCard>
      <div aria-label="Seções do grupo" className="mb-4 flex gap-1 overflow-x-auto border-b border-border" role="tablist">
        {TABS.map((item) => (
          <button
            aria-selected={tab === item.id}
            className={cn(
              "shrink-0 border-b-2 px-4 py-3 text-xs font-semibold transition-colors",
              tab === item.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            key={item.id}
            onClick={() => selectTab(item.id)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === "overview" && <GroupOverview companies={companies} movements={movements} />}
      {tab === "companies" && (
        <PagedCompanies companies={companies} movements={movements} page={page} pageSize={pageSize} setPage={setPage} setPageSize={setPageSize} />
      )}
      {tab === "shareholders" && (
        <PagedShareholders movements={movements} page={page} pageSize={pageSize} setPage={setPage} setPageSize={setPageSize} shareholders={shareholders} />
      )}
      {tab === "movements" && (
        <SectionCard note="Histórico criado pelos lançamentos deste módulo" title="Extrato de movimentações">
          <MovementList movements={groupMovements} origins={allOrigins} showActions />
        </SectionCard>
      )}
    </>
  );
}

function GroupOverview({ companies, movements }: { companies: ReturnType<typeof aggregateCompanies>; movements: ReturnType<typeof useDistribution>["movements"] }) {
  const critical = companies.filter((company) => company.issue);
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <SectionCard title="Empresas com maior saldo">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {companies.slice(0, 8).map((company) => <CompanyCard company={company} key={company.id} movements={movements} />)}
        </div>
      </SectionCard>
      <SectionCard note={`${critical.length} itens`} title="Atenção necessária">
        {critical.length === 0 ? (
          <EmptyState
            compact
            description="Os valores de origem e direitos dos sócios estão conciliados neste grupo."
            icon={<CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />}
            title="Sem divergências"
          />
        ) : (
          <div className="space-y-2">
            {critical.slice(0, 8).map((company) => (
              <Link className="flex gap-3 rounded-xl border border-warning/25 bg-warning/[0.06] p-3 hover:border-warning/40" key={company.id} to={`/empresas/${company.id}`}>
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-ink" strokeWidth={1.75} />
                <span className="min-w-0 text-xs leading-relaxed">
                  <strong className="block truncate text-foreground">{company.companyName}</strong>
                  <span className="text-muted-foreground">Origem {formatCurrency(company.availableAmount)} · alocado {formatCurrency(company.allocatedAmount)} · diferença {formatCurrency(Math.abs(company.availableAmount - company.allocatedAmount))}.</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

interface PagedProps {
  page: number;
  pageSize: number;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;
}

function PagedCompanies({ companies, movements, page, pageSize, setPage, setPageSize }: PagedProps & { companies: ReturnType<typeof aggregateCompanies>; movements: ReturnType<typeof useDistribution>["movements"] }) {
  const paged = paginate(companies, page, pageSize);
  return (
    <SectionCard note={`${companies.length} CNPJs`} title="Empresas do grupo">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{paged.items.map((company) => <CompanyCard company={company} key={company.id} movements={movements} />)}</div>
      <Pagination onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} page={paged.page} pageSize={paged.perPage} pageSizeOptions={PAGE_SIZE_OPTIONS} total={paged.total} />
    </SectionCard>
  );
}

function PagedShareholders({ movements, page, pageSize, setPage, setPageSize, shareholders }: PagedProps & { movements: ReturnType<typeof useDistribution>["movements"]; shareholders: ReturnType<typeof aggregateShareholders> }) {
  const paged = paginate(shareholders, page, pageSize);
  return (
    <SectionCard note="Consolidado no grupo" title="Posição dos sócios">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{paged.items.map((shareholder) => <ShareholderCard key={shareholder.key} movements={movements} shareholder={shareholder} />)}</div>
      <Pagination onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} page={paged.page} pageSize={paged.perPage} pageSizeOptions={PAGE_SIZE_OPTIONS} total={paged.total} />
    </SectionCard>
  );
}
