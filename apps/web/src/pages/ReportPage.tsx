import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, Download, FileQuestion, FileText, Printer, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  aggregateShareholders,
  type Catalog,
  type Movement,
  type Origin,
  type ReportScope,
  type ReportSelection,
  type ShareholderSummary,
} from "@/domain";
import { SectionCard } from "@/components/distribution/SectionCard";
import { EmptyState } from "@/components/hub/EmptyState";
import { FilterPills, type FilterPillOption } from "@/components/hub/FilterPills";
import { LoadingState } from "@/components/hub/LoadingState";
import { PageHeader } from "@/components/hub/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDistribution } from "@/contexts/DistributionContext";
import { createEntityRouteId } from "@/lib/entity-id";
import { buildReportDocument, type ReportDocument } from "@/lib/report/reportDocument";

const scopeSchema = z.enum(["all", "group", "company", "shareholder"]);
const SCOPE_OPTIONS: readonly FilterPillOption<ReportScope>[] = [
  { key: "all", label: "Consolidado", tone: "blue" },
  { key: "group", label: "Grupo", tone: "indigo" },
  { key: "company", label: "Empresa", tone: "emerald" },
  { key: "shareholder", label: "Sócio", tone: "amber" },
];
const SELECT_CLASS = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

interface SelectOption {
  value: string;
  label: string;
}

interface ReportController {
  scope: ReportScope;
  groupName: string;
  companyId: string;
  shareholderId: string;
  groupOptions: readonly SelectOption[];
  companyOptions: readonly SelectOption[];
  shareholderOptions: readonly SelectOption[];
  report: ReportDocument | null;
  setScope: (scope: ReportScope) => void;
  setGroup: (token: string) => void;
  setCompany: (originId: string) => void;
  setShareholder: (routeId: string) => void;
}

function readScope(searchParams: URLSearchParams): ReportScope {
  const parsed = scopeSchema.safeParse(searchParams.get("scope") ?? "all");
  return parsed.success ? parsed.data : "all";
}

function findGroup(groups: readonly string[], token: string): string {
  return groups.find((group) => group === token || createEntityRouteId(group) === token) ?? "";
}

function resolveSelection(
  scope: ReportScope,
  groupName: string,
  company: Origin | undefined,
  shareholder: ShareholderSummary | undefined,
): ReportSelection | null {
  if (scope === "all") return { scope };
  if (scope === "group") return groupName === "" ? null : { scope, groupName };
  if (scope === "company") return company === undefined ? null : { scope, companyTaxId: company.companyTaxId };
  return shareholder === undefined ? null : { scope, shareholderKey: shareholder.key };
}

function replaceParams(
  searchParams: URLSearchParams,
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  changes: Readonly<Record<string, string | null>>,
): void {
  const next = new URLSearchParams(searchParams);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
  }
  setSearchParams(next, { replace: true });
}

function useReportController(catalog: Catalog, movements: readonly Movement[]): ReportController {
  const [searchParams, setSearchParams] = useSearchParams();
  const scope = readScope(searchParams);
  const groups = useMemo(
    () => [...new Set(catalog.origins.map((origin) => origin.groupName))].sort((left, right) => left.localeCompare(right, "pt-BR")),
    [catalog.origins],
  );
  const groupName = findGroup(groups, searchParams.get("group") ?? "");
  const companies = catalog.origins.filter((origin) => groupName === "" || origin.groupName === groupName);
  const companyId = searchParams.get("company") ?? "";
  const company = companies.find((origin) => origin.id === companyId);
  const shareholders = aggregateShareholders(catalog.origins, movements)
    .filter((shareholder) => groupName === "" || shareholder.groups.includes(groupName))
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
  const shareholderId = searchParams.get("shareholder") ?? "";
  const shareholder = shareholders.find((item) => createEntityRouteId(item.key) === shareholderId);
  const report = useMemo(
    () => {
      const selection = resolveSelection(scope, groupName, company, shareholder);
      return selection === null ? null : buildReportDocument({ catalog, movements, selection });
    },
    [catalog, company, groupName, movements, scope, shareholder],
  );
  const update = (changes: Readonly<Record<string, string | null>>) => replaceParams(searchParams, setSearchParams, changes);

  return {
    scope,
    groupName,
    companyId: company?.id ?? "",
    shareholderId: shareholder === undefined ? "" : createEntityRouteId(shareholder.key),
    groupOptions: groups.map((group) => ({ value: createEntityRouteId(group), label: group })),
    companyOptions: companies.slice().sort((left, right) => left.companyName.localeCompare(right.companyName, "pt-BR")).map((origin) => ({ value: origin.id, label: `${origin.companyName} · ${origin.exercise}` })),
    shareholderOptions: shareholders.map((item) => ({ value: createEntityRouteId(item.key), label: `${item.name} · ${item.companyCount} empresa(s)` })),
    report,
    setScope: (nextScope) => update(nextScope === "all"
      ? { scope: nextScope, group: null, company: null, shareholder: null }
      : { scope: nextScope, company: nextScope === "company" ? companyId : null, shareholder: nextScope === "shareholder" ? shareholderId : null }),
    setGroup: (token) => update({ group: token, company: null, shareholder: null }),
    setCompany: (originId) => {
      const origin = catalog.origins.find((item) => item.id === originId);
      update({ company: originId, group: origin === undefined ? null : createEntityRouteId(origin.groupName) });
    },
    setShareholder: (routeId) => update({ shareholder: routeId }),
  };
}

