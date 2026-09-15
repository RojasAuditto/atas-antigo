import { z } from "zod";
import {
  movementListSchema,
  originSchema,
  shareholderSchema,
  type Movement,
  type MovementDraft,
} from "@/domain/schemas";
import type { MovementPosition } from "@/domain/movements";

const LEGACY_STORAGE_KEY = "pomin-profit-distribution-movements-v2";
const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

const apiErrorSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});

const movementResponseSchema = z.object({
  data: movementListSchema,
  meta: z.object({ requestId: z.string() }),
});

const movementPositionSchema = z.object({
  origin: originSchema,
  shareholder: shareholderSchema,
  amount: z.number(),
  companyDistributed: z.number(),
  companyBalance: z.number(),
  afterCompany: z.number(),
  shareholderDistributed: z.number(),
  shareholderBalance: z.number(),
  afterShareholder: z.number(),
  groupAvailable: z.number(),
  groupDistributed: z.number(),
  groupBalance: z.number(),
  afterGroup: z.number(),
  shareholderPercentOfBalance: z.number(),
  shareholderPercentOfOriginal: z.number(),
  companyPercentOfBalance: z.number(),
  companyPercentOfOriginal: z.number(),
  groupPercentOfBalance: z.number(),
  groupPercentOfOriginal: z.number(),
});

const previewResponseSchema = z.object({
  data: movementPositionSchema,
  meta: z.object({ requestId: z.string() }),
});

export class DistributionApiError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "DistributionApiError";
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (reason: unknown) {
    throw new Error("A API retornou uma resposta invalida.", { cause: reason });
  }
}

async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body === undefined ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });
  const payload = parseJson(await response.text());
  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(payload);
    throw new DistributionApiError(
      parsed.success ? parsed.data.error.code : "API_ERROR",
      parsed.success ? parsed.data.error.message : "Nao foi possivel processar a movimentacao.",
    );
  }
  return payload;
}

export async function getMovements(signal: AbortSignal): Promise<Movement[]> {
  return movementResponseSchema.parse(await request("/api/v1/movements", { signal })).data;
}

export async function registerMovement(draft: MovementDraft): Promise<Movement[]> {
  return movementResponseSchema.parse(await request("/api/v1/movements", {
    method: "POST",
    body: JSON.stringify(draft),
  })).data;
}

export async function previewMovement(
  draft: MovementDraft,
  signal: AbortSignal,
): Promise<MovementPosition> {
  return previewResponseSchema.parse(await request("/api/v1/movements/preview", {
    method: "POST",
    body: JSON.stringify(draft),
    signal,
  })).data as MovementPosition;
}

export async function reverseMovement(id: string): Promise<Movement[]> {
  return movementResponseSchema.parse(await request(
    `/api/v1/movements/${encodeURIComponent(id)}/reversal`,
    { method: "POST" },
  )).data;
}

export async function resetMovements(): Promise<Movement[]> {
  return movementResponseSchema.parse(await request("/api/v1/movements", {
    method: "DELETE",
  })).data;
}

export async function loadMovementsWithLegacyMigration(
  signal: AbortSignal,
): Promise<{ movements: Movement[]; warning: string | null }> {
  let legacy: Movement[] | null = null;
  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (stored !== null) legacy = movementListSchema.parse(JSON.parse(stored));
  } catch (reason: unknown) {
    const movements = await getMovements(signal);
    return {
      movements,
      warning: reason instanceof Error
        ? `O historico local antigo nao pode ser migrado: ${reason.message}`
        : "O historico local antigo nao pode ser migrado.",
    };
  }

  if (legacy === null || legacy.length === 0) {
    return { movements: await getMovements(signal), warning: null };
  }

  const movements = movementResponseSchema.parse(await request("/api/v1/movements/import", {
    method: "POST",
    body: JSON.stringify(legacy),
    signal,
  })).data;
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return { movements, warning: null };
  } catch {
    return {
      movements,
      warning: "Os dados foram migrados para o backend, mas o armazenamento antigo nao pode ser removido.",
    };
  }
}

