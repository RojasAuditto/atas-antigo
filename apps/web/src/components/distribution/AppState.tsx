import { AlertTriangle, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/hub/EmptyState";
import { LoadingState } from "@/components/hub/LoadingState";
import { Button } from "@/components/ui/button";
import { useDistribution } from "@/contexts/DistributionContext";
import type { Catalog } from "@/domain/schemas";

interface AppStateProps {
  children: (catalog: Catalog) => ReactNode;
}

export function AppState({ children }: AppStateProps) {
  const {
    catalog,
    isLoading,
    loadError,
    reloadCatalog,
    storageError,
  } = useDistribution();

  if (isLoading) {
    return <LoadingState fullPage label="Carregando a posição de lucros..." />;
  }

  if (loadError !== null || catalog === null) {
    return (
      <EmptyState
        action={(
          <Button onClick={reloadCatalog} variant="outline">
            <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
            Tentar novamente
          </Button>
        )}
        description={loadError ?? "A base de origens não está disponível."}
        icon={<AlertTriangle className="h-6 w-6" strokeWidth={1.75} />}
        title="Não foi possível carregar os dados"
      />
    );
  }

  return (
    <>
      {storageError !== null && (
        <div
          className="mb-4 flex items-start gap-2 rounded-2xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning-ink"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>{storageError}</span>
        </div>
      )}
      {children(catalog)}
    </>
  );
}
