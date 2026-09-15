import { normalizeText } from "./format";
import {
  distributedForOrigin,
  distributedForShareholder,
  type EffectiveMovement,
} from "./movements";
import type { Movement, Origin, Shareholder } from "./schemas";

export const ORIGIN_AMOUNT_TOLERANCE = 1;
export const ALLOCATION_PERCENT_TOLERANCE = 0.1;
export const STATUS_MONEY_TOLERANCE = 0.005;

export type DistributionStatusKey = "not_started" | "in_progress" | "completed";
export type DistributionStatusTone = "neutral" | "blue" | "emerald";
export type StatusFilter = DistributionStatusKey | "attention" | "all";

export interface DistributionStatus {
  key: DistributionStatusKey;
  label: "Não iniciada" | "Em andamento" | "Concluída";
  tone: DistributionStatusTone;
}

export interface GroupCompany {
  taxId: string;
  name: string;
}

export interface GroupSummary {
  name: string;
  origins: readonly Origin[];
  companies: readonly GroupCompany[];
  shareholders: readonly Shareholder[];
  available: number;
  distributed: number;
  balance: number;
  progress: number;
  companyCount: number;
  shareholderCount: number;
  issues: number;
  deadline: string;
}

export type CompanySummary = Origin & {
  distributed: number;
  balance: number;
  progress: number;
  issue: boolean;
};

export interface ShareholderPosition {
  origin: Origin;
  shareholder: Shareholder;
  distributed: number;
  balance: number;
}

export interface ShareholderSummary {
  key: string;
  taxId: string | null;
  name: string;
  type: Shareholder["type"];
  companies: readonly string[];
  groups: readonly string[];
  entitlement: number;
  distributed: number;
  balance: number;
  progress: number;
  companyCount: number;
  groupCount: number;
  issues: number;
  rows: readonly ShareholderPosition[];
}

export interface SummaryFilters {
  query?: string;
  status?: StatusFilter;
}

export function shareholderKey(shareholder: Pick<Shareholder, "name" | "taxId">): string {
  return shareholder.taxId ?? normalizeText(shareholder.name);
}

export function originIssue(origin: Origin): boolean {
  const amountDifference = Math.abs(origin.availableAmount - origin.allocatedAmount);
  const percentDifference = Math.abs(origin.allocationPercent - 100);
  return amountDifference > ORIGIN_AMOUNT_TOLERANCE
    || percentDifference > ALLOCATION_PERCENT_TOLERANCE;
}

export function distributionStatus(distributed: number, balance: number): DistributionStatus {
  if (distributed <= STATUS_MONEY_TOLERANCE) {
    return { key: "not_started", label: "Não iniciada", tone: "neutral" };
  }
  if (balance <= STATUS_MONEY_TOLERANCE) {
    return { key: "completed", label: "Concluída", tone: "emerald" };
  }
  return { key: "in_progress", label: "Em andamento", tone: "blue" };
}

export function filterOriginsByExercise(
  origins: readonly Origin[],
  exercise: string | "all",
): Origin[] {
  return exercise === "all" ? [...origins] : origins.filter((origin) => origin.exercise === exercise);
}

export function aggregateGroups(
  origins: readonly Origin[],
  movements: readonly Movement[],
): GroupSummary[] {
  const groups = new Map<string, {
    name: string;
    origins: Origin[];
    companies: Map<string, string>;
    shareholders: Map<string, Shareholder>;
    available: number;
    distributed: number;
    issues: number;
    deadline: string;
  }>();

  for (const origin of origins) {
    const current = groups.get(origin.groupName) ?? {
      name: origin.groupName,
      origins: [],
      companies: new Map<string, string>(),
      shareholders: new Map<string, Shareholder>(),
      available: 0,
      distributed: 0,
      issues: 0,
      deadline: origin.deadline,
    };

    current.origins.push(origin);
    current.companies.set(origin.companyTaxId, origin.companyName);
    for (const shareholder of origin.shareholders) {
      const key = shareholderKey(shareholder);
      if (!current.shareholders.has(key)) current.shareholders.set(key, shareholder);
    }
    current.available += origin.availableAmount;
    current.distributed += distributedForOrigin(movements, origin.id);
    if (originIssue(origin)) current.issues += 1;
    groups.set(origin.groupName, current);
  }

  return [...groups.values()].map((group) => {
    const balance = group.available - group.distributed;
    return {
      name: group.name,
      origins: group.origins,
      companies: [...group.companies].map(([taxId, name]) => ({ taxId, name })),
      shareholders: [...group.shareholders.values()],
      available: group.available,
      distributed: group.distributed,
      balance,
      progress: group.available > 0 ? (group.distributed / group.available) * 100 : 0,
      companyCount: group.companies.size,
      shareholderCount: group.shareholders.size,
      issues: group.issues,
      deadline: group.deadline,
    };
  });
}

export function aggregateCompanies(
  origins: readonly Origin[],
  movements: readonly Movement[],
): CompanySummary[] {
  return origins.map((origin) => {
    const distributed = distributedForOrigin(movements, origin.id);
    const balance = origin.availableAmount - distributed;
    return {
      ...origin,
      distributed,
      balance,
      progress: origin.availableAmount > 0 ? (distributed / origin.availableAmount) * 100 : 0,
      issue: originIssue(origin),
    };
  });
}

