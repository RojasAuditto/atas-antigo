import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const context = vm.createContext({ window: {} });
for (const file of ["../public-share/data.js", "../public-share/ledger.js", "./model.js"]) {
  const source = await readFile(new URL(file, import.meta.url), "utf8");
  new vm.Script(source, { filename: file }).runInContext(context);
}

const { MVP_DATA: data, MVP_LEDGER: ledger, MVP_V2_MODEL: model } = context.window;
const partners = model.partnerModels();
const overview = model.overview(partners);
const partner = (id) => partners.find((item) => item.shareholder.id === id);
const month = (id, index) => partner(id).months[index];
const source = (id, index, companyId) => month(id, index).sources.find((item) => item.company.id === companyId);

assert.equal(partners.length, 4, "Todos os sócios devem aparecer.");
assert.ok(partners.every((item) => item.months.length === 12), "Cada sócio deve ter janeiro a dezembro.");
assert.equal(overview.partners, data.shareholders.length);
assert.equal(overview.entitlement, data.companies.reduce((total, company) => total + company.approved, 0));
assert.equal(overview.received, data.movements.filter((item) => item.status === "effective").reduce((total, item) => total + item.amount, 0));
assert.equal(overview.irpf, ledger.summary(data.movements).irpf);

for (const item of partners) {
  const canonical = ledger.shareholderStats(data.movements).find((row) => row.id === item.shareholder.id);
  assert.equal(item.entitlement, canonical.entitlement, `Direito consolidado de ${item.shareholder.name}.`);
  assert.equal(item.received, canonical.received, `Recebido consolidado de ${item.shareholder.name}.`);
  assert.equal(item.balance, canonical.balance, `Saldo consolidado de ${item.shareholder.name}.`);
}

assert.equal(month("lia", 8).gross, 390000, "Lia deve mostrar o movimento de setembro.");
assert.equal(month("lia", 8).negativeSources, 1, "Lia deve alertar a empresa negativa.");
assert.equal(month("lia", 8).irpf, 0, "O caso negativo de Lia não deve ter retenção.");
assert.equal(source("lia", 8, "aurora").balance, -20000);
assert.equal(source("lia", 8, "aurora").entitlement, 730000);
assert.equal(source("lia", 8, "aurora").percentage, 29.44);

assert.equal(month("caio", 8).gross, 260000, "Caio deve mostrar o movimento de setembro.");
assert.equal(month("caio", 8).negativeSources, 1, "Caio deve alertar a empresa negativa.");
assert.equal(month("caio", 8).irpf, 26000, "Caio deve mostrar saldo negativo com IRPF.");
assert.equal(source("caio", 8, "iris").balance, -60000);
assert.equal(source("caio", 8, "iris").percentage, 27.78);

process.stdout.write("MVP V2 checks: passed (12 months, partner totals, company rights, negative sources and IRPF)\n");
