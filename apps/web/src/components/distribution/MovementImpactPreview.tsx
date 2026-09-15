import { TrendingDown } from "lucide-react";
import { formatCurrency, formatPercent } from "@/domain/format";
import type { MovementPosition } from "@/domain/movements";
import { cn } from "@/lib/cn";

interface ImpactCardProps {
  title: string;
  name: string;
  before: number;
  amount: number;
  after: number;
  percent: number;
}

function ImpactCard({ after, amount, before, name, percent, title }: ImpactCardProps) {
  const negative = after < 0;
  return (
    <article className={cn("rounded-2xl border p-3", negative ? "border-destructive/30 bg-destructive/5" : "border-border/70 bg-card")}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{title}</span>
        <strong className="max-w-[65%] truncate text-right text-xs">{name}</strong>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
        <div className="rounded-md bg-primary/[0.08] p-2 text-info-ink dark:text-primary"><span className="block opacity-75">Saldo atual</span><strong className="mt-1 block text-xs tabular-nums">{formatCurrency(before)}</strong></div>
        <div className="rounded-md bg-destructive/[0.08] p-2 text-destructive-ink"><span className="block opacity-75">Saída</span><strong className="mt-1 block text-xs tabular-nums">− {formatCurrency(amount)}</strong></div>
        <div className="rounded-md bg-success/10 p-2 text-success-ink"><span className="block opacity-75">Projetado</span><strong className="mt-1 block text-xs tabular-nums">{formatCurrency(after)}</strong></div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", negative ? "bg-destructive" : "bg-hub-indigo")} style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">{formatPercent(percent)} do saldo atual</p>
    </article>
  );
}

export function MovementImpactPreview({ position }: { position: MovementPosition | null }) {
  if (position === null) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <div>
          <TrendingDown className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.75} />
          <h3 className="mt-3 text-sm font-semibold">Impacto no saldo</h3>
          <p className="mt-1 text-xs text-muted-foreground">Selecione a origem, o sócio e informe o valor para ver a projeção.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-primary/15 bg-primary/[0.035] p-4">
      <div className="flex items-start justify-between gap-3">
        <div><h3 className="text-sm font-semibold">Leitura da movimentação</h3><p className="mt-1 text-xs text-muted-foreground">Atualização instantânea do saldo projetado.</p></div>
        <strong className="rounded-md bg-primary/10 px-3 py-2 text-base text-info-ink tabular-nums dark:text-primary">{formatCurrency(position.amount)}</strong>
      </div>
      <ImpactCard after={position.afterGroup} amount={position.amount} before={position.groupBalance} name={position.origin.groupName} percent={position.groupPercentOfBalance} title="Grupo" />
      <ImpactCard after={position.afterCompany} amount={position.amount} before={position.companyBalance} name={position.origin.companyName} percent={position.companyPercentOfBalance} title="Empresa" />
      <ImpactCard after={position.afterShareholder} amount={position.amount} before={position.shareholderBalance} name={position.shareholder.name} percent={position.shareholderPercentOfBalance} title="Sócio" />
    </div>
  );
}
