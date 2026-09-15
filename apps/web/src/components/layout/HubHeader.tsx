import { Menu, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserAvatar } from "@/components/hub/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/cn";
import { HubNavigation } from "./HubSidebar";
import { HUB_NAV_ITEMS } from "./navigation";

export interface HubBreadcrumb {
  label: string;
  to?: string;
}

interface HubHeaderProps {
  sidebarExpanded: boolean;
  breadcrumbs?: readonly HubBreadcrumb[];
  userName?: string;
  userRole?: string;
  avatarUrl?: string | null;
  className?: string;
}

export function HubHeader({
  avatarUrl,
  breadcrumbs,
  className,
  sidebarExpanded,
  userName = "Grupo Pomin",
  userRole = "Financeiro",
}: HubHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const currentRoute = HUB_NAV_ITEMS.find((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  );
  const trail = breadcrumbs ?? [
    { label: "Distribuição", to: "/" },
    { label: currentRoute?.label ?? "Central" },
  ];

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-30 flex h-16 items-center gap-3 border-b border-black/[0.05] bg-white/95 px-3 backdrop-blur-md transition-[left] duration-500 ease-hub dark:border-white/[0.08] dark:bg-[#070707]/95 sm:px-5 lg:px-6",
        sidebarExpanded ? "lg:left-[var(--sb-open)]" : "lg:left-[var(--sb-closed)]",
        className,
      )}
    >
      <Dialog onOpenChange={setMobileOpen} open={mobileOpen}>
        <DialogTrigger asChild>
          <Button aria-label="Abrir menu" className="lg:hidden" size="icon" variant="ghost">
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white dark:bg-[#070707]" variant="sheet-left">
          <DialogTitle className="sr-only">Menu principal</DialogTitle>
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
            <span className="grid h-8 w-8 place-items-center rounded-[3px] bg-gradient-to-br from-primary-deep to-primary-vivid text-xs font-bold text-primary-foreground dark:from-primary dark:to-primary">
              P
            </span>
            <div>
              <strong className="block text-sm font-semibold">Grupo Pomin</strong>
              <span className="block text-[10px] text-muted-foreground">Distribuição de lucros</span>
            </div>
          </div>
          <HubNavigation
            className="hub-scroll flex-1 overflow-y-auto p-3"
            onNavigate={() => setMobileOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1 overflow-hidden">
        <ol className="flex items-center gap-2 truncate font-mono text-[11px] text-muted-foreground">
          {trail.map((crumb, index) => (
            <li className="flex min-w-0 items-center gap-2" key={`${crumb.label}-${index}`}>
              {index > 0 && <span aria-hidden="true">/</span>}
              {crumb.to && index < trail.length - 1 ? (
                <Link className="truncate transition-colors hover:text-foreground" to={crumb.to}>
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={index === trail.length - 1 ? "page" : undefined}
                  className={cn("truncate", index === trail.length - 1 && "text-foreground")}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <Button
        aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
        onClick={toggleTheme}
        size="icon"
        title={theme === "dark" ? "Tema claro" : "Tema escuro"}
        variant="ghost"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" strokeWidth={1.75} />
        ) : (
          <Moon className="h-5 w-5" strokeWidth={1.75} />
        )}
      </Button>

      <div className="hidden items-center gap-2 border-l border-border pl-3 sm:flex">
        <UserAvatar name={userName} size={32} src={avatarUrl} />
        <div className="hidden min-w-0 xl:block">
          <strong className="block max-w-40 truncate text-xs font-semibold">{userName}</strong>
          <span className="block max-w-40 truncate text-[10px] text-muted-foreground">{userRole}</span>
        </div>
      </div>
    </header>
  );
}
