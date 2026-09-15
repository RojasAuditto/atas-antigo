import { aggregateShareholders, originIssue, shareholderKey, type ShareholderSummary } from "./aggregations";
import { effectiveMovements } from "./movements";
import type { Movement, Origin } from "./schemas";

export interface ReportTotals {
  available: number;
  distributed: number;
  balance: number;
  progress: number;
  issues: number;
  groupCount: number;
  companyCount: number;
  shareholderCount: number;
}

export type ReportScope = "all" | "group" | "company" | "shareholder";

export interface ReportSelection {
  scope: ReportScope;
  groupName?: string;
  companyTaxId?: string;
  shareholderKey?: string;
}

export type ReportScopeData =
  | { kind: "all"; origins: readonly Origin[] }
  | { kind: "group"; groupName: string; origins: readonly Origin[] }
  | { kind: "company"; origin: Origin; origins: readonly [Origin] }
  | { kind: "shareholder"; shareholder: ShareholderSummary; origins: readonly Origin[] };

export function reportTotals(
  origins: readonly Origin[],
  movements: readonly Movement[],
): ReportTotals {
  const originIds = new Set(origins.map((origin) => origin.id));
  const distributed = effectiveMovements(movements)
    .filter((movement) => originIds.has(movement.originId))
    .reduce((total, movement) => total + movement.amount, 0);
  const available = origins.reduce((total, origin) => total + origin.availableAmount, 0);
  const shareholders = new Set<string>();
  for (const origin of origins) {
    for (const shareholder of origin.shareholders) shareholders.add(shareholderKey(shareholder));
  }

  return {
    available,
    distributed,
    balance: available - distributed,
    progress: available > 0 ? (distributed / available) * 100 : 0,
    issues: origins.filter(originIssue).length,
    groupCount: new Set(origins.map((origin) => origin.groupName)).size,
    companyCount: origins.length,
    shareholderCount: shareholders.size,
  };
}

export function reportMovements(
  origins: readonly Origin[],
  movements: readonly Movement[],
): Movement[] {
  const originIds = new Set(origins.map((origin) => origin.id));
  return effectiveMovements(movements)
    .filter((movement) => originIds.has(movement.originId))
    .sort(
      (left, right) => left.date.localeCompare(right.date)
        || left.createdAt.localeCompare(right.createdAt),
    );
}

export function resolveReportScope(
  origins: readonly Origin[],
  movements: readonly Movement[],
  selection: ReportSelection,
): ReportScopeData {
  if (selection.scope === "shareholder" && selection.shareholderKey !== undefined) {
    const shareholder = aggregateShareholders(origins, movements)
      .find((summary) => summary.key === selection.shareholderKey);
    if (shareholder !== undefined) {
      return {
        kind: "shareholder",
        shareholder,
        origins: shareholder.rows.map((row) => row.origin),
      };
    }
  }

  if (selection.scope === "company" && selection.companyTaxId !== undefined) {
    const origin = origins.find((candidate) => candidate.companyTaxId === selection.companyTaxId);
    if (origin !== undefined) return { kind: "company", origin, origins: [origin] };
  }

  if (selection.scope === "group" && selection.groupName !== undefined) {
    const groupOrigins = origins.filter((origin) => origin.groupName === selection.groupName);
    if (groupOrigins.length > 0) {
      return { kind: "group", groupName: selection.groupName, origins: groupOrigins };
    }
  }

  return { kind: "all", origins };
}
