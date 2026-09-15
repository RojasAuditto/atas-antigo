export const DEFAULT_PAGE_SIZE = 8;
export const PAGE_SIZE_OPTIONS = [6, 8, 10, 12, 16, 20] as const;

export interface PaginationResult<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  start: number;
  end: number;
}

function positiveInteger(value: number, fallback: number): number {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export function paginate<T>(
  items: readonly T[],
  requestedPage = 1,
  requestedPageSize = DEFAULT_PAGE_SIZE,
): PaginationResult<T> {
  const perPage = positiveInteger(requestedPageSize, DEFAULT_PAGE_SIZE);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(positiveInteger(requestedPage, 1), totalPages);
  const offset = (page - 1) * perPage;

  return {
    items: items.slice(offset, offset + perPage),
    page,
    perPage,
    total,
    totalPages,
    start: total > 0 ? offset + 1 : 0,
    end: Math.min(offset + perPage, total),
  };
}
