import {
  ArrowLeftRight,
  Building2,
  FileText,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface HubNavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export const HUB_NAV_ITEMS: readonly HubNavigationItem[] = [
  { label: "Central", to: "/", icon: LayoutDashboard, end: true },
  { label: "Empresas", to: "/empresas", icon: Building2 },
  { label: "Sócios", to: "/socios", icon: Users },
  { label: "Movimentações", to: "/movimentacoes", icon: ArrowLeftRight },
  { label: "Relatório", to: "/relatorio", icon: FileText },
];
