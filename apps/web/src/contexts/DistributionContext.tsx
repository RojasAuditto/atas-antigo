import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MovementPosition } from "@/domain/movements";
import type { Catalog, Movement, MovementDraft } from "@/domain/schemas";
import { getCatalog } from "@/lib/catalogStore";
import {
  loadMovementsWithLegacyMigration,
  previewMovement as requestMovementPreview,
  registerMovement as requestMovementRegistration,
  resetMovements as requestMovementReset,
  reverseMovement as requestMovementReversal,
} from "@/lib/movementStore";

export interface MovementPrefill {
  originId?: string;
  shareholderTaxId?: string | null;
}

type ActionResult = { ok: true } | { ok: false; message: string };

interface DistributionContextValue {
  catalog: Catalog | null;
  movements: Movement[];
  isLoading: boolean;
  loadError: string | null;
  storageError: string | null;
  dialogOpen: boolean;
  dialogPrefill: MovementPrefill;
  reloadCatalog: () => void;
  openMovementDialog: (prefill?: MovementPrefill) => void;
  closeMovementDialog: () => void;
  previewMovement: (draft: MovementDraft, signal: AbortSignal) => Promise<MovementPosition>;
  registerMovement: (draft: MovementDraft) => Promise<ActionResult>;
  reverseMovement: (id: string) => Promise<ActionResult>;
  resetMovements: () => Promise<ActionResult>;
}

const DistributionContext = createContext<DistributionContextValue | null>(null);

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : "Nao foi possivel processar a solicitacao.";
}

export function DistributionProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogPrefill, setDialogPrefill] = useState<MovementPrefill>({});

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    Promise.all([
      getCatalog(controller.signal),
      loadMovementsWithLegacyMigration(controller.signal),
    ])
      .then(([nextCatalog, movementState]) => {
        setCatalog(nextCatalog);
        setMovements(movementState.movements);
        setStorageError(movementState.warning);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setLoadError(errorMessage(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const registerMovement = useCallback(async (draft: MovementDraft): Promise<ActionResult> => {
    try {
      setMovements(await requestMovementRegistration(draft));
      setStorageError(null);
      return { ok: true };
    } catch (reason: unknown) {
      const message = errorMessage(reason);
      setStorageError(message);
      return { ok: false, message };
    }
  }, []);

  const reverseMovement = useCallback(async (id: string): Promise<ActionResult> => {
    try {
      setMovements(await requestMovementReversal(id));
      setStorageError(null);
      return { ok: true };
    } catch (reason: unknown) {
      const message = errorMessage(reason);
      setStorageError(message);
      return { ok: false, message };
    }
  }, []);

  const resetMovements = useCallback(async (): Promise<ActionResult> => {
    try {
      setMovements(await requestMovementReset());
      setStorageError(null);
      return { ok: true };
    } catch (reason: unknown) {
      const message = errorMessage(reason);
      setStorageError(message);
      return { ok: false, message };
    }
  }, []);

  const value = useMemo<DistributionContextValue>(() => ({
    catalog,
    movements,
    isLoading,
    loadError,
    storageError,
    dialogOpen,
    dialogPrefill,
    reloadCatalog: () => setReloadKey((key) => key + 1),
    openMovementDialog: (prefill = {}) => {
      setDialogPrefill(prefill);
      setDialogOpen(true);
    },
    closeMovementDialog: () => setDialogOpen(false),
    previewMovement: requestMovementPreview,
    registerMovement,
    reverseMovement,
    resetMovements,
  }), [
    catalog,
    dialogOpen,
    dialogPrefill,
    isLoading,
    loadError,
    movements,
    registerMovement,
    resetMovements,
    reverseMovement,
    storageError,
  ]);

  return <DistributionContext.Provider value={value}>{children}</DistributionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDistribution(): DistributionContextValue {
  const context = useContext(DistributionContext);
  if (context === null) throw new Error("useDistribution deve ser usado dentro de DistributionProvider.");
  return context;
}
