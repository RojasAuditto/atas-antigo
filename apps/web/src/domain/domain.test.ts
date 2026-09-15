import { describe, expect, it } from "vitest";
import {
  aggregateCompanies,
  aggregateGroups,
  aggregateShareholders,
  catalogSchema,
  dateInSaoPaulo,
  distributionStatus,
  effectiveMovements,
  filterCompanies,
  filterGroups,
  filterOriginsByExercise,
  filterShareholders,
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatMoneyInput,
  formatPercent,
  movementSchema,
  normalizeText,
  originIssue,
  paginate,
  parseMoney,
  reportMovements,
  reportTotals,
  resolveReportScope,
  type Catalog,
  type EffectiveMovement,
  type Movement,
  type Origin,
  type Shareholder,
} from "./index";

const ana: Shareholder = {
  name: "Ana Lúcia",
  type: "PF",
  taxId: "111.111.111-11",
  percentage: 60,
  entitlement: 600,
};

const holding: Shareholder = {
  name: "Holding Exemplo Ltda",
  type: "PJ",
  taxId: "22.222.222/0001-22",
  percentage: 40,
  entitlement: 400,
};

function createOrigin(overrides: Partial<Origin> = {}): Origin {
  return {
    id: "o1",
    companyTaxId: "11.111.111/0001-11",
    companyName: "Empresa Árvore Ltda",
    groupName: "Grupo Árvore",
    sourceStatus: "Registrado",
    exercise: "2025",
    sourceDate: "2025-12-23",
    deadline: "2028-12-31",
    availableAmount: 1_000,
    allocatedAmount: 1_000,
    allocationPercent: 100,
    shareholders: [ana, holding],
    ...overrides,
  };
}

const origins: Origin[] = [
  createOrigin(),
  createOrigin({
    id: "o2",
    companyTaxId: "33.333.333/0001-33",
    companyName: "Empresa Cedro Ltda",
    availableAmount: 500,
    allocatedAmount: 500,
    shareholders: [{ ...ana, name: "ANA LUCIA", percentage: 100, entitlement: 500 }],
  }),
  createOrigin({
    id: "o3",
    companyTaxId: "44.444.444/0001-44",
    companyName: "Empresa Bairro Ltda",
    groupName: "Grupo Bairro",
    exercise: "2026",
    availableAmount: 200,
    allocatedAmount: 150,
    allocationPercent: 75,
    shareholders: [{
      name: "João Silva",
      type: "PF",
      taxId: "333.333.333-33",
      percentage: 75,
      entitlement: 150,
    }],
  }),
];

function createEffectiveMovement(overrides: Partial<EffectiveMovement> = {}): EffectiveMovement {
  return {
    id: "m1",
    originId: "o1",
    groupName: "Grupo Árvore",
    companyTaxId: "11.111.111/0001-11",
    companyName: "Empresa Árvore Ltda",
    shareholderTaxId: ana.taxId,
    shareholderName: ana.name,
    amount: 100,
    date: "2026-08-20",
    reference: "REF-1",
    proofName: "comprovante.pdf",
    note: "",
    paymentMethod: "TED",
    status: "effective",
    createdAt: "2026-08-20T15:00:00.000Z",
    createdBy: "Usuário Teste",
    ...overrides,
  };
}

const reversedMovement: Movement = {
  ...createEffectiveMovement({ id: "m2", amount: 50 }),
  status: "reversed",
  reversedAt: "2026-08-21T15:00:00.000Z",
  reversedBy: "Usuário Teste",
};

const movements: Movement[] = [
  createEffectiveMovement(),
  reversedMovement,
  createEffectiveMovement({
    id: "m3",
    originId: "o2",
    companyTaxId: "33.333.333/0001-33",
    companyName: "Empresa Cedro Ltda",
    shareholderName: "ANA LUCIA",
    amount: 50,
    date: "2026-08-10",
    createdAt: "2026-08-10T15:00:00.000Z",
  }),
];

const catalog: Catalog = {
  meta: {
    source: "fixture.xlsx",
    generatedAt: "2026-08-25",
    initialDistributed: 0,
    deadlineDefault: "2028-12-31",
    ignoredStatuses: ["Pendente", "Documento Gerado"],
    validOrigins: 3,
    groups: 2,
    companies: 3,
    shareholders: 3,
    availableTotal: 1_700,
  },
  origins,
};

describe("schemas de fronteira", () => {
  it("valida catálogo e rejeita propriedades desconhecidas", () => {
    expect(catalogSchema.parse(catalog)).toEqual(catalog);
    expect(catalogSchema.safeParse({
      ...catalog,
      origins: [{ ...origins[0], allocationPercent: 100.001 }],
    }).success).toBe(true);
    expect(catalogSchema.safeParse({ ...catalog, unexpected: true }).success).toBe(false);
  });

  it("discrimina movimentos efetivos e estornados", () => {
    expect(movementSchema.safeParse(movements[0]).success).toBe(true);
    expect(movementSchema.safeParse(reversedMovement).success).toBe(true);
    expect(movementSchema.safeParse({ ...movements[0], extra: true }).success).toBe(false);
    expect(movementSchema.safeParse({ ...movements[0], status: "reversed" }).success).toBe(false);
  });
});

