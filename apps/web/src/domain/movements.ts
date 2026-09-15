import { normalizeText } from "./format";
import type { Movement, Origin, Shareholder } from "./schemas";

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

export function effectiveMovements(movements: readonly Movement[]): EffectiveMovement[] {
  return movements.filter((movement): movement is EffectiveMovement => movement.status === "effective");
}

export function movementsForOrigin(
  movements: readonly Movement[],
  originId: string,
  includeReversed = false,
): Movement[] {
  return movements.filter(
    (movement) => movement.originId === originId && (includeReversed || movement.status === "effective"),
  );
}

export function distributedForOrigin(movements: readonly Movement[], originId: string): number {
  return effectiveMovements(movements)
    .filter((movement) => movement.originId === originId)
    .reduce((total, movement) => total + movement.amount, 0);
}

function movementMatchesShareholder(movement: Movement, shareholder: Shareholder): boolean {
  if (shareholder.taxId !== null) return movement.shareholderTaxId === shareholder.taxId;
  return movement.shareholderTaxId === null
    && normalizeText(movement.shareholderName) === normalizeText(shareholder.name);
}

export function distributedForShareholder(
  movements: readonly Movement[],
  originId: string,
  shareholder: Shareholder,
): number {
  return effectiveMovements(movements)
    .filter(
      (movement) => movement.originId === originId && movementMatchesShareholder(movement, shareholder),
    )
    .reduce((total, movement) => total + movement.amount, 0);
}

export function distributedForCompany(movements: readonly Movement[], companyTaxId: string): number {
  return effectiveMovements(movements)
    .filter((movement) => movement.companyTaxId === companyTaxId)
    .reduce((total, movement) => total + movement.amount, 0);
}

export function movementsForGroup(
  origins: readonly Origin[],
  movements: readonly Movement[],
  groupName: string,
  includeReversed = true,
): Movement[] {
  const originIds = new Set(
    origins.filter((origin) => origin.groupName === groupName).map((origin) => origin.id),
  );
  return movements.filter(
    (movement) => originIds.has(movement.originId) && (includeReversed || movement.status === "effective"),
  );
}
