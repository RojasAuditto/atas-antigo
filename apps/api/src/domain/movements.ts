import { z } from "zod";

import {
  movementDraftSchema,
  movementSchema,
  type Catalog,
  type Movement,
  type MovementDraft,
  type Origin,
  type Shareholder,
} from "./distribution-schemas";

const MONEY_TOLERANCE = 0.005;
const LOCAL_ACTOR = "Sessao de desenvolvimento";

export type EffectiveMovement = Extract<Movement, { status: "effective" }>;

export interface MovementPosition {
  origin: Origin;
  shareholder: Shareholder;
  amount: number;
  companyDistributed: number;
  companyBalance: number;
  afterCompany: number;
  shareholderDistributed: number;
  shareholderBalance: number;
  afterShareholder: number;
  groupAvailable: number;
  groupDistributed: number;
  groupBalance: number;
  afterGroup: number;
  shareholderPercentOfBalance: number;
  shareholderPercentOfOriginal: number;
  companyPercentOfBalance: number;
  companyPercentOfOriginal: number;
  groupPercentOfBalance: number;
  groupPercentOfOriginal: number;
}

export class DistributionRuleError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 422,
    readonly details?: readonly unknown[],
  ) {
    super(message);
    this.name = "DistributionRuleError";
  }
}

function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

function effectiveMovements(movements: readonly Movement[]): EffectiveMovement[] {
  return movements.filter((movement): movement is EffectiveMovement => movement.status === "effective");
}

function distributedForOrigin(movements: readonly Movement[], originId: string): number {
  return effectiveMovements(movements)
    .filter((movement) => movement.originId === originId)
    .reduce((total, movement) => total + movement.amount, 0);
}

function movementMatchesShareholder(movement: Movement, shareholder: Shareholder): boolean {
  if (shareholder.taxId !== null) return movement.shareholderTaxId === shareholder.taxId;
  return movement.shareholderTaxId === null
    && normalizeText(movement.shareholderName) === normalizeText(shareholder.name);
}

function distributedForShareholder(
  movements: readonly Movement[],
  originId: string,
  shareholder: Shareholder,
): number {
  return effectiveMovements(movements)
    .filter((movement) => movement.originId === originId && movementMatchesShareholder(movement, shareholder))
    .reduce((total, movement) => total + movement.amount, 0);
}

function findDraftShareholder(origin: Origin, draft: MovementDraft): Shareholder | undefined {
  if (draft.shareholderTaxId !== null) {
    return origin.shareholders.find((shareholder) => shareholder.taxId === draft.shareholderTaxId);
  }
  const name = normalizeText(draft.shareholderName);
  return name === ""
    ? undefined
    : origin.shareholders.find(
      (shareholder) => shareholder.taxId === null && normalizeText(shareholder.name) === name,
    );
}

function percent(numerator: number, denominator: number): number {
  return denominator > 0 ? (numerator / denominator) * 100 : 0;
}

export function calculateMovementPosition(
  origins: readonly Origin[],
  movements: readonly Movement[],
  draft: MovementDraft,
): MovementPosition | null {
  const origin = origins.find((candidate) => candidate.id === draft.originId);
  if (origin === undefined) return null;
  const shareholder = findDraftShareholder(origin, draft);
  if (shareholder === undefined) return null;

  const companyDistributed = distributedForOrigin(movements, origin.id);
  const shareholderDistributed = distributedForShareholder(movements, origin.id, shareholder);
  const groupOrigins = origins.filter((candidate) => candidate.groupName === origin.groupName);
  const groupAvailable = groupOrigins.reduce((total, candidate) => total + candidate.availableAmount, 0);
  const groupDistributed = groupOrigins.reduce(
    (total, candidate) => total + distributedForOrigin(movements, candidate.id),
    0,
  );
  const companyBalance = origin.availableAmount - companyDistributed;
  const shareholderBalance = shareholder.entitlement - shareholderDistributed;
  const groupBalance = groupAvailable - groupDistributed;

  return {
    origin,
    shareholder,
    amount: draft.amount,
    companyDistributed,
    companyBalance,
    afterCompany: companyBalance - draft.amount,
    shareholderDistributed,
    shareholderBalance,
    afterShareholder: shareholderBalance - draft.amount,
    groupAvailable,
    groupDistributed,
    groupBalance,
    afterGroup: groupBalance - draft.amount,
    shareholderPercentOfBalance: percent(draft.amount, shareholderBalance),
    shareholderPercentOfOriginal: percent(draft.amount, shareholder.entitlement),
    companyPercentOfBalance: percent(draft.amount, companyBalance),
    companyPercentOfOriginal: percent(draft.amount, origin.availableAmount),
    groupPercentOfBalance: percent(draft.amount, groupBalance),
    groupPercentOfOriginal: percent(draft.amount, groupAvailable),
  };
}

