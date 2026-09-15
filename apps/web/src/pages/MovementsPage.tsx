import { FileCheck2, FileText, Plus, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AppState } from "@/components/distribution/AppState";
import { MovementList } from "@/components/distribution/MovementList";
import { SectionCard } from "@/components/distribution/SectionCard";
import { PageHeader } from "@/components/hub/PageHeader";
import { Pagination } from "@/components/hub/Pagination";
import { StatCard } from "@/components/hub/StatCard";
import { Button } from "@/components/ui/button";
import { useDistribution } from "@/contexts/DistributionContext";
import { formatCompactCurrency } from "@/domain/format";
import { effectiveMovements } from "@/domain/movements";
import { PAGE_SIZE_OPTIONS } from "@/domain/pagination";
import type { Catalog, Movement } from "@/domain/schemas";
import { usePagination } from "@/hooks/usePagination";

function sortMovements(movements: readonly Movement[]): Movement[] {
  return [...movements].sort(
    (left, right) => right.date.localeCompare(left.date) || right.createdAt.localeCompare(left.createdAt),
  );
}

function MovementStats({ movements }: { movements: readonly Movement[] }) {
  const effective = effectiveMovements(movements);
  const reversed = movements.length - effective.length;
  const distributed = effective.reduce((total, movement) => total + movement.amount, 0);
  const withProof = effective.filter((movement) => movement.proofName.trim() !== "").length;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Lançamentos" subtitle="Inclui estornos" tone="blue" value={movements.length.toLocaleString("pt-BR")} />
      <StatCard label="Efetivos" subtitle="Movimentações válidas" tone="emerald" value={effective.length.toLocaleString("pt-BR")} />
      <StatCard label="Distribuído" subtitle="Total efetivo" tone="indigo" value={formatCompactCurrency(distributed)} />
      <StatCard label="Estornados" subtitle="Preservados para auditoria" tone="rose" value={reversed.toLocaleString("pt-BR")} />
      <StatCard icon={<FileCheck2 className="h-4 w-4" strokeWidth={1.75} />} label="Com comprovante" subtitle="Arquivo referenciado" tone="amber" value={withProof.toLocaleString("pt-BR")} />
    </div>
  );
}

function MovementsContent({ catalog }: { catalog: Catalog }) {
  const { movements, openMovementDialog, resetMovements } = useDistribution();
  const sorted = sortMovements(movements);
  const page = usePagination(sorted, "movement-list");

  async function reset() {
    if (!window.confirm("Remover todas as movimentações e voltar para R$ 0 distribuído?")) return;
    const result = await resetMovements();
    if (result.ok) toast.success("Movimentações removidas.");
    else toast.error(result.message);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={(
          <>
            <Button disabled={movements.length === 0} onClick={reset} variant="outline"><RotateCcw className="h-4 w-4" strokeWidth={1.75} />Resetar lançamentos</Button>
            <Button asChild variant="outline"><Link to="/relatorio"><FileText className="h-4 w-4" strokeWidth={1.75} />Relatório</Link></Button>
            <Button onClick={() => openMovementDialog()} variant="premium"><Plus className="h-4 w-4" strokeWidth={1.75} />Registrar distribuição</Button>
          </>
        )}
        subtitle="Livro de distribuições criado a partir dos lançamentos realizados neste módulo."
        title="Movimentações"
      />
      <MovementStats movements={sorted} />
      <SectionCard
        note="Histórico criado neste módulo; estornos permanecem visíveis para auditoria"
        title="Extrato completo"
      >
        <MovementList movements={page.items} origins={catalog.origins} showActions />
        <Pagination
          onPageChange={page.setPage}
          onPageSizeChange={page.setPageSize}
          page={page.page}
          pageSize={page.perPage}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          total={page.total}
        />
      </SectionCard>
    </div>
  );
}

export function MovementsPage() {
  return <AppState>{(catalog) => <MovementsContent catalog={catalog} />}</AppState>;
}
