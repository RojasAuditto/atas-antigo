(() => {
  "use strict";

  const DATA = window.MVP_DATA;
  const TAX_THRESHOLD = 50000;
  const TAX_RATE = 0.10;
  const MONTHS = Object.freeze(["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]);
  const effective = (movements) => movements.filter((movement) => movement.status === "effective");
  const companyById = (id) => DATA.companies.find((company) => company.id === id);
  const shareholderById = (id) => DATA.shareholders.find((shareholder) => shareholder.id === id);
  const allocationFor = (company, shareholderId) => company?.allocations?.find((allocation) => allocation.shareholderId === shareholderId);
  const sum = (items, selector) => items.reduce((total, item) => total + selector(item), 0);
  const monthKey = (date) => String(date).slice(0, 7);

  function taxEngine(movements) {
    const sorted = effective(movements).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.id).localeCompare(String(b.id)));
    const details = new Map();
    const legacyUsed = new Map();
    const buckets = new Map();
    for (const movement of sorted) {
      const company = companyById(movement.companyId);
      const shareholder = shareholderById(movement.shareholderId);
      const allocation = allocationFor(company, movement.shareholderId);
      if (!company || !shareholder || !allocation) continue;
      const rightKey = `${company.id}|${shareholder.id}`;
      const used = legacyUsed.get(rightKey) ?? 0;
      const legacy = movement.legacy ? Math.min(movement.amount, Math.max(0, allocation.entitlement - used)) : 0;
      const taxable = Math.max(0, movement.amount - legacy);
      legacyUsed.set(rightKey, used + legacy);
      const bucketKey = `${company.id}|${shareholder.id}|${monthKey(movement.date)}`;
      if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
      const detail = { company, shareholder, legacy, taxable, irpf: 0, net: movement.amount };
      buckets.get(bucketKey).push({ movement, detail });
      details.set(movement.id, detail);
    }
    for (const items of buckets.values()) {
      let cumulative = 0;
      let retained = 0;
      for (const item of items) {
        cumulative += item.detail.taxable;
        const required = item.detail.shareholder.type === "PF" && cumulative > TAX_THRESHOLD ? Math.round(cumulative * TAX_RATE) : 0;
        item.detail.irpf = Math.max(0, required - retained);
        item.detail.net = item.movement.amount - item.detail.irpf;
        retained = required;
      }
      const monthTaxable = sum(items, (item) => item.detail.taxable);
      const monthIrpf = items[0]?.detail.shareholder.type === "PF" && monthTaxable > TAX_THRESHOLD ? Math.round(monthTaxable * TAX_RATE) : 0;
      for (const item of items) Object.assign(item.detail, { monthTaxable, monthIrpf, thresholdExceeded: monthTaxable > TAX_THRESHOLD });
    }
    return details;
  }

  function companyStats(movements) {
    const active = effective(movements);
    return DATA.companies.map((company) => {
      const distributed = sum(active.filter((movement) => movement.companyId === company.id), (movement) => movement.amount);
      return { ...company, distributed, balance: company.approved - distributed };
    });
  }

  function shareholderStats(movements) {
    const active = effective(movements);
    return DATA.shareholders.map((shareholder) => {
      const entitlement = sum(DATA.companies, (company) => allocationFor(company, shareholder.id)?.entitlement ?? 0);
      const received = sum(active.filter((movement) => movement.shareholderId === shareholder.id), (movement) => movement.amount);
      return { ...shareholder, entitlement, received, balance: entitlement - received };
    });
  }

  function summary(movements) {
    const companies = companyStats(movements);
    const approved = sum(companies, (company) => company.approved);
    const distributed = sum(companies, (company) => company.distributed);
    const irpf = sum([...taxEngine(movements).values()], (detail) => detail.irpf);
    return { approved, distributed, balance: approved - distributed, irpf, progress: approved ? distributed / approved * 100 : 0 };
  }

  function monthlyCompanies(movements, year = 2026) {
    const details = taxEngine(movements);
    const yearMovements = effective(movements).filter((movement) => String(movement.date).startsWith(`${year}-`));
    return DATA.companies.map((company) => ({
      company,
      rows: company.allocations.map((allocation) => {
        const shareholder = shareholderById(allocation.shareholderId);
        let cumulative = 0;
        const months = MONTHS.map((label, monthIndex) => {
          const related = yearMovements.filter((movement) => movement.companyId === company.id && movement.shareholderId === shareholder.id && Number(String(movement.date).slice(5, 7)) === monthIndex + 1);
          const gross = sum(related, (movement) => movement.amount);
          cumulative += gross;
          return {
            label, gross, balance: allocation.entitlement - cumulative,
            legacy: sum(related, (movement) => details.get(movement.id)?.legacy ?? 0),
            taxable: sum(related, (movement) => details.get(movement.id)?.taxable ?? 0),
            irpf: sum(related, (movement) => details.get(movement.id)?.irpf ?? 0),
            net: sum(related, (movement) => details.get(movement.id)?.net ?? 0),
          };
        });
        return { shareholder, entitlement: allocation.entitlement, percentage: allocation.percentage, months };
      }),
    }));
  }

  function monthlyTotals(movements, year = 2026) {
    const details = taxEngine(movements);
    return MONTHS.map((label, monthIndex) => {
      const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
      const related = effective(movements).filter((movement) => String(movement.date).startsWith(prefix));
      return { label, value: sum(related, (movement) => movement.amount), irpf: sum(related, (movement) => details.get(movement.id)?.irpf ?? 0) };
    });
  }

  function preview(draft, movements, editId = "") {
    const amount = parseMoney(draft.amount);
    const company = companyById(draft.companyId);
    const shareholder = shareholderById(draft.shareholderId);
    if (!company || !shareholder || !allocationFor(company, shareholder.id) || amount <= 0 || !draft.date) return { amount, company, shareholder };
    const base = movements.filter((movement) => movement.id !== editId);
    const pseudo = { id: "__preview__", companyId: company.id, shareholderId: shareholder.id, date: draft.date, amount, legacy: draft.legacy, status: "effective" };
    const after = [...base, pseudo];
    const beforeCompany = companyStats(movements).find((item) => item.id === company.id);
    const afterCompany = companyStats(after).find((item) => item.id === company.id);
    const beforeShareholder = shareholderStats(movements).find((item) => item.id === shareholder.id);
    const afterShareholder = shareholderStats(after).find((item) => item.id === shareholder.id);
    const detail = taxEngine(after).get(pseudo.id);
    return { amount, company, shareholder, beforeCompany, afterCompany, beforeShareholder, afterShareholder, detail, overdraw: afterCompany.balance < 0 || afterShareholder.balance < 0 };
  }

  function parseMoney(value) {
    const normalized = String(value ?? "").trim().replace(/\s/g, "").replace(/R\$/i, "");
    const decimal = normalized.includes(",") ? normalized.replace(/\./g, "").replace(",", ".") : normalized;
    const amount = Number(decimal);
    return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
  }

  function shareholderSnapshot(movements) {
    return {
      shareholders: shareholderStats(movements).map(({ id, name, initials, type, entitlement, received, status }) => ({ id, name, initials, type, entitlement, received, status })),
      months: monthlyTotals(movements).map(({ label, value, irpf }) => ({ label, value, irpf })),
    };
  }

  window.MVP_LEDGER = Object.freeze({ TAX_THRESHOLD, TAX_RATE, MONTHS, taxEngine, companyStats, shareholderStats, summary, monthlyCompanies, monthlyTotals, preview, parseMoney, shareholderSnapshot });
})();
