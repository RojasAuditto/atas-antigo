import { AlertTriangle, RefreshCw } from "lucide-react";
import { lazy, Suspense, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { MovementDialog } from "@/components/distribution/MovementDialog";
import { EmptyState } from "@/components/hub/EmptyState";
import { LoadingState } from "@/components/hub/LoadingState";
import { HubLayout } from "@/components/layout/HubLayout";
import { Button } from "@/components/ui/button";
import { useDistribution } from "@/contexts/DistributionContext";
import { CentralPage } from "@/pages/CentralPage";
import { CompaniesPage } from "@/pages/CompaniesPage";
import { CompanyPage } from "@/pages/CompanyPage";
import { GroupPage } from "@/pages/GroupPage";
import { MovementsPage } from "@/pages/MovementsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ShareholderPage } from "@/pages/ShareholderPage";
import { ShareholdersPage } from "@/pages/ShareholdersPage";

const ReportPage = lazy(() => import("@/pages/ReportPage").then((module) => ({
  default: module.ReportPage,
})));

function CatalogBoundary({ children }: { children: ReactNode }) {
  const { catalog, isLoading, loadError, reloadCatalog } = useDistribution();
  if (isLoading) return <LoadingState fullPage label="Carregando a posição de lucros..." />;
  if (catalog === null || loadError !== null) {
    return (
      <EmptyState
        action={(
          <Button onClick={reloadCatalog} variant="outline">
            <RefreshCw className="h-4 w-4" strokeWidth={1.75} />Tentar novamente
          </Button>
        )}
        description={loadError ?? "A base de origens não está disponível."}
        icon={<AlertTriangle className="h-6 w-6" strokeWidth={1.75} />}
        title="Não foi possível carregar os dados"
      />
    );
  }
  return children;
}

export function App() {
  return (
    <>
      <HubLayout>
        <CatalogBoundary>
          <Suspense fallback={<LoadingState fullPage label="Carregando a tela..." />}>
            <Routes>
              <Route element={<CentralPage />} path="/" />
              <Route element={<GroupPage />} path="/grupos/:groupName" />
              <Route element={<CompaniesPage />} path="/empresas" />
              <Route element={<CompanyPage />} path="/empresas/:originId" />
              <Route element={<ShareholdersPage />} path="/socios" />
              <Route element={<ShareholderPage />} path="/socios/:entityId" />
              <Route element={<MovementsPage />} path="/movimentacoes" />
              <Route element={<ReportPage />} path="/relatorio" />
              <Route element={<NotFoundPage />} path="*" />
            </Routes>
          </Suspense>
        </CatalogBoundary>
      </HubLayout>
      <MovementDialog />
      <Toaster closeButton position="top-right" richColors />
    </>
  );
}