describe("formatação e normalização", () => {
  it("formata números conforme pt-BR", () => {
    expect(formatCurrency(1_234.5).replace(/\u00a0/g, " ")).toBe("R$ 1.234,50");
    expect(formatCompactCurrency(1_500_000)).toBe("R$ 1,5 mi");
    expect(formatPercent(12.34)).toBe("12,3%");
    expect(parseMoney("R$ 1.234,56")).toBe(1_234.56);
    expect(formatMoneyInput("123456")).toBe("1.234,56");
  });

  it("preserva data civil e converte timestamps para São Paulo", () => {
    expect(formatDate("2026-09-01")).toBe("01/09/2026");
    expect(formatDate("2026-09-01T01:00:00.000Z")).toBe("31/08/2026");
    expect(dateInSaoPaulo(new Date("2026-09-01T01:00:00.000Z"))).toBe("2026-08-31");
  });

  it("normaliza caixa e diacríticos", () => {
    expect(normalizeText("Árvore JOÃO")).toBe("arvore joao");
  });
});

describe("regras financeiras e agregações", () => {
  it("aplica tolerâncias de divergência e status", () => {
    expect(originIssue(createOrigin({ availableAmount: 100, allocatedAmount: 99 }))).toBe(false);
    expect(originIssue(createOrigin({ availableAmount: 100, allocatedAmount: 98.99 }))).toBe(true);
    expect(originIssue(createOrigin({ allocationPercent: 99.9 }))).toBe(false);
    expect(originIssue(createOrigin({ allocationPercent: 99.89 }))).toBe(true);
    expect(distributionStatus(0.005, 100).key).toBe("not_started");
    expect(distributionStatus(10, 0.005).key).toBe("completed");
    expect(distributionStatus(10, 90).key).toBe("in_progress");
  });

  it("considera somente movimentos efetivos nos totais", () => {
    expect(effectiveMovements(movements).map((movement) => movement.id)).toEqual(["m1", "m3"]);
  });

  it("agrega grupos, empresas e sócios por documento", () => {
    const groups = aggregateGroups(origins, movements);
    const companies = aggregateCompanies(origins, movements);
    const shareholders = aggregateShareholders(origins, movements);
    const group = groups.find((candidate) => candidate.name === "Grupo Árvore");
    const shareholder = shareholders.find((candidate) => candidate.taxId === ana.taxId);

    expect(group).toMatchObject({
      companyCount: 2,
      shareholderCount: 2,
      available: 1_500,
      distributed: 150,
      balance: 1_350,
    });
    expect(companies.find((company) => company.id === "o1")).toMatchObject({
      distributed: 100,
      balance: 900,
      progress: 10,
    });
    expect(shareholder).toMatchObject({
      companyCount: 2,
      groupCount: 1,
      entitlement: 1_100,
      distributed: 150,
      balance: 950,
    });
  });

  it("filtra e ordena sem mutar as coleções recebidas", () => {
    const groups = aggregateGroups(origins, movements);
    const companies = aggregateCompanies(origins, movements);
    const shareholders = aggregateShareholders(origins, movements);
    const groupOrder = groups.map((group) => group.name);
    const companyOrder = companies.map((company) => company.id);
    const shareholderOrder = shareholders.map((shareholder) => shareholder.key);

    expect(filterGroups(groups, { query: "holding" }).map((group) => group.name)).toEqual(["Grupo Árvore"]);
    expect(filterGroups(groups, { status: "attention" }).map((group) => group.name)).toEqual(["Grupo Bairro"]);
    expect(filterCompanies(companies, { query: "44.444" }).map((company) => company.id)).toEqual(["o3"]);
    expect(filterShareholders(shareholders, { query: "grupo bairro" }).map((item) => item.name)).toEqual(["João Silva"]);
    expect(filterOriginsByExercise(origins, "2026").map((origin) => origin.id)).toEqual(["o3"]);
    expect(groups.map((group) => group.name)).toEqual(groupOrder);
    expect(companies.map((company) => company.id)).toEqual(companyOrder);
    expect(shareholders.map((shareholder) => shareholder.key)).toEqual(shareholderOrder);
  });
});

describe("paginação e relatório", () => {
  it("pagina com limites seguros sem mutar os itens", () => {
    const items = [1, 2, 3, 4, 5];
    expect(paginate(items, 99, 2)).toEqual({
      items: [5],
      page: 3,
      perPage: 2,
      total: 5,
      totalPages: 3,
      start: 5,
      end: 5,
    });
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });

  it("calcula totais e ordena somente movimentos efetivos em cópia", () => {
    const movementOrder = movements.map((movement) => movement.id);
    expect(reportTotals(origins, movements)).toEqual({
      available: 1_700,
      distributed: 150,
      balance: 1_550,
      progress: (150 / 1_700) * 100,
      issues: 1,
      groupCount: 2,
      companyCount: 3,
      shareholderCount: 3,
    });
    expect(reportMovements(origins, movements).map((movement) => movement.id)).toEqual(["m3", "m1"]);
    expect(movements.map((movement) => movement.id)).toEqual(movementOrder);
  });

  it("resolve escopos válidos e usa consolidado como fallback", () => {
    expect(resolveReportScope(origins, movements, { scope: "company", companyTaxId: origins[0]?.companyTaxId }).kind).toBe("company");
    expect(resolveReportScope(origins, movements, { scope: "shareholder", shareholderKey: ana.taxId ?? "" }).kind).toBe("shareholder");
    expect(resolveReportScope(origins, movements, { scope: "group", groupName: "inexistente" }).kind).toBe("all");
  });
});
