import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  className?: string;
}

const DEFAULT_PAGE_SIZES = [8, 12, 20] as const;

export function Pagination({
  className,
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  total,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(totalPages, Math.max(1, page));
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(total, safePage * pageSize);

  return (
    <nav
      aria-label="Paginação"
      className={cn(
        "mt-4 flex flex-col gap-3 border-t border-border/80 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <span>
        Mostrando <strong className="text-foreground">{start}–{end}</strong> de{" "}
        <strong className="text-foreground">{total}</strong>
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange && (
          <label className="mr-1 flex items-center gap-2">
            Por página
            <select
              aria-label="Itens por página"
              className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              value={pageSize}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        )}
        <Button
          aria-label="Primeira página"
          disabled={safePage === 1}
          onClick={() => onPageChange(1)}
          size="icon"
          variant="ghost"
        >
          <ChevronsLeft className="h-4 w-4" strokeWidth={1.75} />
        </Button>
        <Button
          disabled={safePage === 1}
          onClick={() => onPageChange(safePage - 1)}
          size="sm"
          variant="ghost"
        >
          Anterior
        </Button>
        <span className="px-1 tabular-nums">
          <strong className="text-foreground">{safePage}</strong> / {totalPages}
        </span>
        <Button
          disabled={safePage === totalPages}
          onClick={() => onPageChange(safePage + 1)}
          size="sm"
          variant="ghost"
        >
          Próxima
        </Button>
        <Button
          aria-label="Última página"
          disabled={safePage === totalPages}
          onClick={() => onPageChange(totalPages)}
          size="icon"
          variant="ghost"
        >
          <ChevronsRight className="h-4 w-4" strokeWidth={1.75} />
        </Button>
      </div>
    </nav>
  );
}
