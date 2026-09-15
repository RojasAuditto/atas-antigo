import { Building2, FileText, Plus, SearchX } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AppState } from "@/components/distribution/AppState";
import { CompanyCard } from "@/components/distribution/CompanyCard";
import { DataFilters, type DistributionFilter } from "@/components/distribution/DataFilters";
import { SectionCard } from "@/components/distribution/SectionCard";
import { EmptyState } from "@/components/hub/EmptyState";
import type { FilterPillOption } from "@/components/hub/FilterPills";
import { PageHeader } from "@/components/hub/PageHeader";
import { Pagination } from "@/components/hub/Pagination";
import { StatCard } from "@/components/hub/StatCard";
import { Button } from "@/components/ui/button";
import { useDistribution } from "@/contexts/DistributionContext";
import {
  aggregateCompanies,
  distributionStatus,
  filterCompanies,
  filterOriginsByExercise,
  type CompanySummary,
} from "@/domain/aggregations";
import { formatCompactCurrency } from "@/domain/format";
import { PAGE_SIZE_OPTIONS } from "@/domain/pagination";
import type { Catalog, Movement } from "@/domain/schemas";
import { usePagination } from "@/hooks/usePagination";

function companyStatusOptions(companies: readonly CompanySummary[]): readonly FilterPillOption<DistributionFilter>[] {
  const count = (status: "not_started" | "in_progress" | "completed") => companies.filter(
    (company) => distributionStatus(company.distributed, company.balance).key === status,
  ).length;

  return [
    { key: "all", label: "Todos", count: companies.length },
    { key: "not_started", label: "Não iniciada", count: count("not_started") },
    { key: "in_progress", label: "Em andamento", count: count("in_progress"), tone: "blue" },
    { key: "completed", label: "Concluída", count: count("completed"), tone: "emerald" },
    { key: "attention", label: "Atenção", count: companies.filter((company) => company.issue).length, tone: "amber" },
  ];
}

function CompanyResults({
  clearFilters,
  movements,
  page,
}: {
  clearFilters: () => void;
  movements: readonly Movement[];
  page: ReturnType<typeof usePagination<CompanySummary>>;
}) {
  return (
    <SectionCard note={`${page.total} resultados`} title="Todos os CNPJs">
      {page.total === 0 ? (
        <EmptyState
          action={<Button onClick={clearFilters} size="sm" variant="outline">Limpar filtros</Button>}
          compact
          description="Ajuste os filtros para consultar outras empresas."
          icon={<SearchX className="h-6 w-6" strokeWidth={1.75} />}
          title="Nenhuma empresa encontrada"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {page.items.map((company) => <CompanyCard company={company} key={company.id} movements={movements} />)}
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

function CompanyStats({ companies }: { companies: readonly CompanySummary[] }) {
  const available = companies.reduce((total, company) => total + company.availableAmount, 0);
  const distributed = companies.reduce((total, company) => total + company.distributed, 0);
  const issues = companies.filter((company) => company.issue).length;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard icon={<Building2 className="h-4 w-4" strokeWidth={1.75} />} label="Empresas" subtitle="CNPJs válidos" tone="blue" value={companies.length.toLocaleString("pt-BR")} />
      <StatCard label="Disponível" subtitle="Valor de origem" tone="indigo" value={formatCompactCurrency(available)} />
      <StatCard label="Distribuído" subtitle="Movimentações efetivas" tone="emerald" value={formatCompactCurrency(distributed)} />
      <StatCard label="Saldo" subtitle="Ainda disponível" tone="amber" value={formatCompactCurrency(available - distributed)} />
      <StatCard label="Divergências" subtitle="Origem x soma dos direitos" tone={issues > 0 ? "rose" : "emerald"} value={issues.toLocaleString("pt-BR")} />
    </div>
  );
}

function CompaniesContent({ catalog }: { catalog: Catalog }) {
  const { movements, openMovementDialog } = useDistribution();
  const [status, setStatus] = useState<DistributionFilter>("all");
  const [search, setSearch] = useState("");
  const [exercise, setExercise] = useState("all");
  const exercises = [...new Set(catalog.origins.map((origin) => origin.exercise))].sort().reverse();
  const companies = aggregateCompanies(filterOriginsByExercise(catalog.origins, exercise), movements);
  const filtered = filterCompanies(companies, { query: search, status });
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
        subtitle="Posição individual de cada CNPJ com direito, distribuído, saldo e composição societária."
        title="Empresas"
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
        statusOptions={companyStatusOptions(companies)}
      />
      <CompanyStats companies={filtered} />
      <CompanyResults clearFilters={clearFilters} movements={movements} page={page} />
    </div>
  );
}

export function CompaniesPage() {
  return <AppState>{(catalog) => <CompaniesContent catalog={catalog} />}</AppState>;
}
