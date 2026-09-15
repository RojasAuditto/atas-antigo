(() => {
  "use strict";

  const DATA = window.MVP_DATA;
  const UI = window.MVP_UI;
  const LEDGER = window.MVP_LEDGER;
  const OPS = window.MVP_OPERATIONS;
  const BOOTSTRAP = window.MVP_SHARE_BOOTSTRAP ?? { token: null, record: null };
  const appRoot = document.getElementById("app");
  const modalRoot = document.getElementById("modal-root");
  const toastRoot = document.getElementById("toast-root");
  const DEFAULT_PASSWORD = "cliente2026";
  const STORAGE_PREFIX = "pomin-mvp-share:";
  const MOVEMENTS_KEY = "pomin-mvp-movements-v2";
  const DAY_MS = 86400000;
  const VALID_SCOPES = new Set(["group", "shareholders"]);
  const ADMIN_TABS = new Set(["overview", "companies", "shareholders", "monthly", "movements", "rules"]);
  const PUBLIC_TABS = new Set(["summary", "companies", "shareholders", "monthly"]);
  const initialRecord = BOOTSTRAP.record;

  const state = {
    screen: BOOTSTRAP.token ? "lock" : "admin",
    adminTab: "overview",
    publicTab: "summary",
    monthlyMonth: 8,
    shareScope: initialRecord?.scope ?? "group",
    theme: window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    modalOpen: false,
    mobileMenuOpen: false,
    modalStep: "form",
    modalError: "",
    password: DEFAULT_PASSWORD,
    expiryDays: Number(initialRecord?.expiryDays ?? 15),
    generatedLink: "",
    generating: false,
    unlockError: "",
    invalidShare: Boolean(BOOTSTRAP.token && !initialRecord),
    revoked: Boolean(initialRecord?.revoked),
    expired: Boolean(initialRecord && Number(initialRecord.expiresAt) <= Date.now()),
    shareToken: BOOTSTRAP.token,
    shareRecord: initialRecord,
    movements: OPS.loadMovements(initialRecord, BOOTSTRAP.token, MOVEMENTS_KEY),
    shareholderSnapshot: initialRecord?.scope === "shareholders" ? initialRecord.snapshot ?? null : null,
    movementModalOpen: false,
    reverseModalOpen: false,
    movementDraft: OPS.defaultDraft(),
    movementError: "",
    editingMovementId: "",
    reversingMovementId: "",
    reverseReason: "",
    reverseError: "",
  };

  function publicPolicy(scope) {
    if (scope === "group") return Object.freeze({ tabs: ["summary", "companies", "shareholders", "monthly"], exposesCompanies: true });
    return Object.freeze({ tabs: [], exposesCompanies: false });
  }

  const checks = OPS.runSelfChecks(publicPolicy);
  Object.defineProperty(window, "__MVP_CHECKS__", { value: checks, configurable: false, writable: false });
  if (!checks.passed) throw new Error("A política de escopo do MVP não passou nas verificações internas.");

  function render(focusSelector = "") {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
    if (state.screen === "lock") appRoot.innerHTML = UI.renderLock(state);
    else if (state.screen === "public") appRoot.innerHTML = UI.renderPublic(state);
    else appRoot.innerHTML = UI.renderAdmin(state);
    modalRoot.innerHTML = UI.renderShareModal(state);
    const dialogOpen = state.modalOpen || state.movementModalOpen || state.reverseModalOpen;
    appRoot.toggleAttribute("inert", dialogOpen);
    appRoot.setAttribute("aria-hidden", dialogOpen ? "true" : "false");
    document.body.style.overflow = dialogOpen || state.mobileMenuOpen ? "hidden" : "";
    if (focusSelector) window.requestAnimationFrame(() => document.querySelector(focusSelector)?.focus());
  }

  function showToast(message) {
    toastRoot.innerHTML = `<div class="toast">${UI.icon("check")}<span>${UI.escapeHtml(message)}</span></div>`;
    window.setTimeout(() => { toastRoot.innerHTML = ""; }, 2800);
  }

  function createToken() {
    const bytes = window.crypto.getRandomValues(new Uint8Array(16));
    return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function digestPassword(password) {
    if (!window.crypto?.subtle) throw new Error("Este navegador não oferece a API criptográfica necessária para a demonstração.");
    const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function shareUrl(token) {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("share", token);
    return url.toString();
  }

  function saveRecord(token, record) {
    window.localStorage.setItem(`${STORAGE_PREFIX}${token}`, JSON.stringify(record));
  }

  function closeShareModal() {
    state.modalOpen = false;
    state.modalError = "";
    render('[data-action="open-share"]');
  }

  function persistMovements(movements) {
    window.localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
  }

  function openMovement(existingId = "") {
    const existing = state.movements.find((movement) => movement.id === existingId && movement.status === "effective");
    state.editingMovementId = existing?.id ?? "";
    state.movementDraft = OPS.defaultDraft(existing);
    state.movementError = "";
    state.movementModalOpen = true;
    render("#movement-company");
  }

  function closeMovement() {
    state.movementModalOpen = false;
    state.movementError = "";
    render('[data-action="open-movement"]');
  }

  function saveMovement() {
    const draft = state.movementDraft;
    const projection = LEDGER.preview(draft, state.movements, state.editingMovementId);
    if (!projection.company || !projection.shareholder || projection.amount <= 0 || !draft.date) state.movementError = "Informe empresa, sócio, data e valor válidos.";
    else if (projection.overdraw && !draft.confirmOverdraw) state.movementError = "Confirme explicitamente o saldo negativo para prosseguir.";
    else if (projection.overdraw && draft.note.trim().length < 10) state.movementError = "Para saldo negativo, informe uma justificativa com pelo menos 10 caracteres.";
    else state.movementError = "";
    if (state.movementError) { render("#movement-amount"); return; }
    const original = state.movements.find((movement) => movement.id === state.editingMovementId);
    const next = state.movements.map((movement) => movement.id === original?.id ? { ...movement, status: "superseded" } : movement);
    const record = {
      id: `mov-${Date.now()}`, companyId: draft.companyId, shareholderId: draft.shareholderId, date: draft.date,
      amount: projection.amount, eventType: draft.eventType, method: draft.method, legacy: draft.legacy, note: draft.note.trim(),
      status: "effective", revision: (original?.revision ?? 0) + 1, revisesId: original?.id ?? "",
    };
    state.movements = [...next, record];
    persistMovements(state.movements);
    state.movementModalOpen = false;
    state.adminTab = "movements";
    render('[data-action="admin-tab"][data-tab="movements"]');
    showToast(original ? "Nova versão salva; saldos e IRRF foram recalculados." : "Lançamento registrado e fluxo mensal recalculado.");
  }

  function submitReverse() {
    const reason = state.reverseReason.trim();
    if (reason.length < 10) { state.reverseError = "Informe um motivo com pelo menos 10 caracteres."; render("#reverse-reason"); return; }
    state.movements = state.movements.map((movement) => movement.id === state.reversingMovementId ? { ...movement, status: "reversed", reversalReason: reason } : movement);
    persistMovements(state.movements);
    state.reverseModalOpen = false;
    state.reverseError = "";
    render('[data-action="admin-tab"][data-tab="movements"]');
    showToast("Estorno registrado; posição mensal e IRRF recalculado.");
  }

  async function copyGeneratedLink() {
    try {
      await navigator.clipboard.writeText(state.generatedLink);
      showToast("Link demonstrativo copiado.");
    } catch {
      document.getElementById("generated-link")?.select();
      showToast("Selecione o link e copie manualmente.");
    }
  }

  async function handleShareSubmit() {
    if (state.password.length < 6) {
      state.modalError = "Use uma senha com pelo menos 6 caracteres.";
      state.modalStep = "form";
      render("#share-password");
      return;
    }
    state.generating = true;
    state.modalError = "";
    render();
    try {
      const token = createToken();
      const record = {
        scope: state.shareScope,
        passwordDigest: await digestPassword(state.password),
        expiryDays: state.expiryDays,
        expiresAt: Date.now() + state.expiryDays * DAY_MS,
        revoked: false,
        ...(state.shareScope === "group" ? { movements: structuredClone(state.movements) } : { snapshot: LEDGER.shareholderSnapshot(state.movements) }),
      };
      saveRecord(token, record);
      state.shareToken = token;
      state.shareRecord = record;
      state.generatedLink = shareUrl(token);
      state.modalStep = "result";
      state.generating = false;
      render("#generated-link");
    } catch (error) {
      state.generating = false;
      state.modalError = error instanceof Error ? error.message : "Não foi possível criar o acesso local.";
      render("#share-password");
    }
  }

  async function handleUnlock(form) {
    if (!state.shareRecord || state.invalidShare || state.revoked || state.expired) return;
    const password = String(new FormData(form).get("password") ?? "");
    try {
      if (await digestPassword(password) !== state.shareRecord.passwordDigest) {
        state.unlockError = "Senha incorreta ou acesso indisponível.";
        render("#unlock-password");
        return;
      }
      state.unlockError = "";
      state.screen = "public";
      state.publicTab = "summary";
      render();
    } catch {
      state.unlockError = "Não foi possível validar a senha neste navegador.";
      render("#unlock-password");
    }
  }

  function revokeCurrentLink() {
    if (!state.shareToken || !state.shareRecord) return;
    const revokedRecord = { ...state.shareRecord, revoked: true };
    saveRecord(state.shareToken, revokedRecord);
    window.location.assign(state.generatedLink || shareUrl(state.shareToken));
  }

  document.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "open-movement") {
      openMovement();
    } else if (action === "edit-movement") {
      openMovement(target.dataset.id);
    } else if (action === "close-movement" || (action === "close-movement-overlay" && event.target === target)) {
      closeMovement();
    } else if (action === "open-reverse") {
      state.reversingMovementId = target.dataset.id;
      state.reverseReason = "";
      state.reverseError = "";
      state.reverseModalOpen = true;
      render("#reverse-reason");
    } else if (action === "close-reverse" || (action === "close-reverse-overlay" && event.target === target)) {
      state.reverseModalOpen = false;
      state.reverseError = "";
      render('[data-action="admin-tab"][data-tab="movements"]');
    } else if (action === "open-share") {
      state.modalOpen = true;
      state.modalStep = "form";
      state.modalError = "";
      render("#share-password");
    } else if (action === "close-share" || (action === "close-overlay" && event.target === target)) {
      closeShareModal();
    } else if (action === "share-scope" && VALID_SCOPES.has(target.dataset.scope)) {
      state.shareScope = target.dataset.scope;
      state.modalStep = "form";
      state.modalError = "";
      state.generatedLink = "";
      render(`[data-scope="${state.shareScope}"]`);
    } else if (action === "admin-tab" && ADMIN_TABS.has(target.dataset.tab)) {
      state.adminTab = target.dataset.tab;
      render(`[data-action="admin-tab"][data-tab="${state.adminTab}"]`);
    } else if (action === "public-tab" && PUBLIC_TABS.has(target.dataset.tab)) {
      state.publicTab = target.dataset.tab;
      render(`[data-action="public-tab"][data-tab="${state.publicTab}"]`);
    } else if (action === "select-month" && Number.isInteger(Number(target.dataset.month)) && Number(target.dataset.month) >= 0 && Number(target.dataset.month) < 12) {
      state.monthlyMonth = Number(target.dataset.month);
      render(`[data-action="select-month"][data-month="${state.monthlyMonth}"]`);
    } else if (action === "theme") {
      state.theme = state.theme === "dark" ? "light" : "dark";
      render('[data-action="theme"]');
    } else if (action === "copy-link") {
      await copyGeneratedLink();
    } else if (action === "open-preview" && state.generatedLink) {
      window.location.assign(state.generatedLink);
    } else if (action === "revoke-link") {
      revokeCurrentLink();
    } else if (action === "back-admin") {
      window.location.assign(window.location.pathname);
    } else if (action === "sign-out") {
      state.screen = "lock";
      state.unlockError = "";
      render("#unlock-password");
    } else if (action === "open-mobile-menu") {
      state.mobileMenuOpen = true;
      render('.mobile-drawer [data-action="nav-placeholder"]');
    } else if (action === "close-mobile-menu" || (action === "close-mobile-overlay" && event.target === target)) {
      state.mobileMenuOpen = false;
      render('[data-action="open-mobile-menu"]');
    } else if (action === "nav-placeholder") {
      state.mobileMenuOpen = false;
      render();
      showToast("Nesta rodada, o MVP demonstra a visão consolidada e o compartilhamento.");
    }
  });

  document.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (event.target.id === "share-form") await handleShareSubmit();
    if (event.target.id === "unlock-form") await handleUnlock(event.target);
    if (event.target.id === "movement-form") saveMovement();
    if (event.target.id === "reverse-form") submitReverse();
  });

  function syncShareFields(target) {
    if (target.id === "share-password") state.password = target.value;
    if (target.id === "share-expiry") state.expiryDays = Number(target.value);
  }

  function syncMovementFields(target) {
    const draft = state.movementDraft;
    if (target.id === "movement-company") {
      const company = DATA.companies.find((item) => item.id === target.value);
      state.movementDraft = { ...draft, companyId: target.value, shareholderId: company?.allocations?.[0]?.shareholderId ?? "" };
    } else if (target.id === "movement-shareholder") state.movementDraft = { ...draft, shareholderId: target.value };
    else if (target.id === "movement-amount") state.movementDraft = { ...draft, amount: target.value };
    else if (target.id === "movement-date") state.movementDraft = { ...draft, date: target.value };
    else if (target.id === "movement-type") state.movementDraft = { ...draft, eventType: target.value };
    else if (target.id === "movement-method") state.movementDraft = { ...draft, method: target.value };
    else if (target.id === "movement-legacy") state.movementDraft = { ...draft, legacy: target.checked };
    else if (target.id === "movement-note") state.movementDraft = { ...draft, note: target.value };
    else if (target.id === "movement-overdraw") state.movementDraft = { ...draft, confirmOverdraw: target.checked };
    else if (target.id === "reverse-reason") state.reverseReason = target.value;
  }

  document.addEventListener("input", (event) => { syncShareFields(event.target); syncMovementFields(event.target); });
  document.addEventListener("change", (event) => {
    syncShareFields(event.target);
    syncMovementFields(event.target);
    if (event.target.id.startsWith("movement-")) render(`#${event.target.id}`);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.movementModalOpen) {
      event.preventDefault();
      closeMovement();
      return;
    }
    if (event.key === "Escape" && state.reverseModalOpen) {
      event.preventDefault();
      state.reverseModalOpen = false;
      render('[data-action="admin-tab"][data-tab="movements"]');
      return;
    }
    if (event.key === "Escape" && state.modalOpen) {
      event.preventDefault();
      closeShareModal();
      return;
    }
    if (event.key === "Escape" && state.mobileMenuOpen) {
      event.preventDefault();
      state.mobileMenuOpen = false;
      render('[data-action="open-mobile-menu"]');
      return;
    }

    const currentTab = event.target.closest('[role="tab"]');
    if (currentTab && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      const items = [...currentTab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
      const index = items.indexOf(currentTab);
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
      event.preventDefault();
      items[next].click();
      return;
    }

    const currentRadio = event.target.closest('[role="radio"]');
    if (currentRadio && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      const items = [...currentRadio.closest('[role="radiogroup"]').querySelectorAll('[role="radio"]')];
      const index = items.indexOf(currentRadio);
      const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
      event.preventDefault();
      items[(index + (forward ? 1 : -1) + items.length) % items.length].click();
      return;
    }

    if (event.key === "Tab" && (state.modalOpen || state.movementModalOpen || state.reverseModalOpen || state.mobileMenuOpen)) {
      const dialog = document.querySelector(state.modalOpen || state.movementModalOpen || state.reverseModalOpen ? ".modal" : ".mobile-drawer");
      const focusable = [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  window.addEventListener("popstate", () => window.location.reload());
  render(state.screen === "lock" && !state.invalidShare && !state.revoked && !state.expired ? "#unlock-password" : "");
})();
