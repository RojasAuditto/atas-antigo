import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from "react";
import { AlertTriangle, FileUp, Landmark } from "lucide-react";
import { toast } from "sonner";
import { shareholderKey, originIssue } from "@/domain/aggregations";
import { dateInSaoPaulo, formatMoneyInput, parseMoney } from "@/domain/format";
import type { MovementPosition } from "@/domain/movements";
import type { MovementDraft, PaymentMethod } from "@/domain/schemas";
import { useDistribution } from "@/contexts/DistributionContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MovementImpactPreview } from "./MovementImpactPreview";

const PAYMENT_METHODS: readonly PaymentMethod[] = [
  "TED",
  "PIX",
  "Transferência interna",
  "Outro",
];

interface FormState {
  groupName: string;
  originId: string;
  shareholderKey: string;
  amount: string;
  date: string;
  paymentMethod: PaymentMethod;
  reference: string;
  proofName: string;
  note: string;
}

function emptyForm(originId = "", shareholderTaxId?: string | null): FormState {
  return {
    groupName: "",
    originId,
    shareholderKey: shareholderTaxId ?? "",
    amount: "",
    date: dateInSaoPaulo(new Date()),
    paymentMethod: "TED",
    reference: "",
    proofName: "",
    note: "",
  };
}

export function MovementDialog() {
  const {
    catalog,
    closeMovementDialog,
    dialogOpen,
    dialogPrefill,
    previewMovement,
    registerMovement,
  } = useDistribution();
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<MovementPosition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!dialogOpen) return;
    const next = emptyForm(dialogPrefill.originId, dialogPrefill.shareholderTaxId);
    const origin = catalog?.origins.find((candidate) => candidate.id === next.originId);
    setForm({
      ...next,
      groupName: origin?.groupName ?? "",
      shareholderKey:
        origin?.shareholders.find((item) => item.taxId === dialogPrefill.shareholderTaxId)
          ? dialogPrefill.shareholderTaxId ?? ""
          : "",
    });
    setError(null);
    setPosition(null);
  }, [catalog, dialogOpen, dialogPrefill]);

  const groups = useMemo(
    () => [...new Set(catalog?.origins.map((origin) => origin.groupName) ?? [])].sort(),
    [catalog],
  );
  const companies = useMemo(
    () =>
      (catalog?.origins ?? [])
        .filter((origin) => form.groupName === "" || origin.groupName === form.groupName)
        .sort((left, right) => left.companyName.localeCompare(right.companyName, "pt-BR")),
    [catalog, form.groupName],
  );
  const origin = catalog?.origins.find((candidate) => candidate.id === form.originId);
  const shareholders = [...(origin?.shareholders ?? [])].sort((left, right) =>
    left.name.localeCompare(right.name, "pt-BR"),
  );
  const shareholder = shareholders.find((item) => shareholderKey(item) === form.shareholderKey);
  const draft = useMemo<MovementDraft>(() => ({
    originId: form.originId,
    shareholderTaxId: shareholder?.taxId ?? null,
    shareholderName: shareholder?.name ?? "",
    amount: parseMoney(form.amount),
    date: form.date,
    paymentMethod: form.paymentMethod,
    reference: form.reference,
    proofName: form.proofName,
    note: form.note,
  }), [form, shareholder]);

  useEffect(() => {
    if (!dialogOpen || draft.originId === "" || draft.shareholderName === "" || draft.amount <= 0) {
      setPosition(null);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      previewMovement(draft, controller.signal)
        .then(setPosition)
        .catch(() => {
          if (!controller.signal.aborted) setPosition(null);
        });
    }, 150);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [dialogOpen, draft, previewMovement]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function onGroupChange(groupName: string) {
    setForm((current) => ({ ...current, groupName, originId: "", shareholderKey: "" }));
    setError(null);
  }

  function onOriginChange(originId: string) {
    const selected = catalog?.origins.find((candidate) => candidate.id === originId);
    setForm((current) => ({
      ...current,
      originId,
      groupName: selected?.groupName ?? current.groupName,
      shareholderKey: "",
    }));
    setError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await registerMovement(draft);
      if (!result.ok) return setError(result.message);
      closeMovementDialog();
      toast.success("Distribuição registrada com sucesso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function onFile(file: File | undefined) {
    if (file) update("proofName", file.name);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    onFile(event.dataTransfer.files[0]);
  }

  return (
    <Dialog onOpenChange={(open) => !open && closeMovementDialog()} open={dialogOpen}>
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-5 py-4 pr-12">
          <DialogTitle>Registrar distribuição</DialogTitle>
          <DialogDescription>
            Selecione a origem e acompanhe o impacto nos três saldos em tempo real.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]">
            <section className="rounded-2xl border border-border/70 bg-card p-4">
              <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Origem da distribuição
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="block text-sm font-medium leading-none">Grupo</span>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onChange={(event) => onGroupChange(event.target.value)}
                    value={form.groupName}
                  >
                    <option value="">Todos os grupos</option>
                    {groups.map((group) => <option key={group} value={group}>{group}</option>)}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="block text-sm font-medium leading-none">Empresa de origem</span>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onChange={(event) => onOriginChange(event.target.value)}
                    required
                    value={form.originId}
                  >
                    <option value="">Selecione uma empresa</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.companyName} · {company.companyTaxId}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="block text-sm font-medium leading-none">Sócio favorecido</span>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    disabled={!origin}
                    onChange={(event) => update("shareholderKey", event.target.value)}
                    required
                    value={form.shareholderKey}
                  >
                    <option value="">Selecione um sócio</option>
                    {shareholders.map((item) => (
                      <option key={shareholderKey(item)} value={shareholderKey(item)}>
                        {item.name} · {item.type} · {item.taxId ?? "sem documento"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <Label htmlFor="movement-amount">Valor da distribuição</Label>
                  <Input
                    autoFocus
                    id="movement-amount"
                    inputMode="numeric"
                    onChange={(event) => update("amount", formatMoneyInput(event.target.value))}
                    placeholder="0,00"
                    required
                    value={form.amount}
                  />
                </label>
                <label className="space-y-1.5">
                  <Label htmlFor="movement-date">Data efetiva</Label>
                  <Input
                    id="movement-date"
                    onChange={(event) => update("date", event.target.value)}
                    required
                    type="date"
                    value={form.date}
                  />
                </label>
                <label className="space-y-1.5">
                  <Label htmlFor="movement-method">Forma de pagamento</Label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    id="movement-method"
                    onChange={(event) => update("paymentMethod", event.target.value as PaymentMethod)}
                    value={form.paymentMethod}
                  >
                    {PAYMENT_METHODS.map((method) => <option key={method}>{method}</option>)}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <Label htmlFor="movement-reference">Referência</Label>
                  <Input
                    id="movement-reference"
                    onChange={(event) => update("reference", event.target.value)}
                    placeholder="Ex.: lote, ata ou protocolo"
                    value={form.reference}
                  />
                </label>
                <label
                  className="flex min-h-24 cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.035] p-4 transition-colors hover:bg-primary/[0.065] md:col-span-2"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={onDrop}
                >
                  <FileUp className="h-7 w-7 shrink-0 text-primary" strokeWidth={1.75} />
                  <span className="min-w-0">
                    <strong className="block truncate text-sm">
                      {form.proofName || "Selecione ou arraste o comprovante"}
                    </strong>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Apenas o nome do PDF ou imagem é enviado ao backend; o arquivo não é armazenado.
                    </span>
                  </span>
                  <input
                    accept="image/*,.pdf"
                    className="sr-only"
                    onChange={(event) => onFile(event.target.files?.[0])}
                    type="file"
                  />
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="movement-note">Observação</Label>
                  <textarea
                    className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    id="movement-note"
                    onChange={(event) => update("note", event.target.value)}
                    placeholder="Contexto operacional da distribuição..."
                    value={form.note}
                  />
                </label>
              </div>
              {origin && originIssue(origin) && (
                <div className="mt-4 flex gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning-ink">
                  <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  Esta origem possui divergência entre valor disponível e direitos alocados. Revise a base antes de concluir.
                </div>
              )}
              {error && <p aria-live="polite" className="mt-4 text-sm text-destructive-ink">{error}</p>}
            </section>
            <section aria-label="Impacto projetado">
              <MovementImpactPreview position={position} />
            </section>
          </div>
          <DialogFooter className="border-t border-border px-5 py-4">
            <Button onClick={closeMovementDialog} variant="outline">Cancelar</Button>
            <Button disabled={isSubmitting} type="submit" variant="premium">
              <Landmark className="h-4 w-4" strokeWidth={1.75} />
              {isSubmitting ? "Registrando..." : "Registrar distribuição"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
