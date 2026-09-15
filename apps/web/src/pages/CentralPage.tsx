import { FileText, Plus, SearchX } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AppState } from "@/components/distribution/AppState";
import { DataFilters, type DistributionFilter } from "@/components/distribution/DataFilters";
import { GroupCard } from "@/components/distribution/GroupCard";
import { SectionCard } from "@/components/distribution/SectionCard";
import { EmptyState } from "@/components/hub/EmptyState";
import type { FilterPillOption } from "@/components/hub/FilterPills";
import { PageHeader } from "@/components/hub/PageHeader";
import { Pagination } from "@/components/hub/Pagination";
import { StatCard } from "@/components/hub/StatCard";
import { Button } from "@/components/ui/button";
import { useDistribution } from "@/contexts/DistributionContext";
import {
  aggregateGroups,
  distributionStatus,
  filterGroups,
  filterOriginsByExercise,
  type GroupSummary,
} from "@/domain/aggregations";
import { formatCompactCurrency, formatPercent } from "@/domain/format";
import { PAGE_SIZE_OPTIONS } from "@/domain/pagination";
import type { Catalog, Movement } from "@/domain/schemas";
import { usePagination } from "@/hooks/usePagination";

function groupStatusOptions(groups: readonly GroupSummary[]): readonly FilterPillOption<DistributionFilter>[] {
  const count = (status: "not_started" | "in_progress" | "completed") => groups.filter(
    (group) => distributionStatus(group.distributed, group.balance).key === status,
  ).length;

  return [
    { key: "all", label: "Todos", count: groups.length },
    { key: "not_started", label: "Não iniciada", count: count("not_started") },
    { key: "in_progress", label: "Em andamento", count: count("in_progress"), tone: "blue" },
    { key: "completed", label: "Concluída", count: count("completed"), tone: "emerald" },
    { key: "attention", label: "Atenção", count: groups.filter((group) => group.issues > 0).length, tone: "amber" },
  ];
}

function CentralStats({ groups, originCount }: { groups: readonly GroupSummary[]; originCount: number }) {
  const available = groups.reduce((total, group) => total + group.available, 0);
  const distributed = groups.reduce((total, group) => total + group.distributed, 0);
  const issues = groups.reduce((total, group) => total + group.issues, 0);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Grupos" subtitle={`${originCount} origens válidas`} tone="blue" value={groups.length.toLocaleString("pt-BR")} />
      <StatCard label="Disponível" subtitle="Direito original importado" tone="indigo" value={formatCompactCurrency(available)} />
      <StatCard label="Distribuído" subtitle={distributed > 0 && available > 0 ? `${formatPercent((distributed / available) * 100)} do disponível` : "Base inicia em R$ 0"} tone="emerald" value={formatCompactCurrency(distributed)} />
      <StatCard label="Saldo" subtitle="Valor ainda disponível" tone="amber" value={formatCompactCurrency(available - distributed)} />
      <StatCard label="Alertas de base" subtitle="Origem x direitos alocados" tone={issues > 0 ? "rose" : "emerald"} value={issues.toLocaleString("pt-BR")} />
    </div>
  );
}

function GroupResults({
  catalog,
  clearFilters,
  movements,
  page,
}: {
  catalog: Catalog;
  clearFilters: () => void;
  movements: readonly Movement[];
  page: ReturnType<typeof usePagination<GroupSummary>>;
}) {
  return (
    <SectionCard note={`${page.total} grupos · ordenados pelo maior saldo`} title="Posição por grupo">
      {page.total === 0 ? (
        <EmptyState
          action={<Button onClick={clearFilters} size="sm" variant="outline">Limpar filtros</Button>}
          compact
          description="Ajuste os filtros ou a busca para visualizar outros clientes."
          icon={<SearchX className="h-6 w-6" strokeWidth={1.75} />}
          title="Nenhum grupo encontrado"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {page.items.map((group) => <GroupCard allOrigins={catalog.origins} group={group} key={group.name} movements={movements} />)}
        </div>
      )}
      {page.total > 0 && (
        <Pagination
          onPageChange={page.setPage}
          onPageSizeChange={page.setPageSize}
          page={page.page}
          pageSize={page.perPage}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          total={page.total}
        />
      )}
    </SectionCard>
  );
}

function CentralContent({ catalog }: { catalog: Catalog }) {
  const { movements, openMovementDialog } = useDistribution();
  const [status, setStatus] = useState<DistributionFilter>("all");
  const [search, setSearch] = useState("");
  const [exercise, setExercise] = useState("all");
  const exercises = [...new Set(catalog.origins.map((origin) => origin.exercise))].sort().reverse();
  const origins = filterOriginsByExercise(catalog.origins, exercise);
  const groups = aggregateGroups(origins, movements);
  const filtered = filterGroups(groups, { query: search, status });
  const page = usePagination(filtered, `${exercise}|${status}|${search}`);

  function clearFilters() {
    setExercise("all");
    setSearch("");
    setStatus("all");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={(
          <>
            <Button asChild variant="outline"><Link to="/relatorio"><FileText className="h-4 w-4" strokeWidth={1.75} />Relatório</Link></Button>
            <Button onClick={() => openMovementDialog()} variant="premium"><Plus className="h-4 w-4" strokeWidth={1.75} />Registrar distribuição</Button>
          </>
        )}
        subtitle="Posição consolidada de Grupo → Empresa → Sócio, com saldo, histórico e rastreabilidade das distribuições."
        title="Central de Distribuição de Lucros"
      />
      <DataFilters
        exercise={exercise}
        exercises={exercises}
        onClear={clearFilters}
        onExerciseChange={setExercise}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        search={search}
        status={status}
        statusOptions={groupStatusOptions(groups)}
      />
      <CentralStats groups={filtered} originCount={origins.length} />
      <GroupResults catalog={catalog} clearFilters={clearFilters} movements={movements} page={page} />
    </div>
  );
}

export function CentralPage() {
  return <AppState>{(catalog) => <CentralContent catalog={catalog} />}</AppState>;
}
