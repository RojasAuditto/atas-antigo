export const SAO_PAULO_TIME_ZONE = "America/Sao_Paulo";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: SAO_PAULO_TIME_ZONE,
});

const datePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: SAO_PAULO_TIME_ZONE,
});

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(finiteOrZero(value));
}

export function formatCompactCurrency(value: number): string {
  const amount = finiteOrZero(value);
  const absolute = Math.abs(amount);

  if (absolute >= 1_000_000_000) {
    return `R$ ${(amount / 1_000_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} bi`;
  }
  if (absolute >= 1_000_000) {
    return `R$ ${(amount / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  }
  if (absolute >= 1_000) {
    return `R$ ${(amount / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  }
  return formatCurrency(amount);
}

export function formatPercent(value: number): string {
  return `${finiteOrZero(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })}%`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return year !== undefined && month !== undefined && day !== undefined ? `${day}/${month}/${year}` : value;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "—";
  return dateFormatter.format(date);
}

export function dateInSaoPaulo(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";
  const parts = datePartsFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return year !== undefined && month !== undefined && day !== undefined ? `${year}-${month}-${day}` : "";
}

export function normalizeText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function parseMoney(value: string | number): number {
  if (typeof value === "number") return finiteOrZero(value);
  let normalized = value.trim().replace(/R\$/gi, "").replace(/\s/g, "");
  if (normalized === "") return 0;
  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  }
  const parsed = Number(normalized.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMoneyInput(value: string | number): string {
  const digits = String(value).match(/\d/g)?.join("") ?? "";
  if (digits === "") return "";
  return (Number(digits) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