export function aggregateShareholders(
  origins: readonly Origin[],
  movements: readonly Movement[],
  groupName: string | null = null,
): ShareholderSummary[] {
  const summaries = new Map<string, {
    key: string;
    taxId: string | null;
    name: string;
    type: Shareholder["type"];
    companies: Set<string>;
    groups: Set<string>;
    entitlement: number;
    distributed: number;
    issueOrigins: Set<string>;
    rows: ShareholderPosition[];
  }>();

  for (const origin of origins) {
    if (groupName !== null && origin.groupName !== groupName) continue;
    for (const shareholder of origin.shareholders) {
      const key = shareholderKey(shareholder);
      const current = summaries.get(key) ?? {
        key,
        taxId: shareholder.taxId,
        name: shareholder.name,
        type: shareholder.type,
        companies: new Set<string>(),
        groups: new Set<string>(),
        entitlement: 0,
        distributed: 0,
        issueOrigins: new Set<string>(),
        rows: [],
      };
      const distributed = distributedForShareholder(movements, origin.id, shareholder);
      current.companies.add(origin.companyTaxId);
      current.groups.add(origin.groupName);
      current.entitlement += shareholder.entitlement;
      current.distributed += distributed;
      if (originIssue(origin)) current.issueOrigins.add(origin.id);
      current.rows.push({
        origin,
        shareholder,
        distributed,
        balance: shareholder.entitlement - distributed,
      });
      summaries.set(key, current);
    }
  }

  return [...summaries.values()].map((summary) => {
    const balance = summary.entitlement - summary.distributed;
    return {
      key: summary.key,
      taxId: summary.taxId,
      name: summary.name,
      type: summary.type,
      companies: [...summary.companies],
      groups: [...summary.groups],
      entitlement: summary.entitlement,
      distributed: summary.distributed,
      balance,
      progress: summary.entitlement > 0 ? (summary.distributed / summary.entitlement) * 100 : 0,
      companyCount: summary.companies.size,
      groupCount: summary.groups.size,
      issues: summary.issueOrigins.size,
      rows: summary.rows,
    };
  });
}

function matchesStatus(
  distributed: number,
  balance: number,
  issues: number,
  status: StatusFilter,
): boolean {
  if (status === "all") return true;
  if (status === "attention") return issues > 0;
  return distributionStatus(distributed, balance).key === status;
}

export function filterGroups(
  groups: readonly GroupSummary[],
  filters: SummaryFilters = {},
): GroupSummary[] {
  const query = normalizeText(filters.query ?? "");
  const status = filters.status ?? "all";
  return groups
    .filter((group) => {
      const searchable = normalizeText([
        group.name,
        ...group.companies.flatMap((company) => [company.name, company.taxId]),
        ...group.shareholders.flatMap((shareholder) => [shareholder.name, shareholder.taxId ?? ""]),
      ].join(" "));
      return (query === "" || searchable.includes(query))
        && matchesStatus(group.distributed, group.balance, group.issues, status);
    })
    .sort((left, right) => right.balance - left.balance);
}

export function filterCompanies(
  companies: readonly CompanySummary[],
  filters: SummaryFilters = {},
): CompanySummary[] {
  const query = normalizeText(filters.query ?? "");
  const status = filters.status ?? "all";
  return companies
    .filter((company) => {
      const searchable = normalizeText([
        company.companyName,
        company.companyTaxId,
        company.groupName,
        ...company.shareholders.flatMap((shareholder) => [shareholder.name, shareholder.taxId ?? ""]),
      ].join(" "));
      return (query === "" || searchable.includes(query))
        && matchesStatus(company.distributed, company.balance, company.issue ? 1 : 0, status);
    })
    .sort((left, right) => right.balance - left.balance);
}

export function filterShareholders(
  shareholders: readonly ShareholderSummary[],
  filters: SummaryFilters = {},
): ShareholderSummary[] {
  const query = normalizeText(filters.query ?? "");
  const status = filters.status ?? "all";
  return shareholders
    .filter((shareholder) => {
      const searchable = normalizeText([
        shareholder.name,
        shareholder.taxId ?? "",
        ...shareholder.groups,
      ].join(" "));
      return (query === "" || searchable.includes(query))
        && matchesStatus(shareholder.distributed, shareholder.balance, shareholder.issues, status);
    })
    .sort((left, right) => right.balance - left.balance);
}

export function movementsForShareholder(
  summary: ShareholderSummary,
  movements: readonly Movement[],
): EffectiveMovement[] {
  const originIds = new Set(summary.rows.map((row) => row.origin.id));
  return movements.filter((movement): movement is EffectiveMovement => {
    if (movement.status !== "effective" || !originIds.has(movement.originId)) return false;
    if (summary.taxId !== null) return movement.shareholderTaxId === summary.taxId;
    return movement.shareholderTaxId === null
      && normalizeText(movement.shareholderName) === normalizeText(summary.name);
  });
}
