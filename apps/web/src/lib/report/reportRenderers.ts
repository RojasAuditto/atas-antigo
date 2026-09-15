import {
  aggregateCompanies,
  aggregateGroups,
  aggregateShareholders,
  distributionStatus,
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatPercent,
  movementsForShareholder,
  originIssue,
  reportMovements,
  reportTotals,
  type Movement,
  type Origin,
  type ReportTotals,
  type ShareholderSummary,
} from "@/domain";

const MONEY_TOLERANCE = 0.005;

export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
}

function section(title: string, note: string, content: string, className = ""): string {
  return `<section class="rp-section ${className}">
    <div class="rp-head"><h2>${escapeHtml(title)}</h2><span>${escapeHtml(note)}</span></div>
    ${content}
  </section>`;
}

function table(headers: readonly string[], rows: string, footer = ""): string {
  return `<div class="rp-table-wrap"><table class="rp-table">
    <thead><tr>${headers.map((header) => `<th${header.startsWith("#") ? ' class="num"' : ""}>${escapeHtml(header.replace(/^#/, ""))}</th>`).join("")}</tr></thead>
    <tbody>${rows}</tbody>${footer === "" ? "" : `<tfoot>${footer}</tfoot>`}
  </table></div>`;
}

function meter(progress: number): string {
  const value = clampPercent(progress);
  return `<span class="rp-mini"><span class="rp-meter"><i style="width:${value.toFixed(1)}%"></i></span>${escapeHtml(formatPercent(value))}</span>`;
}

function statusTag(distributed: number, balance: number): string {
  const status = distributionStatus(distributed, balance);
  const tone = { not_started: "n", in_progress: "b", completed: "g" }[status.key];
  return `<span class="rp-tag ${tone}">${escapeHtml(status.label)}</span>`;
}

function progressBar(progress: number, movements: readonly Movement[], total: number): string {
  let accumulated = 0;
  const dots = movements.map((movement) => {
    accumulated += movement.amount;
    const position = total > 0 ? clampPercent((accumulated / total) * 100) : 0;
    return `<b style="left:${position.toFixed(2)}%"></b>`;
  }).join("");
  const value = clampPercent(progress);
  const movementLabel = movements.length === 1 ? "lançamento registrado" : "lançamentos registrados";
  return `<div class="rp-bar-wrap">
    <div class="rp-bar"><i style="width:${value.toFixed(2)}%"></i>${dots}</div>
    <div class="rp-bar-legend"><span><strong>${escapeHtml(formatPercent(value))}</strong> distribuído</span><span>${movements.length} ${movementLabel}</span></div>
  </div>`;
}

export function renderCover(
  title: string,
  scopeLabel: string,
  totals: ReportTotals,
  issuedOn: string,
): string {
  return `<header class="rp-cover">
    <div class="rp-brand"><i></i> Pomin · Distribuição de Lucros</div>
    <h1>${escapeHtml(title)}</h1>
    <p class="rp-scope">${escapeHtml(scopeLabel)}</p>
    <div class="rp-cover-meta">
      <div><span>Disponível</span><strong>${escapeHtml(formatCurrency(totals.available))}</strong></div>
      <div><span>Distribuído</span><strong>${escapeHtml(formatCurrency(totals.distributed))}</strong></div>
      <div><span>Saldo a distribuir</span><strong>${escapeHtml(formatCurrency(totals.balance))}</strong></div>
      <div><span>Emitido em</span><strong>${escapeHtml(formatDate(issuedOn))}</strong></div>
    </div>
  </header>`;
}

export function renderSummary(
  totals: ReportTotals,
  movements: readonly Movement[],
  issuedOn: string,
): string {
  const status = distributionStatus(totals.distributed, totals.balance);
  const narrative = totals.distributed <= MONEY_TOLERANCE
    ? `Nenhuma distribuição foi registrada para este escopo até ${formatDate(issuedOn)}.`
    : `Foram distribuídos ${formatCurrency(totals.distributed)} de ${formatCurrency(totals.available)}, restando ${formatCurrency(totals.balance)}.`;
  const issueNote = totals.issues > 0
    ? ` Há ${totals.issues} origem(ns) com diferença entre o valor disponível e a soma atribuída aos sócios.`
    : "";
  return section(
    "Resumo executivo",
    `${totals.groupCount} grupo(s) · ${totals.companyCount} empresa(s) · ${totals.shareholderCount} sócio(s)`,
    `<div class="rp-kpis">
      <div class="rp-kpi"><span>Disponível</span><strong>${escapeHtml(formatCompactCurrency(totals.available))}</strong><small>Direito original apurado</small></div>
      <div class="rp-kpi ok"><span>Distribuído</span><strong>${escapeHtml(formatCompactCurrency(totals.distributed))}</strong><small>${movements.length} lançamento(s) efetivo(s)</small></div>
      <div class="rp-kpi warn"><span>Saldo</span><strong>${escapeHtml(formatCompactCurrency(totals.balance))}</strong><small>Ainda passível de distribuição</small></div>
      <div class="rp-kpi ${totals.issues > 0 ? "bad" : "ok"}"><span>Divergências</span><strong>${totals.issues}</strong><small>Origem x soma dos direitos</small></div>
    </div>
    ${progressBar(totals.progress, movements, totals.available)}
    <div class="rp-note info">Situação geral: <strong>${escapeHtml(status.label)}</strong>. ${escapeHtml(narrative + issueNote)}</div>`,
  );
}

export function renderGroupTable(origins: readonly Origin[], movements: readonly Movement[]): string {
  const groups = aggregateGroups(origins, movements).sort((left, right) => right.available - left.available);
  if (groups.length < 2) return "";
  const totals = reportTotals(origins, movements);
  const rows = groups.map((group) => `<tr>
    <td class="rp-name">${escapeHtml(group.name)}${group.issues > 0 ? `<span class="rp-sub">${group.issues} divergência(s) de base</span>` : ""}</td>
    <td class="num">${group.companyCount}</td><td class="num">${group.shareholderCount}</td>
    <td class="num">${escapeHtml(formatCurrency(group.available))}</td><td class="num">${escapeHtml(formatCurrency(group.distributed))}</td>
    <td class="num strong">${escapeHtml(formatCurrency(group.balance))}</td><td>${meter(group.progress)}</td><td>${statusTag(group.distributed, group.balance)}</td>
  </tr>`).join("");
  const footer = `<tr><td>Total</td><td class="num">${totals.companyCount}</td><td class="num">${totals.shareholderCount}</td><td class="num">${escapeHtml(formatCurrency(totals.available))}</td><td class="num">${escapeHtml(formatCurrency(totals.distributed))}</td><td class="num">${escapeHtml(formatCurrency(totals.balance))}</td><td>${meter(totals.progress)}</td><td></td></tr>`;
  return section("Visão por grupo", `${groups.length} grupos`, table(["Grupo", "#Empresas", "#Sócios", "#Disponível", "#Distribuído", "#Saldo", "Evolução", "Situação"], rows, footer), "rp-flow");
}

export function renderCompanyTable(
  origins: readonly Origin[],
  movements: readonly Movement[],
  title = "Composição por empresa",
): string {
  const companies = aggregateCompanies(origins, movements).sort((left, right) => right.availableAmount - left.availableAmount);
  const totals = reportTotals(origins, movements);
  const rows = companies.map((company) => `<tr>
    <td class="rp-name">${escapeHtml(company.companyName)}<span class="rp-sub">${escapeHtml(company.companyTaxId)}${company.issue ? " · divergência de base" : ""}</span></td>
    <td>${escapeHtml(company.exercise || "—")}</td><td class="num">${escapeHtml(formatCurrency(company.availableAmount))}</td>
    <td class="num">${escapeHtml(formatCurrency(company.distributed))}</td><td class="num strong">${escapeHtml(formatCurrency(company.balance))}</td>
    <td>${meter(company.progress)}</td><td>${escapeHtml(formatDate(company.deadline))}</td><td>${statusTag(company.distributed, company.balance)}</td>
  </tr>`).join("");
  const footer = `<tr><td>Total</td><td></td><td class="num">${escapeHtml(formatCurrency(totals.available))}</td><td class="num">${escapeHtml(formatCurrency(totals.distributed))}</td><td class="num">${escapeHtml(formatCurrency(totals.balance))}</td><td>${meter(totals.progress)}</td><td></td><td></td></tr>`;
  return section(title, `${companies.length} CNPJ(s)`, table(["Empresa / CNPJ", "Exercício", "#Disponível", "#Distribuído", "#Saldo", "Evolução", "Prazo", "Situação"], rows, footer), "rp-flow");
}

export function renderShareholderTable(
  origins: readonly Origin[],
  movements: readonly Movement[],
  groupName: string | null,
  title: string,
): string {
  const shareholders = aggregateShareholders(origins, movements, groupName).sort((left, right) => right.entitlement - left.entitlement);
  const entitlement = shareholders.reduce((total, shareholder) => total + shareholder.entitlement, 0);
  const distributed = shareholders.reduce((total, shareholder) => total + shareholder.distributed, 0);
  const rows = shareholders.map((shareholder) => `<tr>
    <td class="rp-name">${escapeHtml(shareholder.name)}<span class="rp-sub">${escapeHtml(shareholder.taxId ?? "sem documento")}</span></td>
    <td>${escapeHtml(shareholder.type)}</td><td class="num">${shareholder.companyCount}</td><td class="num">${escapeHtml(formatCurrency(shareholder.entitlement))}</td>
    <td class="num">${escapeHtml(formatCurrency(shareholder.distributed))}</td><td class="num strong">${escapeHtml(formatCurrency(shareholder.balance))}</td><td>${meter(shareholder.progress)}</td>
  </tr>`).join("");
  const footer = `<tr><td>Total</td><td></td><td></td><td class="num">${escapeHtml(formatCurrency(entitlement))}</td><td class="num">${escapeHtml(formatCurrency(distributed))}</td><td class="num">${escapeHtml(formatCurrency(entitlement - distributed))}</td><td>${meter(entitlement > 0 ? (distributed / entitlement) * 100 : 0)}</td></tr>`;
  return section(title, `${shareholders.length} sócio(s)`, table(["Sócio", "Tipo", "#Empresas", "#Direito", "#Recebido", "#A receber", "Evolução"], rows, footer), "rp-flow");
}

export function renderCompanyFocus(origin: Origin, movements: readonly Movement[]): string {
  const company = aggregateCompanies([origin], movements)[0];
  if (company === undefined) return "";
  const companyMovements = reportMovements([origin], movements);
  const difference = Math.abs(origin.availableAmount - origin.allocatedAmount);
  const issue = originIssue(origin)
    ? `<div class="rp-note"><strong>Divergência de base.</strong> O valor de origem é ${escapeHtml(formatCurrency(origin.availableAmount))} e a soma atribuída aos sócios é ${escapeHtml(formatCurrency(origin.allocatedAmount))} — diferença de ${escapeHtml(formatCurrency(difference))}. Concilie a ata antes de novas distribuições.</div>`
    : "";
  return `<section class="rp-section rp-focus">
    <div class="rp-focus-head"><div class="rp-avatar">${escapeHtml(initials(origin.companyName))}</div><div><h2>${escapeHtml(origin.companyName)}</h2><p>CNPJ ${escapeHtml(origin.companyTaxId)} · Grupo ${escapeHtml(origin.groupName)} · Exercício ${escapeHtml(origin.exercise || "—")} · prazo ${escapeHtml(formatDate(origin.deadline))}</p></div></div>
    <div class="rp-kpis">
      <div class="rp-kpi"><span>Disponível</span><strong>${escapeHtml(formatCompactCurrency(origin.availableAmount))}</strong><small>Valor de origem</small></div>
      <div class="rp-kpi ok"><span>Distribuído</span><strong>${escapeHtml(formatCompactCurrency(company.distributed))}</strong><small>${companyMovements.length} lançamento(s)</small></div>
      <div class="rp-kpi warn"><span>Saldo</span><strong>${escapeHtml(formatCompactCurrency(company.balance))}</strong><small>Ainda disponível</small></div>
      <div class="rp-kpi ${company.issue ? "bad" : "ok"}"><span>Alocação</span><strong>${escapeHtml(formatPercent(origin.allocationPercent))}</strong><small>Soma dos direitos dos sócios</small></div>
    </div>${progressBar(company.progress, companyMovements, origin.availableAmount)}${issue}
  </section>`;
}

interface GroupPosition {
  name: string;
  companyIds: Set<string>;
  entitlement: number;
  distributed: number;
}

export function renderShareholderFocus(shareholder: ShareholderSummary, movements: readonly Movement[]): string {
  const rows = [...shareholder.rows].sort((left, right) => right.shareholder.entitlement - left.shareholder.entitlement);
  const groups = new Map<string, GroupPosition>();
  for (const row of rows) {
    const current = groups.get(row.origin.groupName) ?? { name: row.origin.groupName, companyIds: new Set<string>(), entitlement: 0, distributed: 0 };
    current.companyIds.add(row.origin.id);
    current.entitlement += row.shareholder.entitlement;
    current.distributed += row.distributed;
    groups.set(row.origin.groupName, current);
  }
  const byGroup = [...groups.values()].sort((left, right) => right.entitlement - left.entitlement);
  const shareholderMovements = movementsForShareholder(shareholder, movements).sort((left, right) => left.date.localeCompare(right.date) || left.createdAt.localeCompare(right.createdAt));
  const averageParticipation = rows.length > 0
    ? rows.reduce((total, row) => total + row.shareholder.percentage, 0) / rows.length
    : 0;
  const groupRows = byGroup.map((group) => {
    const balance = group.entitlement - group.distributed;
    const progress = group.entitlement > 0 ? (group.distributed / group.entitlement) * 100 : 0;
    return `<tr><td class="rp-name">${escapeHtml(group.name)}</td><td class="num">${group.companyIds.size}</td><td class="num">${escapeHtml(formatCurrency(group.entitlement))}</td><td class="num">${escapeHtml(formatCurrency(group.distributed))}</td><td class="num strong">${escapeHtml(formatCurrency(balance))}</td><td>${meter(progress)}</td></tr>`;
  }).join("");
  const companyRows = rows.map((row) => `<tr>
    <td class="rp-name">${escapeHtml(row.origin.companyName)}<span class="rp-sub">${escapeHtml(row.origin.companyTaxId)} · ${escapeHtml(row.origin.groupName)}</span></td>
    <td>${escapeHtml(row.origin.exercise || "—")}</td><td class="num">${escapeHtml(formatCurrency(row.shareholder.entitlement))}</td><td class="num">${escapeHtml(formatCurrency(row.distributed))}</td>
    <td class="num strong">${escapeHtml(formatCurrency(row.balance))}</td><td class="num">${escapeHtml(formatPercent(row.shareholder.percentage))}</td><td>${statusTag(row.distributed, row.balance)}</td>
  </tr>`).join("");
  const groupFooter = `<tr><td>Total</td><td class="num">${shareholder.companyCount}</td><td class="num">${escapeHtml(formatCurrency(shareholder.entitlement))}</td><td class="num">${escapeHtml(formatCurrency(shareholder.distributed))}</td><td class="num">${escapeHtml(formatCurrency(shareholder.balance))}</td><td>${meter(shareholder.progress)}</td></tr>`;
  const companyFooter = `<tr><td>Total</td><td></td><td class="num">${escapeHtml(formatCurrency(shareholder.entitlement))}</td><td class="num">${escapeHtml(formatCurrency(shareholder.distributed))}</td><td class="num">${escapeHtml(formatCurrency(shareholder.balance))}</td><td></td><td></td></tr>`;
  return `<section class="rp-section rp-focus">
    <div class="rp-focus-head"><div class="rp-avatar">${escapeHtml(initials(shareholder.name))}</div><div><h2>${escapeHtml(shareholder.name)}</h2><p>${escapeHtml(shareholder.type)} · ${escapeHtml(shareholder.taxId ?? "sem documento")} · participa de ${shareholder.companyCount} empresa(s) em ${shareholder.groupCount} grupo(s)</p></div></div>
    <div class="rp-kpis">
      <div class="rp-kpi"><span>Direito total</span><strong>${escapeHtml(formatCompactCurrency(shareholder.entitlement))}</strong><small>Somatório em todas as empresas</small></div>
      <div class="rp-kpi ok"><span>Já recebido</span><strong>${escapeHtml(formatCompactCurrency(shareholder.distributed))}</strong><small>${shareholderMovements.length} lançamento(s)</small></div>
      <div class="rp-kpi warn"><span>A receber</span><strong>${escapeHtml(formatCompactCurrency(shareholder.balance))}</strong><small>Saldo consolidado</small></div>
      <div class="rp-kpi"><span>Participação média</span><strong>${escapeHtml(formatPercent(averageParticipation))}</strong><small>Nas origens em que participa</small></div>
    </div>
    ${progressBar(shareholder.progress, shareholderMovements, shareholder.entitlement)}
    <div class="rp-note info"><strong>Leitura individual.</strong> Do direito total de ${escapeHtml(formatCurrency(shareholder.entitlement))}, ${escapeHtml(formatCurrency(shareholder.distributed))} já foram recebidos e ${escapeHtml(formatCurrency(shareholder.balance))} permanecem em aberto.</div>
    <div class="rp-head rp-subhead"><h2>Posição por grupo</h2><span>visão macro</span></div>
    ${table(["Grupo", "#Empresas", "#Direito", "#Recebido", "#A receber", "Evolução"], groupRows, groupFooter)}
    <div class="rp-head rp-subhead"><h2>Posição por empresa</h2><span>visão micro</span></div>
    ${table(["Empresa", "Exercício", "#Direito", "#Recebido", "#A receber", "#% da origem", "Situação"], companyRows, companyFooter)}
  </section>`;
}

export function renderMovementTable(movements: readonly Movement[], issuedOn: string, title = "Extrato de movimentações"): string {
  if (movements.length === 0) {
    return section(title, "nenhum lançamento", `<div class="rp-empty">Nenhuma distribuição efetiva registrada para este escopo até ${escapeHtml(formatDate(issuedOn))}.</div>`);
  }
  const total = movements.reduce((sum, movement) => sum + movement.amount, 0);
  const rows = movements.map((movement) => `<tr>
    <td>${escapeHtml(formatDate(movement.date))}</td><td class="rp-name">${escapeHtml(movement.companyName)}<span class="rp-sub">${escapeHtml(movement.companyTaxId)}</span></td>
    <td>${escapeHtml(movement.shareholderName)}<span class="rp-sub">${escapeHtml(movement.shareholderTaxId ?? "—")}</span></td><td>${escapeHtml(movement.paymentMethod)}</td>
    <td>${movement.reference === "" ? "—" : escapeHtml(movement.reference)}<span class="rp-sub">${movement.proofName === "" ? '<span class="rp-tag a">sem anexo</span>' : escapeHtml(movement.proofName)}</span></td><td class="num strong">${escapeHtml(formatCurrency(movement.amount))}</td>
  </tr>`).join("");
  const footer = `<tr><td colspan="5">Total distribuído</td><td class="num">${escapeHtml(formatCurrency(total))}</td></tr>`;
  return section(title, `${movements.length} lançamento(s)`, table(["Data", "Empresa", "Sócio", "Forma", "Referência / comprovante", "#Valor"], rows, footer), "rp-flow");
}

export function renderIssues(origins: readonly Origin[]): string {
  const issues = origins.filter(originIssue);
  if (issues.length === 0) return "";
  const rows = issues.map((origin) => `<tr>
    <td class="rp-name">${escapeHtml(origin.companyName)}<span class="rp-sub">${escapeHtml(origin.companyTaxId)}</span></td><td>${escapeHtml(origin.groupName)}</td>
    <td class="num">${escapeHtml(formatCurrency(origin.availableAmount))}</td><td class="num">${escapeHtml(formatCurrency(origin.allocatedAmount))}</td><td class="num strong">${escapeHtml(formatCurrency(Math.abs(origin.availableAmount - origin.allocatedAmount)))}</td>
  </tr>`).join("");
  return section("Divergências de base", `${issues.length} origem(ns)`, `${table(["Empresa / CNPJ", "Grupo", "#Valor da origem", "#Soma dos sócios", "#Diferença"], rows)}<div class="rp-note">Estas origens apresentam diferença entre o valor apurado na ata e a soma dos direitos individuais. Regularize antes de registrar novas distribuições.</div>`, "rp-flow");
}
