(() => {
  "use strict";

  const DATA = window.MVP_DATA;
  const LEDGER = window.MVP_LEDGER;
  const sum = (items, selector) => items.reduce((total, item) => total + selector(item), 0);

  function partnerModels(movements = DATA.movements) {
    const companies = LEDGER.monthlyCompanies(movements);
    return DATA.shareholders.map((shareholder) => {
      const sources = companies.flatMap(({ company, rows }) => {
        const row = rows.find((item) => item.shareholder.id === shareholder.id);
        return row ? [{ company, ...row }] : [];
      });
      const months = LEDGER.MONTHS.map((label, monthIndex) => {
        const monthSources = sources.map((source) => ({
          company: source.company,
          entitlement: source.entitlement,
          percentage: source.percentage,
          ...source.months[monthIndex],
        }));
        return {
          label,
          gross: sum(monthSources, (item) => item.gross),
          taxable: sum(monthSources, (item) => item.taxable),
          irpf: sum(monthSources, (item) => item.irpf),
          net: sum(monthSources, (item) => item.net),
          balance: sum(monthSources, (item) => item.balance),
          negativeSources: monthSources.filter((item) => item.balance < 0).length,
          activeCompanies: monthSources.filter((item) => item.gross > 0).length,
          sources: monthSources.sort((a, b) => Number(a.balance >= 0) - Number(b.balance >= 0)),
        };
      });
      return {
        shareholder,
        entitlement: sum(sources, (item) => item.entitlement),
        received: sum(months, (item) => item.gross),
        irpf: sum(months, (item) => item.irpf),
        balance: months.at(-1)?.balance ?? 0,
        companyCount: sources.length,
        riskMonths: months.filter((item) => item.negativeSources > 0).length,
        months,
      };
    });
  }

  function overview(partners) {
    return {
      partners: partners.length,
      entitlement: sum(partners, (item) => item.entitlement),
      received: sum(partners, (item) => item.received),
      irpf: sum(partners, (item) => item.irpf),
      riskPartners: partners.filter((item) => item.riskMonths > 0).length,
    };
  }

  window.MVP_V2_MODEL = Object.freeze({ partnerModels, overview });
})();