export function validateMovementDraft(
  catalog: Catalog,
  movements: readonly Movement[],
  input: unknown,
): { draft: MovementDraft; position: MovementPosition } {
  const parsed = movementDraftSchema.safeParse(input);
  if (!parsed.success) {
    throw new DistributionRuleError(
      "INVALID_DRAFT",
      "Revise os campos da distribuicao.",
      400,
      parsed.error.issues.map((issue) => ({
        path: issue.path.map(String).join("."),
        message: issue.message,
      })),
    );
  }

  const position = calculateMovementPosition(catalog.origins, movements, parsed.data);
  if (position === null) {
    throw new DistributionRuleError("INVALID_SELECTION", "Selecione uma origem e um socio validos.");
  }
  if (parsed.data.amount <= 0) {
    throw new DistributionRuleError("NON_POSITIVE_AMOUNT", "Informe um valor maior que zero.");
  }

  const limits = [
    ["EXCEEDS_SHAREHOLDER_BALANCE", position.shareholderBalance, "socio"],
    ["EXCEEDS_COMPANY_BALANCE", position.companyBalance, "empresa"],
    ["EXCEEDS_GROUP_BALANCE", position.groupBalance, "grupo"],
  ] as const;

  for (const [code, balance, owner] of limits) {
    const excess = parsed.data.amount - balance;
    if (excess > MONEY_TOLERANCE) {
      throw new DistributionRuleError(
        code,
        `O valor excede o saldo disponivel do ${owner}.`,
        422,
        [{ path: "amount", excess }],
      );
    }
  }

  return { draft: parsed.data, position };
}

export function createMovement(
  catalog: Catalog,
  movements: readonly Movement[],
  input: unknown,
  now = new Date(),
): Movement {
  const { draft, position } = validateMovementDraft(catalog, movements, input);
  return movementSchema.parse({
    id: crypto.randomUUID(),
    originId: position.origin.id,
    groupName: position.origin.groupName,
    companyTaxId: position.origin.companyTaxId,
    companyName: position.origin.companyName,
    shareholderTaxId: position.shareholder.taxId,
    shareholderName: position.shareholder.name,
    amount: Number(draft.amount.toFixed(2)),
    date: draft.date,
    reference: draft.reference,
    proofName: draft.proofName,
    note: draft.note,
    paymentMethod: draft.paymentMethod,
    status: "effective",
    createdAt: now.toISOString(),
    createdBy: LOCAL_ACTOR,
  });
}

export function reverseMovement(
  movements: readonly Movement[],
  id: string,
  now = new Date(),
): Movement[] {
  const current = movements.find((movement) => movement.id === id);
  if (current?.status !== "effective") {
    throw new DistributionRuleError("MOVEMENT_NOT_FOUND", "Movimentacao efetiva nao encontrada.", 404);
  }
  const reversed = movementSchema.parse({
    ...current,
    status: "reversed",
    reversedAt: now.toISOString(),
    reversedBy: LOCAL_ACTOR,
  });
  return movements.map((movement) => (movement.id === id ? reversed : movement));
}

export function parseImportedMovements(input: unknown): Movement[] {
  try {
    return z.array(movementSchema).parse(input);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new DistributionRuleError("INVALID_IMPORT", "O historico local e invalido.", 400);
    }
    throw error;
  }
}

