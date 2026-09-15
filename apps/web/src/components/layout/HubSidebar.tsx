import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";
import { HUB_NAV_ITEMS } from "./navigation";

interface HubNavigationProps {
  expanded?: boolean;
  onNavigate?: () => void;
  className?: string;
}

interface HubSidebarProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  className?: string;
}

export function HubNavigation({
  className,
  expanded = true,
  onNavigate,
}: HubNavigationProps) {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Navegação principal" className={cn("space-y-1", className)}>
      {HUB_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            aria-label={expanded ? undefined : item.label}
            className={({ isActive }) => {
              const active = isActive || (item.to === "/" && pathname.startsWith("/grupos/"));
              return cn(
                "flex h-10 items-center overflow-hidden rounded-md border border-transparent px-2.5 text-sm font-medium text-sidebar-foreground/70 transition-[color,background-color,border-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                active
                  ? "hub-nav-item-active"
                  : "hover:bg-black/[0.04] hover:text-sidebar-foreground dark:hover:bg-white/[0.04]",
              );
            }}
            end={item.end}
            key={item.to}
            onClick={onNavigate}
            title={expanded ? undefined : item.label}
            to={item.to}
          >
            <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.75} />
            <span
              aria-hidden={!expanded}
              className={cn(
                "ml-3 truncate whitespace-nowrap transition-opacity duration-300",
                expanded ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function HubSidebar({
  className,
  expanded,
  onExpandedChange,
}: HubSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-white px-2 py-3 text-sidebar-foreground transition-[width] duration-500 ease-hub dark:bg-[#070707] lg:flex",
        expanded ? "w-[var(--sb-open)]" : "w-[var(--sb-closed)]",
        className,
      )}
      onBlurCapture={(event) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
          onExpandedChange(false);
        }
      }}
      onFocusCapture={() => onExpandedChange(true)}
      onMouseEnter={() => onExpandedChange(true)}
      onMouseLeave={() => onExpandedChange(false)}
    >
      <div className="flex h-10 items-center overflow-hidden px-1.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[3px] bg-gradient-to-br from-primary-deep to-primary-vivid text-xs font-bold text-primary-foreground dark:from-primary dark:to-primary">
          P
        </span>
        <div
          className={cn(
            "ml-3 min-w-0 whitespace-nowrap transition-opacity duration-300",
            expanded ? "opacity-100" : "opacity-0",
          )}
        >
          <strong className="block truncate text-sm font-semibold">Grupo Pomin</strong>
          <span className="block truncate text-[10px] text-muted-foreground">Distribuição de lucros</span>
        </div>
      </div>
      <HubNavigation className="mt-5" expanded={expanded} />
      <div
        className={cn(
          "mt-auto overflow-hidden px-2 text-[10px] text-muted-foreground transition-opacity duration-300",
          expanded ? "opacity-100" : "opacity-0",
        )}
      >
        Central financeira
      </div>
    </aside>
  );
}
