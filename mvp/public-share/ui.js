(() => {
  "use strict";

  const DATA = window.MVP_DATA;
  const LEDGER = window.MVP_LEDGER;
  const STATUS = Object.freeze({
    regular: { label: "Regular", className: "regular" },
    in_progress: { label: "Em andamento", className: "in_progress" },
    attention: { label: "Atenção", className: "attention" },
  });
  const ICONS = Object.freeze({
    layout: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    building: '<path d="M3 21h18M6 21V7l6-4 6 4v14M9 10h1M14 10h1M9 14h1M14 14h1M10 21v-3h4v3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    movement: '<path d="M7 7h11l-3-3M17 17H6l3 3M18 7l-3 3M6 17l3-3"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    moon: '<path d="M12 3a9 9 0 1 0 9 9c0-.5 0-1-.1-1.5A6.5 6.5 0 0 1 13.5 3H12Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
    x: '<path d="m18 6-12 12M6 6l12 12"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    chart: '<path d="M3 3v18h18M7 16l4-5 4 3 5-7"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M17 6l2 2M14 9l2 2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    logout: '<path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
    reverse: '<path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 6 6v2"/>',
  });

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    })[character]);
  }

  function icon(name) {
    return `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24">${ICONS[name] ?? ICONS.info}</svg>`;
  }

  function currency(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }

  function compactCurrency(value) {
    if (Math.abs(value) >= 1000000) return `R$ ${(value / 1000000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi`;
    if (Math.abs(value) >= 1000) return `R$ ${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
    return currency(value);
  }

  function percentage(value) {
    return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  }

  function percentageFromAta(value) {
    return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  }

  function shareholderSource(state) {
    return state?.shareholderSnapshot?.shareholders ?? DATA.shareholders;
  }

  function totals(scope = "group", state) {
    if (scope === "group" && DATA.companies.length) return LEDGER.summary(state.movements);
    const shareholders = shareholderSource(state);
    const approved = scope === "shareholders"
      ? shareholders.reduce((total, shareholder) => total + shareholder.entitlement, 0)
      : DATA.companies.reduce((total, company) => total + company.approved, 0);
    const distributed = scope === "shareholders"
      ? shareholders.reduce((total, shareholder) => total + shareholder.received, 0)
      : DATA.companies.reduce((total, company) => total + company.distributed, 0);
    return { approved, distributed, balance: approved - distributed, progress: distributed / approved * 100 };
  }

  function statCard(label, value, subtitle, tone) {
    return `<article class="stat-card ${tone}"><div class="stat-label"><span class="stat-dot"></span><span>${escapeHtml(label)}</span></div><div class="stat-value" title="${escapeHtml(value)}">${escapeHtml(value)}</div><div class="stat-subtitle">${escapeHtml(subtitle)}</div></article>`;
  }

  function statusBadge(status) {
    const config = STATUS[status] ?? STATUS.regular;
    return `<span class="status ${config.className}">${config.label}</span>`;
  }

  function progress(value) {
    const safe = Math.max(0, Math.min(100, value));
    return `<div class="entity-progress"><div class="progress-track" role="progressbar" aria-label="Percentual distribuído" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(safe)}"><div class="progress-fill" style="width:${safe}%"></div></div><div class="entity-progress-copy"><span>${percentage(value)} distribuído</span><span>${percentage(100 - value)} disponível</span></div></div>`;
  }

  function tabs(items, active, action) {
    const prefix = action === "admin-tab" ? "admin" : "public";
    return `<div class="tabs" role="tablist" aria-label="Seções da visualização">${items.map((item) => `<button class="tab ${active === item.id ? "active" : ""}" id="${prefix}-tab-${item.id}" type="button" role="tab" aria-controls="${prefix}-panel-${item.id}" aria-selected="${active === item.id}" tabindex="${active === item.id ? "0" : "-1"}" data-action="${action}" data-tab="${item.id}">${escapeHtml(item.label)}${item.count === undefined ? "" : `<span class="tab-count">${item.count}</span>`}</button>`).join("")}</div>`;
  }

  function companyCards(state) {
    return `<div class="entity-grid">${LEDGER.companyStats(state.movements).map((company) => {
      const balance = company.balance;
      const share = company.distributed / company.approved * 100;
      return `<article class="entity-card"><div class="entity-top"><div class="entity-identity"><div class="entity-mark">${icon("building")}</div><div class="entity-copy"><div class="entity-name">${escapeHtml(company.name)}</div><div class="entity-meta">${escapeHtml(company.code)} · saldo apurado isoladamente</div></div></div>${statusBadge(company.status)}</div><div class="metric-grid"><div class="metric"><span>Em ata</span><strong>${compactCurrency(company.approved)}</strong></div><div class="metric"><span>Distribuído</span><strong>${compactCurrency(company.distributed)}</strong></div><div class="metric"><span>Saldo</span><strong>${compactCurrency(balance)}</strong></div></div>${progress(share)}</article>`;
    }).join("")}</div>`;
  }

  function shareholderCards(state) {
    const shareholders = state.shareScope === "shareholders" ? shareholderSource(state) : LEDGER.shareholderStats(state.movements);
    return `<div class="entity-grid">${shareholders.map((shareholder) => {
      const balance = shareholder.entitlement - shareholder.received;
      const share = shareholder.received / shareholder.entitlement * 100;
      return `<article class="entity-card"><div class="entity-top"><div class="entity-identity"><div class="avatar indigo">${escapeHtml(shareholder.initials)}</div><div class="entity-copy"><div class="entity-name">${escapeHtml(shareholder.name)}</div><div class="entity-meta">${escapeHtml(shareholder.type)} · posição individual autorizada</div></div></div>${statusBadge(shareholder.status)}</div><div class="metric-grid"><div class="metric"><span>Direito</span><strong>${compactCurrency(shareholder.entitlement)}</strong></div><div class="metric"><span>Recebido</span><strong>${compactCurrency(shareholder.received)}</strong></div><div class="metric"><span>Saldo</span><strong>${compactCurrency(balance)}</strong></div></div>${progress(share)}</article>`;
    }).join("")}</div>`;
  }

  function ruleList(limit = DATA.rules.length) {
    const toneIcon = { blue: "shield", emerald: "check", amber: "lock", indigo: "users", rose: "info" };
    return `<div class="rule-list">${DATA.rules.slice(0, limit).map((rule) => `<article class="rule-item"><div class="rule-icon ${rule.tone}">${icon(toneIcon[rule.tone])}</div><div><strong>${escapeHtml(rule.title)}</strong><p>${escapeHtml(rule.text)}</p></div></article>`).join("")}</div>`;
  }

  function distributionPanel(state) {
    const summary = totals("group", state);
    return `<section class="section-card"><div class="section-head"><div><h2>Distribuição por empresa</h2><p>Consolidado visual, mantendo os saldos independentes</p></div><span class="status in_progress">${percentage(summary.progress)}</span></div><div class="section-body"><div class="total-progress"><div class="progress-copy"><span>Progresso do grupo</span><strong>${compactCurrency(summary.distributed)}</strong></div><div class="progress-track" role="progressbar" aria-label="Progresso total" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(summary.progress)}"><div class="progress-fill" style="width:${Math.min(summary.progress, 100)}%"></div></div></div><div class="company-bars">${LEDGER.companyStats(state.movements).map((company) => { const value = company.distributed / company.approved * 100; return `<div><div class="company-bar-label"><span>${escapeHtml(company.name)}</span><span>${percentage(value)}</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(value, 100)}%"></div></div></div>`; }).join("")}</div></div></section>`;
  }

  function overviewContent(state) {
    return `<div class="overview-grid">${distributionPanel(state)}<section class="section-card"><div class="section-head"><div><h2>Leitura executiva</h2><p>Regras que evitam uma interpretação incorreta</p></div></div><div class="section-body">${ruleList(3)}</div></section></div>`;
  }

  function shareholderMonthly(state) {
    const months = state.shareholderSnapshot?.months ?? DATA.months;
    const max = Math.max(...months.map((month) => month.value));
    return `<section class="section-card"><div class="section-head"><div><h2>Recebimentos mensais</h2><p>Agregado exclusivo dos sócios autorizados</p></div><span class="status regular">${months.length} meses</span></div><div class="section-body"><div class="chart-summary"><span>Total no período <strong>${compactCurrency(totals("shareholders", state).distributed)}</strong></span><span>Maior mês <strong>${compactCurrency(max)}</strong></span></div><div class="bar-chart" role="img" aria-label="Gráfico dos recebimentos mensais">${months.map((month) => `<div class="bar-column" title="${escapeHtml(month.label)}: ${currency(month.value)}"><div class="bar-shell"><div class="bar-fill" style="height:${max ? month.value / max * 100 : 0}%"></div></div><div class="bar-label">${escapeHtml(month.label)}</div></div>`).join("")}</div></div></section>`;
  }

  function monthlyContent(scope, state) {
    if (scope === "shareholders") return shareholderMonthly(state);
    const monthIndex = Number.isInteger(state.monthlyMonth) ? state.monthlyMonth : 8;
    const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date(2026, monthIndex, 1));
    const companies = LEDGER.monthlyCompanies(state.movements);
    const monthTotals = LEDGER.monthlyTotals(state.movements);
    const selectedRows = companies.flatMap(({ rows }) => rows.map((row) => row.months[monthIndex]));
    const monthGross = selectedRows.reduce((total, month) => total + month.gross, 0);
    const monthIrrf = selectedRows.reduce((total, month) => total + month.irpf, 0);
    const negativeCount = selectedRows.filter((month) => month.balance < 0).length;
    const activeCompanies = companies.filter(({ rows }) => rows.some((row) => row.months[monthIndex].gross > 0)).length;
    const monthPicker = `<div class="month-picker" role="group" aria-label="Competência de 2026">${LEDGER.MONTHS.map((label, index) => { const risks = companies.flatMap(({ rows }) => rows).filter((row) => row.months[index].balance < 0).length; return `<button class="month-option ${index === monthIndex ? "active" : ""} ${risks ? "has-risk" : ""}" data-action="select-month" data-month="${index}" type="button" aria-pressed="${index === monthIndex}"><span>${label}</span><strong>${monthTotals[index].value ? compactCurrency(monthTotals[index].value) : "Sem movimento"}</strong>${risks ? `<em>${risks} alerta${risks > 1 ? "s" : ""}</em>` : ""}</button>`; }).join("")}</div>`;
    const cards = companies.map(({ company, rows }) => {
      const selected = rows.map((row) => ({ ...row, month: row.months[monthIndex] }));
      const companyGross = selected.reduce((total, row) => total + row.month.gross, 0);
      const companyIrrf = selected.reduce((total, row) => total + row.month.irpf, 0);
      const companyBalance = selected.reduce((total, row) => total + row.month.balance, 0);
      const companyRisks = selected.filter((row) => row.month.balance < 0).length;
      const partners = selected.map(({ shareholder, entitlement, percentage: percentageInAta, month }) => {
        const risk = month.balance < 0;
        const status = risk && month.irpf ? "Saldo negativo + IRRF" : risk ? "Saldo negativo" : month.irpf ? "Com IRRF" : month.gross ? "Regular" : "Sem movimento";
        return `<article class="partner-flow ${risk ? "negative" : ""} ${month.irpf ? "taxed" : ""}"><div class="partner-flow-identity"><div class="avatar indigo">${escapeHtml(shareholder.initials)}</div><div><h4>${escapeHtml(shareholder.name)}</h4><p><strong>${currency(entitlement)}</strong> de direito · <strong>${percentageFromAta(percentageInAta)}</strong> disponível na ata</p></div><span class="status ${risk || month.irpf ? "attention" : "regular"}">${status}</span></div><div class="flow-metrics"><div><span>Bruto no mês</span><strong>${currency(month.gross)}</strong></div><div><span>Base tributável</span><strong>${currency(month.taxable)}</strong></div><div><span>IRRF estimado</span><strong>${currency(month.irpf)}</strong></div><div><span>Líquido</span><strong>${currency(month.net)}</strong></div><div class="balance-metric"><span>Saldo após ${escapeHtml(LEDGER.MONTHS[monthIndex])}</span><strong class="${risk ? "negative-text" : "positive-text"}">${currency(month.balance)}</strong></div></div></article>`;
      }).join("");
      return `<section class="monthly-company-card"><div class="monthly-company-head"><div><span class="company-kicker">${escapeHtml(company.code)} · fonte pagadora</span><h3>${escapeHtml(company.name)}</h3></div><div class="monthly-summary"><span>Movimento do mês <strong>${currency(companyGross)}</strong></span><span>IRRF <strong>${currency(companyIrrf)}</strong></span><span>Saldo da ata <strong class="${companyBalance < 0 ? "negative-text" : "positive-text"}">${currency(companyBalance)}</strong></span><span>Posições negativas <strong class="${companyRisks ? "negative-text" : "positive-text"}">${companyRisks}</strong></span></div></div><div class="partner-flow-list">${partners}</div></section>`;
    }).join("");
    return `<div class="monthly-stack"><section class="month-control"><div class="month-control-head"><div><span class="company-kicker">Acompanhamento anual · 2026</span><h2>Competência: <strong>${escapeHtml(monthName)}</strong></h2><p>Selecione um mês para comparar empresas, direitos e retenções sem tabelas ou rolagem lateral.</p></div><span class="status ${negativeCount ? "attention" : "regular"}">${negativeCount ? `${negativeCount} posição(ões) negativa(s)` : "Sem saldos negativos"}</span></div>${monthPicker}</section><div class="stats-grid stats-4">${statCard(`Distribuído em ${monthName}`, currency(monthGross), `${activeCompanies} empresa(s) com movimento`, "blue")}${statCard("IRRF estimado", currency(monthIrrf), "Retenção da competência", monthIrrf ? "rose" : "emerald")}${statCard("Saldos negativos", String(negativeCount), "Após os movimentos do mês", negativeCount ? "amber" : "emerald")}${statCard("Empresas ativas", `${activeCompanies}/${DATA.companies.length}`, "Na competência selecionada", "indigo")}</div><div class="tax-rule-note">${icon("info")}<span><strong>Leitura tributária:</strong> empresa + sócio PF + mês. Acima de R$ 50 mil, o IRRF estimado é 10% sobre o total tributável; exatamente R$ 50 mil não aciona retenção. A parcela válida de ata/2025 é separada antes do cálculo.</span></div><div class="monthly-company-grid">${cards}</div></div>`;
  }

  function rulesContent() {
    const rows = [
      ["Resumo consolidado do grupo", "yes", "no"],
      ["Empresas e posição por empresa", "yes", "no"],
      ["Direito, recebido e saldo dos sócios", "yes", "yes"],
      ["Documentos, contatos e dados bancários", "no", "no"],
      ["Ações de edição, estorno e exportação", "no", "no"],
    ];
    const cell = (value) => value === "yes" ? '<span class="yes">Exibe</span>' : '<span class="no">Não envia</span>';
    return `<div class="overview-grid"><section class="section-card"><div class="section-head"><div><h2>Regras de cálculo e leitura</h2><p>Mescla das ideias do arquivo com as regras atuais</p></div></div><div class="section-body">${ruleList()}</div></section><section class="section-card"><div class="section-head"><div><h2>Matriz do acesso público</h2><p>Allowlist diferente para cada tipo de link</p></div></div><div class="visibility-wrap"><table class="visibility-table"><thead><tr><th>Conteúdo</th><th>Grupo</th><th>Somente sócios</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row[0]}</td><td>${cell(row[1])}</td><td>${cell(row[2])}</td></tr>`).join("")}</tbody></table></div></section></div>`;
  }

  function statsMarkup(scope, state) {
    const summary = totals(scope, state);
    const base = [
      statCard(scope === "group" ? "Lucros em atas" : "Direito autorizado", compactCurrency(summary.approved), "Base fictícia do recorte", "blue"),
      statCard("Distribuído", compactCurrency(summary.distributed), `${percentage(summary.progress)} do total`, "emerald"),
      statCard("Saldo", compactCurrency(summary.balance), "Disponível no recorte", "amber"),
    ];
    if (scope === "group") {
      base.push(statCard("Empresas", String(DATA.companies.length), "Saldos independentes", "indigo"));
      base.push(statCard("IRRF estimado", compactCurrency(summary.irpf), "IRPF retido mensalmente", "rose"));
    } else {
      base.push(statCard("Sócios", String(DATA.shareholders.length), "Nenhuma empresa é enviada", "indigo"));
    }
    return `<div class="stats-grid stats-${base.length}">${base.join("")}</div>`;
  }

  function movementContent(state) {
    const tax = LEDGER.taxEngine(state.movements);
    const rows = state.movements.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).map((movement) => {
      const company = DATA.companies.find((item) => item.id === movement.companyId);
      const shareholder = DATA.shareholders.find((item) => item.id === movement.shareholderId);
      const detail = tax.get(movement.id);
      const active = movement.status === "effective";
      const status = movement.status === "reversed" ? "Estornado" : movement.status === "superseded" ? "Substituído" : detail?.irpf ? "Com IRRF" : detail?.legacy === movement.amount ? "Ata/25" : "Efetivo";
      return `<tr class="${active ? "" : "inactive-row"}"><td>${escapeHtml(new Date(`${movement.date}T12:00:00`).toLocaleDateString("pt-BR"))}</td><td><strong>${escapeHtml(company?.name ?? "Empresa removida")}</strong><span>${escapeHtml(company?.code ?? "")}</span></td><td><strong>${escapeHtml(shareholder?.name ?? "Sócio removido")}</strong><span>${escapeHtml(shareholder?.type ?? "")}</span></td><td>${compactCurrency(movement.amount)}</td><td>${compactCurrency(detail?.irpf ?? 0)}</td><td>${compactCurrency(detail?.net ?? movement.amount)}</td><td><span class="status ${active ? (detail?.irpf ? "attention" : "regular") : ""}">${status}</span></td><td><div class="row-actions">${active ? `<button class="icon-button small" data-action="edit-movement" data-id="${escapeHtml(movement.id)}" type="button" aria-label="Editar lançamento">${icon("edit")}</button><button class="icon-button small" data-action="open-reverse" data-id="${escapeHtml(movement.id)}" type="button" aria-label="Estornar lançamento">${icon("reverse")}</button>` : ""}</div></td></tr>`;
    }).join("");
    return `<section class="section-card"><div class="section-head"><div><h2>Livro de movimentações</h2><p>Edições criam nova versão; estornos preservam o evento original</p></div><button class="button primary" data-action="open-movement" type="button">${icon("plus")}Novo lançamento</button></div><div class="ledger-scroll"><table class="ledger-table"><thead><tr><th>Data</th><th>Empresa</th><th>Sócio</th><th>Bruto</th><th>IRRF</th><th>Líquido</th><th>Status</th><th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }

  function adminTabContent(activeTab, state) {
    if (activeTab === "companies") return `<section class="section-card"><div class="section-head"><div><h2>Empresas do grupo</h2><p>Cada fonte pagadora preserva o próprio saldo</p></div></div><div class="section-body">${companyCards(state)}</div></section>`;
    if (activeTab === "shareholders") return `<section class="section-card"><div class="section-head"><div><h2>Posição dos sócios</h2><p>Direitos consolidados apenas dentro do escopo autorizado</p></div></div><div class="section-body">${shareholderCards(state)}</div></section>`;
    if (activeTab === "monthly") return monthlyContent("group", state);
    if (activeTab === "movements") return movementContent(state);
    if (activeTab === "rules") return rulesContent();
    return overviewContent(state);
  }

  function sidebar() {
    const links = [["layout", "Central"], ["building", "Empresas"], ["users", "Sócios"], ["movement", "Movimentações"], ["file", "Relatório"]];
    return `<aside class="sidebar"><div class="sidebar-logo"><span class="logo-mark">P</span><span class="logo-copy"><strong>Grupo Pomin</strong><span>Distribuição de lucros</span></span></div><nav class="side-nav" aria-label="Navegação principal">${links.map(([glyph, label], index) => `<button class="side-link ${index === 0 ? "active" : ""}" data-action="nav-placeholder" type="button" aria-current="${index === 0 ? "page" : "false"}">${icon(glyph)}<span class="side-label">${label}</span></button>`).join("")}</nav><div class="sidebar-foot">MVP isolado · dados sintéticos</div></aside>`;
  }

  function mobileMenu(state) {
    if (!state.mobileMenuOpen) return "";
    const links = [["layout", "Central"], ["building", "Empresas"], ["users", "Sócios"], ["movement", "Movimentações"], ["file", "Relatório"]];
    return `<div class="mobile-overlay" data-action="close-mobile-overlay"><aside class="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu principal"><div class="mobile-drawer-head"><div class="sidebar-logo"><span class="logo-mark">P</span><span class="mobile-logo-copy"><strong>Grupo Pomin</strong><span>Distribuição de lucros</span></span></div><button class="icon-button" data-action="close-mobile-menu" type="button" aria-label="Fechar menu">${icon("x")}</button></div><nav class="mobile-nav" aria-label="Navegação principal">${links.map(([glyph, label], index) => `<button class="side-link ${index === 0 ? "active" : ""}" data-action="nav-placeholder" type="button">${icon(glyph)}<span>${label}</span></button>`).join("")}</nav><div class="mobile-drawer-foot">MVP isolado · dados sintéticos</div></aside></div>`;
  }

  function themeButton(theme) {
    const dark = theme === "dark";
    return `<button class="icon-button" data-action="theme" type="button" aria-label="${dark ? "Ativar tema claro" : "Ativar tema escuro"}" title="${dark ? "Tema claro" : "Tema escuro"}">${icon(dark ? "sun" : "moon")}</button>`;
  }

  function renderAdmin(state) {
    const adminTabs = [
      { id: "overview", label: "Visão geral" },
      { id: "companies", label: "Empresas", count: DATA.companies.length },
      { id: "shareholders", label: "Sócios", count: DATA.shareholders.length },
      { id: "monthly", label: "Fluxo mensal" },
      { id: "movements", label: "Lançamentos", count: state.movements.filter((movement) => movement.status === "effective").length },
      { id: "rules", label: "Regras & acesso" },
    ];
    return `<div class="app-shell">${sidebar()}<div class="main-column"><header class="top-header"><button class="icon-button mobile-menu-button" data-action="open-mobile-menu" type="button" aria-label="Abrir menu">${icon("menu")}</button><div class="breadcrumb">Distribuição / <strong>${escapeHtml(DATA.group.name)}</strong></div><div class="header-actions"><span class="demo-chip">Dados demonstrativos</span>${themeButton(state.theme)}</div></header><main class="canvas"><div class="page-stack"><header class="page-header"><div class="page-heading"><div class="eyebrow"><span class="eyebrow-dot"></span>Visão consolidada</div><h1 class="page-title">${escapeHtml(DATA.group.name)}</h1><p class="page-subtitle">Grupo, empresas e sócios organizados em abas, com cálculo mensal por fonte pagadora e beneficiário.</p></div><div class="page-actions"><button class="button" data-action="open-share" type="button">${icon("share")}Compartilhar visão</button><button class="button primary" data-action="open-movement" type="button">${icon("plus")}Novo lançamento</button></div></header><div class="mvp-note">${icon("info")}<span><strong>MVP funcional:</strong> lançamentos, edições e estornos ficam apenas neste navegador. Nenhum dado do arquivo original foi incluído.</span></div>${statsMarkup("group", state)}${tabs(adminTabs, state.adminTab, "admin-tab")}<div class="tab-panel" id="admin-panel-${state.adminTab}" role="tabpanel" aria-labelledby="admin-tab-${state.adminTab}">${adminTabContent(state.adminTab, state)}</div></div></main></div>${mobileMenu(state)}</div>`;
  }

  function publicGroupContent(activeTab, state) {
    if (activeTab === "companies") return `<section class="section-card"><div class="section-head"><div><h2>Empresas incluídas</h2><p>Documentos e informações internas permanecem ocultos</p></div></div><div class="section-body">${companyCards(state)}</div></section>`;
    if (activeTab === "shareholders") return `<section class="section-card"><div class="section-head"><div><h2>Sócios incluídos</h2><p>Somente valores autorizados para este compartilhamento</p></div></div><div class="section-body">${shareholderCards(state)}</div></section>`;
    if (activeTab === "monthly") return monthlyContent("group", state);
    return overviewContent(state);
  }

  function publicHeader(state, scopeLabel) {
    return `<header class="public-header"><div class="public-brand"><span class="logo-mark">P</span><span class="public-brand-copy"><strong>Grupo Pomin</strong><span>Posição compartilhada</span></span></div><div class="header-actions"><span class="scope-chip">${escapeHtml(scopeLabel)}</span>${themeButton(state.theme)}<button class="icon-button" data-action="sign-out" type="button" aria-label="Sair da visualização" title="Sair">${icon("logout")}</button></div></header>`;
  }

  function renderPublic(state) {
    const shareholdersOnly = state.shareScope === "shareholders";
    const scopeLabel = shareholdersOnly ? "Somente sócios" : "Grupo completo";
    const groupTabs = [{ id: "summary", label: "Resumo" }, { id: "companies", label: "Empresas", count: DATA.companies.length }, { id: "shareholders", label: "Sócios", count: DATA.shareholders.length }, { id: "monthly", label: "Fluxo mensal" }];
    const content = shareholdersOnly
      ? `<div class="mvp-note">${icon("shield")}<span><strong>Privacidade por escopo:</strong> este payload contém somente os sócios autorizados e seus agregados mensais.</span></div><section class="section-card"><div class="section-head"><div><h2>Posição individual dos sócios</h2><p>Direito, recebido e saldo do recorte autorizado</p></div><span class="status regular">Somente leitura</span></div><div class="section-body">${shareholderCards(state)}</div></section>${monthlyContent("shareholders", state)}`
      : `${tabs(groupTabs, state.publicTab, "public-tab")}<div class="tab-panel" id="public-panel-${state.publicTab}" role="tabpanel" aria-labelledby="public-tab-${state.publicTab}">${publicGroupContent(state.publicTab, state)}</div>`;
    return `<div class="public-shell">${publicHeader(state, scopeLabel)}<div class="readonly-strip">${icon("lock")}MVP — acesso simulado · somente leitura · validade local de ${state.expiryDays} dias</div><main class="public-main"><div class="page-stack"><header class="page-header"><div class="page-heading"><div class="eyebrow"><span class="eyebrow-dot"></span>${shareholdersOnly ? "Recorte privado" : "Grupo empresarial"}</div><h1 class="page-title">${shareholdersOnly ? "Posição dos sócios" : escapeHtml(DATA.group.name)}</h1><p class="page-subtitle">${shareholdersOnly ? "Visualização exclusiva dos beneficiários autorizados, sem referências empresariais." : "Visão conjunta do grupo, com empresas, sócios e fluxo tributário separados em abas."}</p><div class="public-meta"><span>${icon("shield")}Documentos não incluídos</span><span>${icon("chart")}Atualizado em ${escapeHtml(DATA.group.updatedAt)}</span></div></div></header>${statsMarkup(shareholdersOnly ? "shareholders" : "group", state)}${content}</div></main></div>`;
  }

  function renderLock(state) {
    const label = state.shareScope === "shareholders" ? "Somente sócios" : `Grupo completo · ${DATA.group.name}`;
    if (state.invalidShare) return `<main class="lock-screen"><section class="lock-card"><div class="lock-mark">${icon("lock")}</div><h1>Acesso indisponível</h1><p>Este token não existe neste navegador ou os dados locais do MVP foram removidos.</p><button class="button full back-button" data-action="back-admin" type="button">Voltar ao painel MVP</button></section></main>`;
    if (state.expired) return `<main class="lock-screen"><section class="lock-card"><div class="lock-mark">${icon("lock")}</div><h1>Acesso expirado</h1><p>A validade local deste link demonstrativo terminou.</p><button class="button full back-button" data-action="back-admin" type="button">Voltar ao painel MVP</button></section></main>`;
    if (state.revoked) return `<main class="lock-screen"><section class="lock-card"><div class="lock-mark">${icon("lock")}</div><h1>Acesso revogado</h1><p>Este link demonstrativo foi marcado como revogado.</p><button class="button full back-button" data-action="back-admin" type="button">Voltar ao painel MVP</button></section></main>`;
    return `<main class="lock-screen"><form class="lock-card" id="unlock-form"><div class="lock-mark">${icon("lock")}</div><h1>Posição compartilhada</h1><p>Digite a senha para abrir este recorte em modo somente leitura.</p><div class="lock-context"><span>Escopo autorizado</span><strong>${escapeHtml(label)}</strong></div><div class="field"><label for="unlock-password">Senha de acesso</label><input class="input" id="unlock-password" name="password" type="password" autocomplete="current-password" autofocus required /><small>Use a senha definida ao gerar o link. No exemplo inicial: <strong>cliente2026</strong>.</small></div><div class="lock-error" role="alert">${escapeHtml(state.unlockError)}</div><button class="button primary full" type="submit">${icon("key")}Acessar visualização</button><button class="button ghost full back-button" data-action="back-admin" type="button">Voltar ao painel MVP</button></form></main>`;
  }

  function impactRow(label, before, after) {
    return `<div class="impact-row"><span>${escapeHtml(label)}</span><div><small>Antes</small><strong>${compactCurrency(before)}</strong></div><span>→</span><div><small>Depois</small><strong class="${after < 0 ? "negative-text" : "positive-text"}">${compactCurrency(after)}</strong></div></div>`;
  }

  function movementModal(state) {
    const draft = state.movementDraft;
    const company = DATA.companies.find((item) => item.id === draft.companyId) ?? DATA.companies[0];
    const shareholders = company.allocations.map((allocation) => DATA.shareholders.find((item) => item.id === allocation.shareholderId));
    const projection = LEDGER.preview(draft, state.movements, state.editingMovementId);
    const detail = projection.detail;
    const impact = projection.afterCompany ? `<div class="impact-list">${impactRow("Empresa", projection.beforeCompany.balance, projection.afterCompany.balance)}${impactRow("Sócio", projection.beforeShareholder.balance, projection.afterShareholder.balance)}</div><div class="tax-preview ${detail.irpf ? "taxed" : ""}"><strong>${detail.irpf ? `IRRF incremental estimado: ${currency(detail.irpf)}` : "Sem IRRF incremental neste lançamento"}</strong><span>Bruto ${currency(projection.amount)} · ata/2025 ${currency(detail.legacy)} · base tributável ${currency(detail.taxable)} · líquido ${currency(detail.net)}</span></div>` : `<div class="empty-preview">Informe empresa, sócio, data e valor para visualizar o impacto.</div>`;
    return `<div class="overlay" data-action="close-movement-overlay"><section class="modal movement-modal" role="dialog" aria-modal="true" aria-labelledby="movement-title"><div class="modal-header"><div><h2 id="movement-title">${state.editingMovementId ? "Editar lançamento" : "Novo lançamento"}</h2><p>O saldo e o IRRF são recalculados antes de salvar.</p></div><button class="icon-button" data-action="close-movement" type="button" aria-label="Fechar">${icon("x")}</button></div><form id="movement-form"><div class="modal-body movement-layout"><div class="movement-fields"><div class="form-grid"><div class="field"><label for="movement-company">Empresa / fonte pagadora</label><select class="select" id="movement-company">${DATA.companies.map((item) => `<option value="${item.id}" ${item.id === company.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}</select></div><div class="field"><label for="movement-shareholder">Sócio favorecido</label><select class="select" id="movement-shareholder">${shareholders.map((item) => `<option value="${item.id}" ${item.id === draft.shareholderId ? "selected" : ""}>${escapeHtml(item.name)} · ${item.type}</option>`).join("")}</select></div></div><div class="form-grid three"><div class="field"><label for="movement-amount">Valor bruto</label><input class="input" id="movement-amount" inputmode="decimal" value="${escapeHtml(draft.amount)}" placeholder="0,00" required /></div><div class="field"><label for="movement-date">Data efetiva</label><input class="input" id="movement-date" type="date" value="${escapeHtml(draft.date)}" required /></div><div class="field"><label for="movement-type">Fato gerador</label><select class="select" id="movement-type">${["Pagamento", "Crédito", "Capitalização", "Entrega em bens"].map((value) => `<option ${value === draft.eventType ? "selected" : ""}>${value}</option>`).join("")}</select></div></div><div class="form-grid"><div class="field"><label for="movement-method">Forma operacional</label><select class="select" id="movement-method">${["PIX", "TED", "Transferência interna", "Compensação", "Capitalização", "Outro"].map((value) => `<option ${value === draft.method ? "selected" : ""}>${value}</option>`).join("")}</select></div><label class="check-field"><input id="movement-legacy" type="checkbox" ${draft.legacy ? "checked" : ""}/><span><strong>Vincular à ata/2025</strong><small>A parcela coberta pelo direito fica separada da base tributável.</small></span></label></div><div class="field"><label for="movement-note">Justificativa / observação</label><textarea class="textarea" id="movement-note" placeholder="Obrigatória se o lançamento deixar saldo negativo.">${escapeHtml(draft.note)}</textarea></div>${projection.overdraw ? `<label class="overdraw-check"><input id="movement-overdraw" type="checkbox" ${draft.confirmOverdraw ? "checked" : ""}/><span><strong>Confirmo o saldo negativo.</strong> O excedente ficará registrado e precisará de classificação contábil.</span></label>` : ""}${state.movementError ? `<div class="form-error" role="alert">${escapeHtml(state.movementError)}</div>` : ""}</div><aside class="preview-card"><h3>Impacto do lançamento</h3><p>Prévia no saldo da empresa, no direito do sócio e na retenção mensal.</p>${impact}</aside></div></div><div class="modal-footer"><button class="button" data-action="close-movement" type="button">Cancelar</button><button class="button primary" type="submit">${icon("check")}${state.editingMovementId ? "Salvar nova versão" : "Registrar lançamento"}</button></div></form></section></div>`;
  }

  function reverseModal(state) {
    const movement = state.movements.find((item) => item.id === state.reversingMovementId);
    const company = DATA.companies.find((item) => item.id === movement?.companyId);
    const shareholder = DATA.shareholders.find((item) => item.id === movement?.shareholderId);
    return `<div class="overlay" data-action="close-reverse-overlay"><section class="modal compact-modal" role="dialog" aria-modal="true" aria-labelledby="reverse-title"><div class="modal-header"><div><h2 id="reverse-title">Estornar lançamento</h2><p>O evento original continuará visível no histórico.</p></div><button class="icon-button" data-action="close-reverse" type="button" aria-label="Fechar">${icon("x")}</button></div><form id="reverse-form"><div class="modal-body"><div class="reverse-context"><strong>${movement ? currency(movement.amount) : "Movimento indisponível"}</strong><span>${escapeHtml(company?.name ?? "")} · ${escapeHtml(shareholder?.name ?? "")}</span></div><div class="field"><label for="reverse-reason">Motivo obrigatório</label><textarea class="textarea" id="reverse-reason" minlength="10" placeholder="Descreva o motivo do estorno.">${escapeHtml(state.reverseReason)}</textarea><small>Mínimo de 10 caracteres.</small></div>${state.reverseError ? `<div class="form-error" role="alert">${escapeHtml(state.reverseError)}</div>` : ""}</div><div class="modal-footer"><button class="button" data-action="close-reverse" type="button">Cancelar</button><button class="button danger" type="submit">${icon("reverse")}Confirmar estorno</button></div></form></section></div>`;
  }

  function renderShareModal(state) {
    if (state.movementModalOpen) return movementModal(state);
    if (state.reverseModalOpen) return reverseModal(state);
    if (!state.modalOpen) return "";
    const groupActive = state.shareScope === "group";
    const result = state.modalStep === "result" ? `<div class="result-box"><div class="result-status"><div><strong>Acesso criado para ${groupActive ? "o grupo" : "os sócios"}</strong><div class="entity-meta">Validade local de ${state.expiryDays} dias · documentos não enviados</div></div><span class="status regular">Ativo</span></div><div class="link-row"><input class="input" id="generated-link" aria-label="Link demonstrativo gerado" value="${escapeHtml(state.generatedLink)}" readonly /><button class="button" data-action="copy-link" type="button">${icon("copy")}Copiar</button></div><div class="result-actions"><button class="button primary" data-action="open-preview" type="button">${icon("external")}Abrir prévia</button><button class="button danger" data-action="revoke-link" type="button">Revogar simulação</button></div><div class="simulation-warning">A senha fica apenas como hash local e não aparece no link. O token funciona neste navegador.</div></div>` : "";
    return `<div class="overlay" data-action="close-overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="share-title"><div class="modal-header"><div><h2 id="share-title">Criar acesso compartilhado</h2><p>Escolha exatamente o que o cliente poderá visualizar.</p></div><button class="icon-button" data-action="close-share" type="button" aria-label="Fechar">${icon("x")}</button></div><form id="share-form"><div class="modal-body"><div class="scope-options" role="radiogroup" aria-label="Escopo do link"><button class="scope-option ${groupActive ? "active" : ""}" data-action="share-scope" data-scope="group" role="radio" aria-checked="${groupActive}" tabindex="${groupActive ? "0" : "-1"}" type="button"><span class="scope-option-icon">${icon("building")}</span><span class="scope-option-copy"><strong>Grupo completo</strong><span>Resumo, empresas, sócios e fluxo mensal.</span></span></button><button class="scope-option ${groupActive ? "" : "active"}" data-action="share-scope" data-scope="shareholders" role="radio" aria-checked="${!groupActive}" tabindex="${groupActive ? "-1" : "0"}" type="button"><span class="scope-option-icon">${icon("users")}</span><span class="scope-option-copy"><strong>Somente sócios</strong><span>Payload separado, sem empresas.</span></span></button></div><div class="form-grid"><div class="field"><label for="share-password">Senha da demonstração</label><input class="input" id="share-password" name="sharePassword" type="password" minlength="6" autocomplete="new-password" value="${escapeHtml(state.password)}" required /><small>Mínimo de 6 caracteres.</small></div><div class="field"><label for="share-expiry">Expiração</label><select class="select" id="share-expiry" name="expiryDays"><option value="3" ${state.expiryDays === 3 ? "selected" : ""}>3 dias</option><option value="7" ${state.expiryDays === 7 ? "selected" : ""}>7 dias</option><option value="15" ${state.expiryDays === 15 ? "selected" : ""}>15 dias</option><option value="30" ${state.expiryDays === 30 ? "selected" : ""}>30 dias</option></select></div></div><div class="privacy-box"><div class="privacy-row">${icon("check")}Documentos, contatos e dados bancários não entram no recorte.</div><div class="privacy-row">${icon("check")}Ações administrativas ficam indisponíveis.</div><div class="privacy-row">${icon("check")}O escopo de sócios carrega um payload separado.</div></div>${state.modalError ? `<div class="form-error" role="alert">${escapeHtml(state.modalError)}</div>` : ""}${result}<div class="simulation-warning"><strong>Limite do MVP:</strong> token, senha, validade e revogação vivem no armazenamento local. A proteção real será feita no backend.</div></div><div class="modal-footer"><button class="button" data-action="close-share" type="button">Fechar</button><button class="button primary" type="submit" ${state.generating ? "disabled" : ""}>${icon("key")}${state.generating ? "Gerando..." : state.modalStep === "result" ? "Gerar novamente" : "Gerar link"}</button></div></form></section></div>`;
  }

  window.MVP_UI = Object.freeze({ escapeHtml, icon, renderAdmin, renderLock, renderPublic, renderShareModal });
})();
