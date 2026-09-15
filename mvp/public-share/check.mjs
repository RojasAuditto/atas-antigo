import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

async function loadPayload(fileName) {
  const context = vm.createContext({ window: {} });
  const dataSource = await readFile(new URL(fileName, import.meta.url), "utf8");
  const ledgerSource = await readFile(new URL("./ledger.js", import.meta.url), "utf8");
  const uiSource = await readFile(new URL("./ui.js", import.meta.url), "utf8");
  new vm.Script(dataSource, { filename: fileName }).runInContext(context);
  new vm.Script(ledgerSource, { filename: "ledger.js" }).runInContext(context);
  new vm.Script(uiSource, { filename: "ui.js" }).runInContext(context);
  return { data: context.window.MVP_DATA, ledger: context.window.MVP_LEDGER, ui: context.window.MVP_UI };
}

const full = await loadPayload("./data.js");
const partners = await loadPayload("./shareholders-data.js");
const baseState = { expiryDays: 15, publicTab: "summary", theme: "light", movements: [] };
const groupState = { ...baseState, shareScope: "group", movements: full.data.movements };
const groupMarkup = full.ui.renderPublic(groupState);
const partnerMarkup = partners.ui.renderPublic({ ...baseState, shareScope: "shareholders", shareholderSnapshot: null });
const monthlyMarkup = full.ui.renderPublic({ ...groupState, publicTab: "monthly" });
const adminMarkup = full.ui.renderAdmin({ ...groupState, adminTab: "movements", mobileMenuOpen: false });
const draft = { companyId: "iris", shareholderId: "caio", amount: "60.000,00", date: "2026-09-01", eventType: "Pagamento", method: "PIX", legacy: false, note: "", confirmOverdraw: false };
const movementModalMarkup = full.ui.renderShareModal({ ...groupState, modalOpen: false, movementModalOpen: true, reverseModalOpen: false, movementDraft: draft, editingMovementId: "", movementError: "" });
const approved = full.data.companies.reduce((total, company) => total + company.approved, 0);
const entitlements = full.data.shareholders.reduce((total, shareholder) => total + shareholder.entitlement, 0);
const distributed = full.data.companies.reduce((total, company) => total + company.distributed, 0);
const received = full.data.shareholders.reduce((total, shareholder) => total + shareholder.received, 0);
const partnerReceived = partners.data.shareholders.reduce((total, shareholder) => total + shareholder.received, 0);
const partnerMonthly = partners.data.months.reduce((total, month) => total + month.value, 0);

assert.equal(full.data.payloadScope, "admin");
assert.equal(partners.data.payloadScope, "shareholders");
assert.equal(partners.data.companies.length, 0, "O payload de sócios não pode carregar empresas.");
assert.equal(approved, entitlements, "Direitos dos sócios devem fechar com o total aprovado.");
assert.equal(distributed, received, "Recebimentos devem fechar com o total distribuído.");
assert.equal(partnerReceived, partnerMonthly, "Recebimentos mensais devem fechar no recorte de sócios.");
assert.match(groupMarkup, /data-tab="companies"/);
assert.match(groupMarkup, /data-tab="shareholders"/);
assert.match(groupMarkup, /data-tab="monthly"/);
assert.match(monthlyMarkup, /Aurora Alimentos/);
assert.match(monthlyMarkup, /Ana Vale/);
assert.match(monthlyMarkup, /IRRF estimado/);
assert.match(monthlyMarkup, /R\$ 26\.000,00/);
assert.match(monthlyMarkup, /29,44%<\/strong> disponível na ata/);
assert.match(monthlyMarkup, /Saldo negativo \+ IRRF/);
assert.match(monthlyMarkup, />Saldo negativo</);
assert.doesNotMatch(monthlyMarkup, /monthly-scroll|monthly-table/);
assert.match(adminMarkup, /Novo lançamento/);
assert.match(adminMarkup, /Livro de movimentações/);
assert.match(movementModalMarkup, /IRRF incremental estimado: R\$ 6\.000,00/);
assert.match(movementModalMarkup, /Base tributável/i);
assert.doesNotMatch(partnerMarkup, /role="tablist"/);
assert.match(partnerMarkup, /Recebimentos mensais/);

for (const company of full.data.companies) {
  assert.equal(company.allocations.reduce((total, allocation) => total + allocation.entitlement, 0), company.approved, `O rateio de ${company.name} deve fechar com a ata.`);
  assert.ok(Math.abs(company.allocations.reduce((total, allocation) => total + allocation.percentage, 0) - 100) < 0.01, `Os percentuais de ${company.name} devem fechar 100%.`);
  assert.equal(full.data.movements.filter((movement) => movement.companyId === company.id && movement.status === "effective").reduce((total, movement) => total + movement.amount, 0), company.distributed, `Os lançamentos de ${company.name} devem fechar com o distribuído.`);
  assert.match(groupMarkup, new RegExp(company.name));
  assert.doesNotMatch(partnerMarkup, new RegExp(company.name));
  assert.doesNotMatch(partnerMarkup, new RegExp(company.code));
}

for (const shareholder of partners.data.shareholders) {
  assert.match(partnerMarkup, new RegExp(shareholder.name));
  assert.equal("taxId" in shareholder, false);
  assert.equal("companyId" in shareholder, false);
  assert.equal("companyCount" in shareholder, false);
}

const tax = full.ledger.taxEngine(full.data.movements);
assert.equal(tax.get("mov-05").taxable, 50000, "Exatamente R$ 50 mil deve permanecer sem retenção.");
assert.equal(tax.get("mov-05").irpf, 0, "Exatamente R$ 50 mil não aciona IRPF.");
assert.equal(tax.get("mov-07").irpf, 25000, "Acima do limite, 10% incide sobre o total tributável mensal.");
assert.equal(tax.get("mov-15").irpf, 12500, "Pagamentos do mesmo mês devem ser acumulados por empresa e sócio.");
assert.equal(tax.get("mov-21").irpf, 0, "O exemplo negativo sem retenção deve permanecer sem IRRF.");
assert.equal(tax.get("mov-22").irpf, 26000, "O exemplo negativo tributável deve calcular o IRRF.");
assert.equal(full.ledger.monthlyCompanies(full.data.movements)[0].rows.find((row) => row.shareholder.id === "lia").months[8].balance, -20000);
assert.equal(full.ledger.monthlyCompanies(full.data.movements)[1].rows.find((row) => row.shareholder.id === "caio").months[8].balance, -60000);
assert.equal(full.ledger.summary(full.data.movements).irpf, 152000, "O IRRF total demonstrativo deve fechar.");
assert.equal(full.ledger.monthlyTotals(full.data.movements).reduce((total, month) => total + month.value, 0), distributed);
assert.equal(full.ledger.preview(draft, full.data.movements).detail.irpf, 6000, "Novo lançamento deve recalcular a retenção da competência.");
const snapshot = full.ledger.shareholderSnapshot(full.data.movements);
assert.equal(snapshot.shareholders.some((shareholder) => "companyId" in shareholder || "companies" in shareholder), false);

process.stdout.write("MVP checks: passed (monthly partners, percentages, negative balances, IRRF and isolated payload)\n");
