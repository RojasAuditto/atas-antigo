import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import type { Movement } from "../src/domain/distribution-schemas";
import { FileMovementRepository } from "../src/repositories/movement-repository";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true }),
  ));
});

describe("FileMovementRepository", () => {
  it("serializes concurrent updates without losing movements", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "pomin-movements-"));
    temporaryDirectories.push(directory);
    const repository = new FileMovementRepository(path.join(directory, "movements.json"));

    await Promise.all(Array.from({ length: 10 }, (_, index) =>
      repository.update((current) => [...current, createMovement(String(index))]),
    ));

    const stored = await repository.list();
    expect(stored).toHaveLength(10);
    expect(new Set(stored.map((movement) => movement.id)).size).toBe(10);
  });
});

function createMovement(id: string): Movement {
  return {
    id,
    originId: "origin",
    groupName: "Grupo",
    companyTaxId: "00.000.000/0001-00",
    companyName: "Empresa",
    shareholderTaxId: "000.000.000-00",
    shareholderName: "Socio",
    amount: 1,
    date: "2026-09-14",
    reference: "",
    proofName: "",
    note: "",
    paymentMethod: "PIX",
    status: "effective",
    createdAt: "2026-09-14T12:00:00.000Z",
    createdBy: "Teste",
  };
}
