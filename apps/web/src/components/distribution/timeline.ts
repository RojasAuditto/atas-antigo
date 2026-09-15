import { formatCurrency, formatDate } from "@/domain/format";
import type { Movement } from "@/domain/schemas";
import type { TimelineEvent } from "@/components/hub/ProgressTimeline";

export function buildTimelineEvents(
  movements: readonly Movement[],
  total: number,
): TimelineEvent[] {
  let cumulative = 0;
  return movements
    .filter((movement) => movement.status === "effective")
    .toSorted((left, right) => left.date.localeCompare(right.date))
    .map((movement) => {
      cumulative += movement.amount;
      return {
        id: movement.id,
        label: `${formatDate(movement.date)} · ${formatCurrency(movement.amount)}`,
        position: total > 0 ? (cumulative / total) * 100 : 0,
      };
    });
}
