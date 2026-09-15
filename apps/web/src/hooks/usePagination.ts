import { useEffect, useState } from "react";
import { DEFAULT_PAGE_SIZE, paginate } from "@/domain/pagination";

export function usePagination<T>(items: readonly T[], resetKey: string) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => setPage(1), [resetKey]);

  const pagination = paginate(items, page, pageSize);

  function setPageSize(nextPageSize: number) {
    setPageSizeState(nextPageSize);
    setPage(1);
  }

  return { ...pagination, setPage, setPageSize };
}
