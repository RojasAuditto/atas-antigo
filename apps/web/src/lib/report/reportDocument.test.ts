import { describe, expect, it } from "vitest";
import type { Catalog, Movement, Origin } from "@/domain";
import { buildReportDocument } from "./reportDocument";

const maliciousName = 'Ana </title><script>alert("x")</script>';
const origin: Origin = {
  id: "origin-1",
  companyTaxId: "11.111.111/0001-11",
  companyName: 'Empresa <img src=x onerror="alert(1)">',
  groupName: "Grupo Norte",
  sourceStatus: "Registrado",
  exercise: "2025",
  sourceDate: "2025-12-23",
  deadline: "2028-12-31",
  availableAmount: 1_000,
  allocatedAmount: 1_000,
  allocationPercent: 100,
  shareholders: [
    { name: maliciousName, type: "PF", taxId: "111.111.111-11", percentage: 60, entitlement: 600 },
    { name: "Outro Sócio", type: "PF", taxId: "222.222.222-22", percentage: 40, entitlement: 400 },
  ],
};

const catalog: Catalog = {
  meta: {
    source: "origem.xlsx",
    generatedAt: "2026-08-25",
    initialDistributed: 0,
    deadlineDefault: "2028-12-31",
    ignoredStatuses: [],
    validOrigins: 1,
    groups: 1,
    companies: 1,
    shareholders: 2,
    availableTotal: 1_000,
  },
  origins: [origin],
};

function effectiveMovement(overrides: Partial<Extract<Movement, { status: "effective" }>> = {}): Extract<Movement, { status: "effective" }> {
  return {
    id: "movement-1",
    originId: origin.id,
    groupName: origin.groupName,
    companyTaxId: origin.companyTaxId,
    companyName: origin.companyName,
    shareholderTaxId: "111.111.111-11",
    shareholderName: maliciousName,
    amount: 100,
    date: "2026-08-20",
    reference: "ANA-REF",
    proofName: "comprovante.pdf",
    note: "",
    paymentMethod: "PIX",
    status: "effective",
    createdAt: "2026-08-20T15:00:00.000Z",
    createdBy: "Sessão local",
    ...overrides,
  };
}

const movements: Movement[] = [
  effectiveMovement(),
  effectiveMovement({
    id: "movement-2",
    shareholderTaxId: "222.222.222-22",
    shareholderName: "Outro Sócio",
    amount: 200,
    reference: "OTHER-REF",
  }),
  {
    ...effectiveMovement({ id: "movement-3", amount: 50, reference: "REVERSED-REF" }),
    status: "reversed",
    reversedAt: "2026-08-21T15:00:00.000Z",
    reversedBy: "Sessão local",
  },
];

describe("documento de relatório", () => {
  it("preserva as seções dos escopos consolidado e grupo", () => {
    const consolidated = buildReportDocument({ catalog, movements, selection: { scope: "all" }, issuedOn: "2026-09-01" });
    const group = buildReportDocument({ catalog, movements, selection: { scope: "group", groupName: origin.groupName }, issuedOn: "2026-09-01" });

    expect(consolidated.scopeKind).toBe("all");
    expect(consolidated.html).toContain("Empresas da base");
    expect(consolidated.html).toContain("Sócios da base");
    expect(group.scopeKind).toBe("group");
    expect(group.html).toContain("Empresas do grupo");
    expect(group.html).toContain("Sócios do grupo");
  });

  it("usa somente a posição e os lançamentos efetivos do sócio selecionado", () => {
    const report = buildReportDocument({
      catalog,
      movements,
      selection: { scope: "shareholder", shareholderKey: "111.111.111-11" },
      issuedOn: "2026-09-01",
    });

    expect(report.totals).toMatchObject({ available: 600, distributed: 100, balance: 500, shareholderCount: 1 });
    expect(report.html).toContain("ANA-REF");
    expect(report.html).not.toContain("OTHER-REF");
    expect(report.html).not.toContain("REVERSED-REF");
    expect(report.html).toContain("Posição por grupo");
    expect(report.html).toContain("Posição por empresa");
    expect(report.fileName).toMatch(/^relatorio-socio-entity-[a-z0-9]+-2026-09-01\.html$/);
  });

  it("escapa dados do catálogo antes de incorporá-los ao HTML", () => {
    const report = buildReportDocument({
      catalog,
      movements,
      selection: { scope: "company", companyTaxId: origin.companyTaxId },
      issuedOn: "2026-09-01",
    });

    expect(report.html).toContain("Empresa &lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(report.html).toContain("Ana &lt;/title&gt;&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(report.html).not.toContain('<script>alert("x")</script>');
  });
});
