import {
  dateInSaoPaulo,
  formatDate,
  movementsForShareholder,
  normalizeText,
  reportMovements,
  reportTotals,
  resolveReportScope,
  type Catalog,
  type Movement,
  type ReportScope,
  type ReportScopeData,
  type ReportSelection,
  type ReportTotals,
} from "@/domain";
import { createEntityRouteId } from "@/lib/entity-id";
import { REPORT_STYLES } from "./reportStyles";
import {
  escapeHtml,
  renderCompanyFocus,
  renderCompanyTable,
  renderCover,
  renderGroupTable,
  renderIssues,
  renderMovementTable,
  renderShareholderFocus,
  renderShareholderTable,
  renderSummary,
} from "./reportRenderers";

interface BuildReportDocumentInput {
  catalog: Catalog;
  movements: readonly Movement[];
  selection: ReportSelection;
  issuedOn?: string;
}

interface ReportTitleParts {
  title: string;
  scopeLabel: string;
  fileStem: string;
}

export interface ReportDocument {
  html: string;
  fileName: string;
  title: string;
  scopeLabel: string;
  scopeKind: ReportScope;
  totals: ReportTotals;
}

function safeIssuedOn(value: string | undefined): string {
  if (value !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value) return value;
  }
  return dateInSaoPaulo(new Date());
}

function slug(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

function titleParts(data: ReportScopeData, totals: ReportTotals): ReportTitleParts {
  if (data.kind === "shareholder") {
    return {
      title: data.shareholder.name,
      scopeLabel: `Posição individual do sócio · ${data.shareholder.taxId ?? "sem documento"} · ${data.shareholder.companyCount} empresa(s) em ${data.shareholder.groupCount} grupo(s)`,
      fileStem: `relatorio-socio-${createEntityRouteId(data.shareholder.key)}`,
    };
  }
  if (data.kind === "company") {
    return {
      title: data.origin.companyName,
      scopeLabel: `Empresa · CNPJ ${data.origin.companyTaxId} · Grupo ${data.origin.groupName} · Exercício ${data.origin.exercise || "—"}`,
      fileStem: `relatorio-empresa-${slug(data.origin.id) || "empresa"}`,
    };
  }
  if (data.kind === "group") {
    return {
      title: data.groupName,
      scopeLabel: `Grupo econômico · ${data.origins.length} empresa(s)`,
      fileStem: `relatorio-grupo-${slug(data.groupName) || "grupo"}`,
    };
  }
  return {
    title: "Posição consolidada",
    scopeLabel: `Todos os grupos da base · ${totals.groupCount} grupos · ${totals.companyCount} empresas`,
    fileStem: "relatorio-consolidado",
  };
}

function shareholderTotals(data: Extract<ReportScopeData, { kind: "shareholder" }>): ReportTotals {
  const shareholder = data.shareholder;
  return {
    available: shareholder.entitlement,
    distributed: shareholder.distributed,
    balance: shareholder.balance,
    progress: shareholder.progress,
    issues: shareholder.issues,
    groupCount: shareholder.groupCount,
    companyCount: shareholder.companyCount,
    shareholderCount: 1,
  };
}

function scopeTotals(data: ReportScopeData, movements: readonly Movement[]): ReportTotals {
  return data.kind === "shareholder"
    ? shareholderTotals(data)
    : reportTotals(data.origins, movements);
}

function scopeMovements(data: ReportScopeData, movements: readonly Movement[]): Movement[] {
  if (data.kind !== "shareholder") return reportMovements(data.origins, movements);
  return movementsForShareholder(data.shareholder, movements)
    .sort((left, right) => left.date.localeCompare(right.date) || left.createdAt.localeCompare(right.createdAt));
}

function renderScopeSections(
  data: ReportScopeData,
  movements: readonly Movement[],
  scopedMovements: readonly Movement[],
  issuedOn: string,
): string {
  if (data.kind === "shareholder") {
    return renderShareholderFocus(data.shareholder, movements)
      + renderMovementTable(scopedMovements, issuedOn, "Movimentações do sócio");
  }
  if (data.kind === "company") {
    return renderCompanyFocus(data.origin, movements)
      + renderShareholderTable(data.origins, movements, null, "Composição societária da empresa")
      + renderMovementTable(scopedMovements, issuedOn);
  }
  if (data.kind === "group") {
    return renderCompanyTable(data.origins, movements, "Empresas do grupo")
      + renderShareholderTable(data.origins, movements, data.groupName, "Sócios do grupo")
      + renderMovementTable(scopedMovements, issuedOn)
      + renderIssues(data.origins);
  }
  return renderGroupTable(data.origins, movements)
    + '<div class="rp-break"></div>'
    + renderCompanyTable(data.origins, movements, "Empresas da base")
    + '<div class="rp-break"></div>'
    + renderShareholderTable(data.origins, movements, null, "Sócios da base")
    + renderMovementTable(scopedMovements, issuedOn)
    + renderIssues(data.origins);
}

function renderFooter(catalog: Catalog, issuedOn: string): string {
  return `<footer class="rp-footer">
    Documento gerado pela Central de Distribuição de Lucros em ${escapeHtml(formatDate(issuedOn))}.
    Base de origem: ${escapeHtml(catalog.meta.source)} · ${catalog.meta.validOrigins} origens válidas.
    Valores em reais. Somente lançamentos efetivos compõem os totais; estornos permanecem fora dos cálculos.
  </footer>`;
}

export function buildReportDocument(input: BuildReportDocumentInput): ReportDocument {
  const issuedOn = safeIssuedOn(input.issuedOn);
  const data = resolveReportScope(input.catalog.origins, input.movements, input.selection);
  const totals = scopeTotals(data, input.movements);
  const scopedMovements = scopeMovements(data, input.movements);
  const title = titleParts(data, totals);
  const body = renderCover(title.title, title.scopeLabel, totals, issuedOn)
    + renderSummary(totals, scopedMovements, issuedOn)
    + renderScopeSections(data, input.movements, scopedMovements, issuedOn)
    + renderFooter(input.catalog, issuedOn);
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="referrer" content="no-referrer" />
  <title>${escapeHtml(title.title)} · Relatório de distribuição de lucros</title>
  <style>${REPORT_STYLES}</style>
</head>
<body><main class="rp-page">${body}</main></body>
</html>`;

  return {
    html,
    fileName: `${title.fileStem}-${issuedOn}.html`,
    title: title.title,
    scopeLabel: title.scopeLabel,
    scopeKind: data.kind,
    totals,
  };
}
