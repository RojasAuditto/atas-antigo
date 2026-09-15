import { FileText, Plus, SearchX, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AppState } from "@/components/distribution/AppState";
import { DataFilters, type DistributionFilter } from "@/components/distribution/DataFilters";
import { SectionCard } from "@/components/distribution/SectionCard";
import { ShareholderCard } from "@/components/distribution/ShareholderCard";
import { EmptyState } from "@/components/hub/EmptyState";
import type { FilterPillOption } from "@/components/hub/FilterPills";
import { PageHeader } from "@/components/hub/PageHeader";
import { Pagination } from "@/components/hub/Pagination";
import { StatCard } from "@/components/hub/StatCard";
import { Button } from "@/components/ui/button";
import { useDistribution } from "@/contexts/DistributionContext";
import {
  aggregateShareholders,
  distributionStatus,
  filterOriginsByExercise,
  filterShareholders,
  type ShareholderSummary,
} from "@/domain/aggregations";
import { formatCompactCurrency } from "@/domain/format";
import { PAGE_SIZE_OPTIONS } from "@/domain/pagination";
import type { Catalog, Movement } from "@/domain/schemas";
import { usePagination } from "@/hooks/usePagination";

function shareholderStatusOptions(shareholders: readonly ShareholderSummary[]): readonly FilterPillOption<DistributionFilter>[] {
  const count = (status: "not_started" | "in_progress" | "completed") => shareholders.filter(
    (shareholder) => distributionStatus(shareholder.distributed, shareholder.balance).key === status,
  ).length;

  return [
    { key: "all", label: "Todos", count: shareholders.length },
    { key: "not_started", label: "Não iniciada", count: count("not_started") },
    { key: "in_progress", label: "Em andamento", count: count("in_progress"), tone: "blue" },
    { key: "completed", label: "Concluída", count: count("completed"), tone: "emerald" },
    { key: "attention", label: "Atenção", count: shareholders.filter((shareholder) => shareholder.issues > 0).length, tone: "amber" },
  ];
}

function ShareholderResults({
  clearFilters,
  movements,
  page,
}: {
  clearFilters: () => void;
  movements: readonly Movement[];
  page: ReturnType<typeof usePagination<ShareholderSummary>>;
}) {
  return (
    <SectionCard note={`${page.total} sócios`} title="Posição consolidada">
      {page.total === 0 ? (
        <EmptyState
          action={<Button onClick={clearFilters} size="sm" variant="outline">Limpar filtros</Button>}
          compact
          description="Ajuste os filtros para consultar outros sócios."
          icon={<SearchX className="h-6 w-6" strokeWidth={1.75} />}
          title="Nenhum sócio encontrado"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {page.items.map((shareholder) => <ShareholderCard key={shareholder.key} movements={movements} shareholder={shareholder} />)}
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

function ShareholderStats({ shareholders }: { shareholders: readonly ShareholderSummary[] }) {
  const entitlement = shareholders.reduce((total, shareholder) => total + shareholder.entitlement, 0);
  const distributed = shareholders.reduce((total, shareholder) => total + shareholder.distributed, 0);
  const individual = shareholders.filter((shareholder) => shareholder.type === "PF").length;
  const company = shareholders.filter((shareholder) => shareholder.type === "PJ").length;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard icon={<Users className="h-4 w-4" strokeWidth={1.75} />} label="Sócios únicos" subtitle={`${individual} PF · ${company} PJ`} tone="blue" value={shareholders.length.toLocaleString("pt-BR")} />
      <StatCard label="Direito total" subtitle="Soma dos direitos da base" tone="indigo" value={formatCompactCurrency(entitlement)} />
      <StatCard label="Recebido" subtitle="Distribuições efetivas" tone="emerald" value={formatCompactCurrency(distributed)} />
      <StatCard label="Saldo" subtitle="Direito ainda não recebido" tone="amber" value={formatCompactCurrency(entitlement - distributed)} />
      <StatCard label="Com recebimento" subtitle="Histórico criado no módulo" tone="emerald" value={shareholders.filter((shareholder) => shareholder.distributed > 0).length.toLocaleString("pt-BR")} />
    </div>
  );
}

function ShareholdersContent({ catalog }: { catalog: Catalog }) {
  const { movements, openMovementDialog } = useDistribution();
  const [status, setStatus] = useState<DistributionFilter>("all");
  const [search, setSearch] = useState("");
  const [exercise, setExercise] = useState("all");
  const exercises = [...new Set(catalog.origins.map((origin) => origin.exercise))].sort().reverse();
  const shareholders = aggregateShareholders(filterOriginsByExercise(catalog.origins, exercise), movements);
  const filtered = filterShareholders(shareholders, { query: search, status });
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
        subtitle="Consolidação dos direitos e recebimentos por pessoa física ou jurídica."
        title="Sócios"
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
        statusOptions={shareholderStatusOptions(shareholders)}
      />
      <ShareholderStats shareholders={filtered} />
      <ShareholderResults clearFilters={clearFilters} movements={movements} page={page} />
    </div>
  );
}

export function ShareholdersPage() {
  return <AppState>{(catalog) => <ShareholdersContent catalog={catalog} />}</AppState>;
}
