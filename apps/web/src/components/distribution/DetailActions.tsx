import { FileText, Landmark } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDistribution, type MovementPrefill } from "@/contexts/DistributionContext";

interface DetailActionsProps {
  reportTo: string;
  prefill?: MovementPrefill;
}

export function DetailActions({ prefill, reportTo }: DetailActionsProps) {
  const { openMovementDialog } = useDistribution();

  return (
    <>
      <Button asChild size="sm" variant="outline">
        <Link to={reportTo}>
          <FileText className="h-4 w-4" strokeWidth={1.75} />
          Relatório
        </Link>
      </Button>
      <Button onClick={() => openMovementDialog(prefill)} size="sm" variant="premium">
        <Landmark className="h-4 w-4" strokeWidth={1.75} />
        Registrar distribuição
      </Button>
    </>
  );
}
