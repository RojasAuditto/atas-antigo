(() => {
  "use strict";

  const DATA = window.MVP_DATA;

  function validMovement(movement) {
    return movement && typeof movement.id === "string" && typeof movement.companyId === "string" && typeof movement.shareholderId === "string" && /^\d{4}-\d{2}-\d{2}$/.test(movement.date) && Number.isFinite(movement.amount) && movement.amount > 0 && ["effective", "reversed", "superseded"].includes(movement.status);
  }

  function loadMovements(initialRecord, token, storageKey) {
    const shared = initialRecord?.scope === "group" ? initialRecord.movements : null;
    if (Array.isArray(shared) && shared.every(validMovement)) return structuredClone(shared);
    if (initialRecord?.scope === "group" && Array.isArray(DATA.movements)) return structuredClone(DATA.movements);
    if (!token && Array.isArray(DATA.movements)) {
      try {
        const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
        if (Array.isArray(saved) && saved.every(validMovement)) return saved;
      } catch {
        window.localStorage.removeItem(storageKey);
      }
      return structuredClone(DATA.movements);
    }
    return [];
  }

  function defaultDraft(existing) {
    const company = DATA.companies.find((item) => item.id === existing?.companyId) ?? DATA.companies[0];
    return {
      companyId: company?.id ?? "", shareholderId: existing?.shareholderId ?? company?.allocations?.[0]?.shareholderId ?? "",
      amount: existing ? existing.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "", date: existing?.date ?? "2026-09-01",
      eventType: existing?.eventType ?? "Pagamento", method: existing?.method ?? "PIX", legacy: existing?.legacy ?? false,
      note: existing?.note ?? "", confirmOverdraw: false,
    };
  }

  function runSelfChecks(publicPolicy) {
    const sum = (items, key) => items.reduce((total, item) => total + item[key], 0);
    const companyApproved = sum(DATA.companies, "approved");
    const companyDistributed = sum(DATA.companies, "distributed");
    const shareholderEntitlement = sum(DATA.shareholders, "entitlement");
    const shareholderReceived = sum(DATA.shareholders, "received");
    const monthlyDistributed = sum(DATA.months, "value");
    const bannedKeys = ["company", "companies", "companyId", "companyCount", "taxId", "document"];
    const shareholdersAreScoped = DATA.shareholders.every((shareholder) => bannedKeys.every((key) => !(key in shareholder)));
    const groupTabsMatch = publicPolicy("group").tabs.join("|") === "summary|companies|shareholders|monthly";
    const isolatedPayload = DATA.payloadScope !== "shareholders" || DATA.companies.length === 0 && shareholderReceived === monthlyDistributed && shareholdersAreScoped;
    const adminPayload = DATA.payloadScope !== "admin" || companyApproved === shareholderEntitlement && companyDistributed === shareholderReceived && companyDistributed === monthlyDistributed;
    const invalidPayload = DATA.payloadScope !== "invalid" || DATA.companies.length === 0 && DATA.shareholders.length === 0;
    return Object.freeze({ passed: groupTabsMatch && isolatedPayload && adminPayload && invalidPayload, payloadScope: DATA.payloadScope, groupTabsMatch, isolatedPayload, adminPayload, invalidPayload });
  }

  window.MVP_OPERATIONS = Object.freeze({ loadMovements, defaultDraft, runSelfChecks });
})();
