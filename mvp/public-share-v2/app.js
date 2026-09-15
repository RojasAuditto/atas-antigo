(() => {
  "use strict";

  const DATA = window.MVP_DATA;
  const MODEL = window.MVP_V2_MODEL;
  const partners = MODEL.partnerModels();
  const overview = MODEL.overview(partners);
  const app = document.querySelector("#app");
  const firstRisk = partners.flatMap((partner) => partner.months.map((month, monthIndex) => ({ partner, month, monthIndex })))
    .find((item) => item.month.negativeSources > 0);
  const state = {
    partnerId: "all",
    riskOnly: false,
    selectedPartnerId: firstRisk?.partner.shareholder.id ?? partners[0]?.shareholder.id,
    selectedMonth: firstRisk?.monthIndex ?? 0,
    dark: window.matchMedia("(prefers-color-scheme: dark)").matches,
  };

  const money = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
  const compact = (value) => new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  const icon = (name) => ({
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    users: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
    building: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M6 21V5l6-3 6 3v16M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  }[name] ?? "");

  function kpi(label, value, note, tone = "") {
    return `<article class="v2-kpi ${tone}"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`;
  }

  function monthTile(partner, month, monthIndex) {
    const selected = state.selectedPartnerId === partner.shareholder.id && state.selectedMonth === monthIndex;
    const risk = month.negativeSources > 0;
    const classes = ["month-tile", selected && "is-selected", risk && "has-risk", month.irpf > 0 && "has-tax"].filter(Boolean).join(" ");
    const status = risk ? `${month.negativeSources} empresa${month.negativeSources > 1 ? "s" : ""} negativa${month.negativeSources > 1 ? "s" : ""}` : month.irpf > 0 ? `IRPF ${money(month.irpf)}` : month.gross > 0 ? `${month.activeCompanies} origem${month.activeCompanies > 1 ? "s" : ""}` : "Sem movimento";
    return `<button class="${classes}" type="button" data-month="${monthIndex}" data-partner="${partner.shareholder.id}" aria-pressed="${selected}" aria-label="${month.label}: recebido ${money(month.gross)}, saldo ${money(month.balance)}. ${status}">
      <span class="month-name">${month.label}</span>
      <strong title="Recebido: ${money(month.gross)}">${month.gross ? `+ ${compact(month.gross)}` : "—"}</strong>
      <span class="month-balance ${month.balance < 0 ? "negative" : ""}" title="Saldo: ${money(month.balance)}">${compact(month.balance)}</span>
      <small>${status}</small>
    </button>`;
  }

  function sourceRow(source) {
    const risk = source.balance < 0;
    const status = risk ? "Saldo excedido" : source.irpf > 0 ? "Com IRPF" : source.gross > 0 ? "Movimentado" : "Sem movimento";
    return `<article class="source-row ${risk ? "is-negative" : ""}">
      <div class="source-company"><span class="source-icon">${icon("building")}</span><div><strong>${source.company.name}</strong><small>${source.company.code}</small></div></div>
      <dl><div><dt>Direito em ata</dt><dd>${money(source.entitlement)}</dd></div><div><dt>Disponível</dt><dd>${source.percentage.toFixed(2).replace(".", ",")}%</dd></div><div><dt>Recebido no mês</dt><dd>${money(source.gross)}</dd></div><div><dt>IRPF no mês</dt><dd>${money(source.irpf)}</dd></div><div><dt>Saldo após o mês</dt><dd class="${risk ? "negative" : ""}">${money(source.balance)}</dd></div></dl>
      <span class="source-status ${risk ? "danger" : source.irpf > 0 ? "tax" : ""}">${status}</span>
    </article>`;
  }

  function detailPanel(partner) {
    if (state.selectedPartnerId !== partner.shareholder.id) return "";
    const month = partner.months[state.selectedMonth];
    return `<section class="month-detail" aria-live="polite" aria-label="Detalhamento de ${month.label} para ${partner.shareholder.name}">
      <div class="detail-head"><div><span class="eyebrow">Detalhamento por empresa</span><h3>${partner.shareholder.name} · ${month.label} 2026</h3></div><div class="detail-totals"><span>Recebido <b>${money(month.gross)}</b></span><span>IRPF <b>${money(month.irpf)}</b></span><span>Saldo consolidado <b class="${month.balance < 0 ? "negative" : ""}">${money(month.balance)}</b></span></div></div>
      <div class="source-list">${month.sources.map(sourceRow).join("")}</div>
      <p class="detail-note">O alerta considera cada empresa separadamente. Assim, um saldo positivo em outra empresa não esconde um direito de ata já ultrapassado.</p>
    </section>`;
  }

  function partnerCard(partner) {
    const progress = partner.entitlement ? Math.min(100, partner.received / partner.entitlement * 100) : 0;
    return `<article class="partner-card" id="partner-${partner.shareholder.id}">
      <header class="partner-head"><div class="partner-identity"><span class="partner-avatar">${partner.shareholder.initials}</span><div><span class="eyebrow">${partner.shareholder.type} · ${partner.companyCount} empresa${partner.companyCount > 1 ? "s" : ""}</span><h2>${partner.shareholder.name}</h2></div></div><div class="partner-annual"><div><span>Direito anual</span><strong>${money(partner.entitlement)}</strong></div><div><span>Recebido</span><strong>${money(partner.received)}</strong></div><div><span>Saldo</span><strong class="${partner.balance < 0 ? "negative" : ""}">${money(partner.balance)}</strong></div><div><span>IRPF</span><strong>${money(partner.irpf)}</strong></div></div></header>
      <div class="progress-track" aria-label="${progress.toFixed(0)}% do direito recebido"><span style="width:${progress}%"></span></div>
      <div class="timeline-key"><span>Recebido no mês</span><span>Saldo acumulado</span><span class="key-tax">IRPF</span><span class="key-risk">Saldo por empresa negativo</span></div>
      <div class="month-grid">${partner.months.map((month, index) => monthTile(partner, month, index)).join("")}</div>
      ${detailPanel(partner)}
    </article>`;
  }

  function render() {
    document.documentElement.classList.toggle("dark", state.dark);
    const visible = partners.filter((partner) => (state.partnerId === "all" || partner.shareholder.id === state.partnerId) && (!state.riskOnly || partner.riskMonths > 0));
    app.innerHTML = `<div class="v2-shell">
      <header class="v2-topbar"><a class="v2-brand" href="./" aria-label="Início"><span>GP</span><div><b>Grupo Pomin</b><small>Atas & Lucros</small></div></a><div class="v2-version"><span>MVP V2</span><small>Visão experimental · somente leitura</small></div><button class="icon-button" id="theme-toggle" type="button" aria-label="Alternar tema">${icon(state.dark ? "sun" : "moon")}</button></header>
      <main class="v2-main">
        <section class="v2-hero"><div><span class="eyebrow">Visão geral · janeiro a dezembro de 2026</span><h1>Sócios, mês a mês</h1><p>Comece pelo sócio, identifique o mês e abra somente as empresas que precisam de análise.</p></div><div class="hero-badge">${icon("users")}<span><b>${overview.partners} sócios</b><small>${DATA.companies.length} empresas vinculadas</small></span></div></section>
        <section class="v2-kpis" aria-label="Resumo anual">${kpi("Direitos em ata", money(overview.entitlement), "Base consolidada do grupo")}${kpi("Total recebido", money(overview.received), `${(overview.received / overview.entitlement * 100).toFixed(1).replace(".", ",")}% dos direitos`, "accent")}${kpi("IRPF retido", money(overview.irpf), "Incidência demonstrativa", "tax")}${kpi("Sócios com alerta", String(overview.riskPartners).padStart(2, "0"), "Saldo negativo em alguma empresa", "risk")}</section>
        <section class="v2-controls" aria-label="Filtros"><div class="filter-group"><span>Visualizar</span><div class="filter-pills"><button type="button" data-filter="all" aria-pressed="${state.partnerId === "all"}">Todos</button>${partners.map((partner) => `<button type="button" data-filter="${partner.shareholder.id}" aria-pressed="${state.partnerId === partner.shareholder.id}">${partner.shareholder.name.split(" ")[0]}</button>`).join("")}</div></div><label class="risk-toggle"><input id="risk-only" type="checkbox" ${state.riskOnly ? "checked" : ""}/><span></span>Somente com alerta</label></section>
        <section class="partner-list">${visible.length ? visible.map(partnerCard).join("") : '<div class="empty-state">Nenhum sócio corresponde a este filtro.</div>'}</section>
      </main>
    </div>`;
    bindEvents();
  }

  function bindEvents() {
    document.querySelector("#theme-toggle")?.addEventListener("click", () => { state.dark = !state.dark; render(); });
    document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => { state.partnerId = button.dataset.filter; render(); }));
    document.querySelector("#risk-only")?.addEventListener("change", (event) => { state.riskOnly = event.target.checked; render(); });
    document.querySelectorAll("[data-month]").forEach((button) => button.addEventListener("click", () => {
      state.selectedPartnerId = button.dataset.partner;
      state.selectedMonth = Number(button.dataset.month);
      render();
      document.querySelector(`#partner-${state.selectedPartnerId} .month-detail`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }));
  }

  render();
})();
