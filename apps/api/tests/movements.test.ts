import { describe, expect, it } from "vitest";

import type {
  Catalog,
  Movement,
  MovementDraft,
  Origin,
  Shareholder,
} from "../src/domain/distribution-schemas";
import {
  calculateMovementPosition,
  createMovement,
  DistributionRuleError,
  reverseMovement,
  validateMovementDraft,
} from "../src/domain/movements";

const shareholder: Shareholder = {
  name: "Ana Lucia",
  type: "PF",
  taxId: "111.111.111-11",
  percentage: 100,
  entitlement: 600,
};

function createOrigin(overrides: Partial<Origin> = {}): Origin {
  return {
    id: "o1",
    companyTaxId: "11.111.111/0001-11",
    companyName: "Empresa Arvore Ltda",
    groupName: "Grupo Arvore",
    sourceStatus: "Registrado",
    exercise: "2025",
    sourceDate: "2025-12-23",
    deadline: "2028-12-31",
    availableAmount: 1_000,
    allocatedAmount: 1_000,
    allocationPercent: 100,
    shareholders: [shareholder],
    ...overrides,
  };
}

const origins = [
  createOrigin(),
  createOrigin({
    id: "o2",
    companyTaxId: "22.222.222/0001-22",
    companyName: "Empresa Cedro Ltda",
    availableAmount: 500,
    allocatedAmount: 500,
    shareholders: [{ ...shareholder, entitlement: 500 }],
  }),
];

const catalog: Catalog = {
  meta: {
    source: "fixture.xlsx",
    generatedAt: "2026-08-25",
    initialDistributed: 0,
    deadlineDefault: "2028-12-31",
    ignoredStatuses: [],
    validOrigins: 2,
    groups: 1,
    companies: 2,
    shareholders: 1,
    availableTotal: 1_500,
  },
  origins,
};

function createDraft(overrides: Partial<MovementDraft> = {}): MovementDraft {
  return {
    originId: "o1",
    shareholderTaxId: shareholder.taxId,
    shareholderName: shareholder.name,
    amount: 200,
    date: "2026-09-01",
    reference: "REF-1",
    proofName: "comprovante.pdf",
    note: "",
    paymentMethod: "PIX",
    ...overrides,
  };
}

function effectiveMovement(overrides: Partial<Movement> = {}): Movement {
  return {
    id: "m1",
    originId: "o1",
    groupName: "Grupo Arvore",
    companyTaxId: "11.111.111/0001-11",
    companyName: "Empresa Arvore Ltda",
    shareholderTaxId: shareholder.taxId,
    shareholderName: shareholder.name,
    amount: 100,
    date: "2026-08-20",
    reference: "REF-0",
    proofName: "",
    note: "",
    paymentMethod: "TED",
    status: "effective",
    createdAt: "2026-08-20T15:00:00.000Z",
    createdBy: "Teste",
    ...overrides,
  } as Movement;
}

function expectRuleError(action: () => unknown, code: string): void {
  try {
    action();
    throw new Error("Expected a DistributionRuleError.");
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(DistributionRuleError);
    expect((error as DistributionRuleError).code).toBe(code);
  }
}

describe("movement business rules", () => {
  it("calculates the preview from authoritative balances", () => {
    const position = calculateMovementPosition(origins, [effectiveMovement()], createDraft());
    expect(position).toMatchObject({
      companyDistributed: 100,
      companyBalance: 900,
      afterCompany: 700,
      shareholderDistributed: 100,
      shareholderBalance: 500,
      afterShareholder: 300,
      groupAvailable: 1_500,
      groupDistributed: 100,
      groupBalance: 1_400,
      afterGroup: 1_200,
    });
  });

  it("rejects invalid selection, non-positive amounts and balance overflow", () => {
    expectRuleError(
      () => validateMovementDraft(catalog, [], createDraft({ originId: "missing" })),
      "INVALID_SELECTION",
    );
    expectRuleError(
      () => validateMovementDraft(catalog, [], createDraft({ amount: 0 })),
      "NON_POSITIVE_AMOUNT",
    );
    expectRuleError(
      () => validateMovementDraft(catalog, [effectiveMovement()], createDraft({ amount: 500.006 })),
      "EXCEEDS_SHAREHOLDER_BALANCE",
    );
    expect(() => validateMovementDraft(
      catalog,
      [effectiveMovement()],
      createDraft({ amount: 500.005 }),
    )).not.toThrow();
  });

  it("creates canonical server data and preserves reversals for audit", () => {
    const created = createMovement(catalog, [], createDraft(), new Date("2026-09-01T15:00:00.000Z"));
    expect(created).toMatchObject({
      companyName: "Empresa Arvore Ltda",
      amount: 200,
      status: "effective",
      createdAt: "2026-09-01T15:00:00.000Z",
    });

    const [reversed] = reverseMovement([created], created.id, new Date("2026-09-02T15:00:00.000Z"));
    if (reversed === undefined) throw new Error("The reversed movement was not returned.");
    expect(reversed).toMatchObject({
      id: created.id,
      status: "reversed",
      reversedAt: "2026-09-02T15:00:00.000Z",
    });
    expectRuleError(() => reverseMovement([reversed], reversed.id), "MOVEMENT_NOT_FOUND");
  });
});
