import { Search, X } from "lucide-react";
import {
  FilterPills,
  type FilterPillOption,
} from "@/components/hub/FilterPills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type DistributionFilter =
  | "all"
  | "not_started"
  | "in_progress"
  | "completed"
  | "attention";

interface DataFiltersProps {
  status: DistributionFilter;
  statusOptions: readonly FilterPillOption<DistributionFilter>[];
  search: string;
  exercise: string;
  exercises: readonly string[];
  onStatusChange: (value: DistributionFilter) => void;
  onSearchChange: (value: string) => void;
  onExerciseChange: (value: string) => void;
  onClear: () => void;
}

export function DataFilters({
  exercise,
  exercises,
  onClear,
  onExerciseChange,
  onSearchChange,
  onStatusChange,
  search,
  status,
  statusOptions,
}: DataFiltersProps) {
  return (
    <section aria-label="Filtros" className="mb-6 flex flex-wrap items-center gap-2">
      <FilterPills
        ariaLabel="Situação da distribuição"
        onChange={onStatusChange}
        options={statusOptions}
        value={status}
      />
      <label className="relative min-w-[240px] flex-1">
        <span className="sr-only">Buscar</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
        />
        <Input
          className="pl-9"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar grupo, empresa, documento ou sócio..."
          value={search}
        />
      </label>
      <label>
        <span className="sr-only">Exercício</span>
        <select
          className="h-10 min-w-[148px] rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onChange={(event) => onExerciseChange(event.target.value)}
          value={exercise}
        >
          <option value="all">Todos os exercícios</option>
          {exercises.map((year) => (
            <option key={year} value={year}>Exercício {year}</option>
          ))}
        </select>
      </label>
      <Button onClick={onClear} size="sm" variant="outline">
        <X className="h-4 w-4" strokeWidth={1.75} />
        Limpar
      </Button>
    </section>
  );
}
