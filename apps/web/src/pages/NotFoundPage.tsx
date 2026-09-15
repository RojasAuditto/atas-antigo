import { Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/hub/EmptyState";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <EmptyState
      action={<Button asChild><Link to="/">Voltar à Central</Link></Button>}
      description="O endereço informado não corresponde a uma tela deste módulo."
      icon={<Compass className="h-6 w-6" strokeWidth={1.75} />}
      title="Página não encontrada"
    />
  );
}
