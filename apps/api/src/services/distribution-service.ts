import type { Movement } from "../domain/distribution-schemas";
import {
  calculateMovementPosition,
  createMovement,
  DistributionRuleError,
  parseImportedMovements,
  reverseMovement,
  validateMovementDraft,
} from "../domain/movements";
import { readProfitData } from "../lib/profit-data";
import type { MovementRepository } from "../repositories/movement-repository";

export async function listMovements(repository: MovementRepository): Promise<Movement[]> {
  return repository.list();
}

export async function previewMovement(repository: MovementRepository, input: unknown) {
  const [catalog, movements] = await Promise.all([readProfitData(), repository.list()]);
  return validateMovementDraft(catalog, movements, input).position;
}

export async function registerMovement(
  repository: MovementRepository,
  input: unknown,
): Promise<Movement[]> {
  const catalog = await readProfitData();
  return repository.update((movements) => [
    ...movements,
    createMovement(catalog, movements, input),
  ]);
}

export async function reverseRegisteredMovement(
  repository: MovementRepository,
  id: string,
): Promise<Movement[]> {
  return repository.update((movements) => reverseMovement(movements, id));
}

export async function resetRegisteredMovements(repository: MovementRepository): Promise<Movement[]> {
  await repository.replace([]);
  return [];
}

export async function importLegacyMovements(
  repository: MovementRepository,
  input: unknown,
): Promise<Movement[]> {
  const [catalog, imported] = await Promise.all([
    readProfitData(),
    Promise.resolve(parseImportedMovements(input)),
  ]);
  return repository.update((current) => {
    const byId = new Map(current.map((movement) => [movement.id, movement]));
    for (const movement of imported) {
      const existing = byId.get(movement.id);
      if (existing !== undefined && JSON.stringify(existing) !== JSON.stringify(movement)) {
        throw new DistributionRuleError(
          "IMPORT_CONFLICT",
          "O historico local conflita com uma movimentacao ja persistida.",
          409,
        );
      }
      if (existing === undefined) byId.set(movement.id, movement);
    }
    const merged = [...byId.values()];
    for (const movement of merged) {
      if (calculateMovementPosition(catalog.origins, [], toDraft(movement)) === null) {
        throw new DistributionRuleError(
          "INVALID_IMPORT",
          "Uma movimentacao do historico local nao corresponde ao catalogo atual.",
          422,
        );
      }
    }
    const effective = merged.filter((movement) => movement.status === "effective");
    const accepted: Movement[] = [];
    for (const movement of effective.sort((left, right) => left.createdAt.localeCompare(right.createdAt))) {
      validateMovementDraft(catalog, accepted, toDraft(movement));
      accepted.push(movement);
    }
    return merged;
  });
}

function toDraft(movement: Movement) {
  return {
    originId: movement.originId,
    shareholderTaxId: movement.shareholderTaxId,
    shareholderName: movement.shareholderName,
    amount: movement.amount,
    date: movement.date,
    reference: movement.reference,
    proofName: movement.proofName,
    note: movement.note,
    paymentMethod: movement.paymentMethod,
  };
}