function SelectField({
  disabled,
  id,
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  disabled: boolean;
  id: string;
  label: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder: string;
  value: string;
}) {
  return (
    <div className={disabled ? "space-y-1.5 opacity-50" : "space-y-1.5"}>
      <Label htmlFor={id}>{label}</Label>
      <select className={SELECT_CLASS} disabled={disabled} id={id} onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

function ReportConfiguration({ controller }: { controller: ReportController }) {
  return (
    <SectionCard title="Escopo do relatório" note={controller.report?.scopeLabel ?? "Selecione uma entidade para montar o documento."}>
      <FilterPills ariaLabel="Escopo do relatório" className="mb-5" fullWidth onChange={controller.setScope} options={SCOPE_OPTIONS} value={controller.scope} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SelectField disabled={controller.scope === "all"} id="report-group" label="Grupo" onChange={controller.setGroup} options={controller.groupOptions} placeholder={controller.scope === "group" ? "Selecione um grupo" : "Todos os grupos"} value={controller.groupName === "" ? "" : createEntityRouteId(controller.groupName)} />
        <SelectField disabled={controller.scope !== "company"} id="report-company" label="Empresa" onChange={controller.setCompany} options={controller.companyOptions} placeholder="Selecione uma empresa" value={controller.companyId} />
        <SelectField disabled={controller.scope !== "shareholder"} id="report-shareholder" label="Sócio" onChange={controller.setShareholder} options={controller.shareholderOptions} placeholder="Selecione um sócio" value={controller.shareholderId} />
      </div>
      <div className="mt-5 flex gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-[12px] leading-relaxed text-muted-foreground">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
        <span>O HTML exportado mantém o formato A4, repete cabeçalhos de tabela e evita cortes no meio das linhas.</span>
      </div>
    </SectionCard>
  );
}

function downloadReport(report: ReportDocument): void {
  const url = URL.createObjectURL(new Blob([report.html], { type: "text/html;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = report.fileName;
  anchor.hidden = true;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function ReportPreview({ report }: { report: ReportDocument | null }) {
  if (report === null) {
    return <EmptyState compact description="Escolha o escopo e a entidade acima para gerar uma prévia segura." icon={<FileQuestion className="h-6 w-6" strokeWidth={1.75} />} title="Seleção incompleta" />;
  }
  return (
    <SectionCard title="Prévia do documento" note="Exatamente o conteúdo que será impresso">
      <div className="overflow-hidden rounded-md border border-border bg-muted/60 p-2 sm:p-4">
        <iframe className="h-[70vh] min-h-[560px] w-full rounded-md border-0 bg-background" id="report-preview-frame" sandbox="allow-modals allow-same-origin" srcDoc={report.html} title={`Prévia do relatório — ${report.title}`} />
      </div>
    </SectionCard>
  );
}

function ReportWorkspace({ catalog, movements, storageError }: { catalog: Catalog; movements: Movement[]; storageError: string | null }) {
  const controller = useReportController(catalog, movements);
  const printReport = () => {
    const frame = document.getElementById("report-preview-frame") as HTMLIFrameElement | null;
    try {
      if (frame?.contentWindow === null || frame?.contentWindow === undefined) throw new Error("Preview indisponível");
      frame.contentWindow.focus();
      frame.contentWindow.print();
    } catch {
      toast.error("Não foi possível abrir a impressão do relatório.");
    }
  };
  const exportReport = () => {
    if (controller.report === null) return;
    try {
      downloadReport(controller.report);
      toast.success("Relatório HTML exportado.");
    } catch {
      toast.error("Não foi possível exportar o relatório.");
    }
  };

  return <div className="space-y-6">
    <PageHeader actions={<><Button disabled={controller.report === null} onClick={printReport} size="sm" variant="outline"><Printer strokeWidth={1.75} /><span className="hidden sm:inline">Imprimir</span></Button><Button disabled={controller.report === null} onClick={exportReport} size="sm" variant="premium"><Download strokeWidth={1.75} /><span className="hidden sm:inline">Exportar relatório</span></Button></>} eyebrow="Documento executivo" subtitle="Defina o escopo, confira a prévia A4 e exporte um HTML pronto para impressão." title="Relatório de distribuição" />
    {storageError !== null && <div className="flex gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning"><AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.75} /><span>O backend apresentou uma falha; a prévia pode não incluir todos os lançamentos.</span></div>}
    <ReportConfiguration controller={controller} />
    <ReportPreview report={controller.report} />
  </div>;
}

export function ReportPage() {
  const { catalog, isLoading, loadError, movements, reloadCatalog, storageError } = useDistribution();
  if (isLoading) return <LoadingState fullPage label="Preparando o relatório" />;
  if (loadError !== null || catalog === null) {
    return <EmptyState action={<Button onClick={reloadCatalog} size="sm" variant="outline"><RefreshCw strokeWidth={1.75} />Tentar novamente</Button>} description={loadError ?? "A base de origens não está disponível."} icon={<FileText className="h-6 w-6" strokeWidth={1.75} />} title="Não foi possível montar o relatório" />;
  }
  return <ReportWorkspace catalog={catalog} movements={movements} storageError={storageError} />;
}
