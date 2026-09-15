import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { HubHeader, type HubBreadcrumb } from "./HubHeader";
import { HubSidebar } from "./HubSidebar";

interface HubLayoutProps {
  children: ReactNode;
  breadcrumbs?: readonly HubBreadcrumb[];
  userName?: string;
  userRole?: string;
  avatarUrl?: string | null;
  className?: string;
  contentClassName?: string;
}

export function HubLayout({
  avatarUrl,
  breadcrumbs,
  children,
  className,
  contentClassName,
  userName,
  userRole,
}: HubLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className={cn("min-h-screen", className)}>
      <HubSidebar
        expanded={sidebarExpanded}
        onExpandedChange={setSidebarExpanded}
      />
      <HubHeader
        avatarUrl={avatarUrl}
        breadcrumbs={breadcrumbs}
        sidebarExpanded={sidebarExpanded}
        userName={userName}
        userRole={userRole}
      />
      <div
        className={cn(
          "min-h-screen pt-16 transition-[padding-left] duration-500 ease-hub",
          sidebarExpanded ? "lg:pl-[var(--sb-open)]" : "lg:pl-[var(--sb-closed)]",
        )}
      >
        <main
          className={cn(
            "m-2 min-h-[calc(100vh-5rem)] rounded-lg border border-black/[0.04] bg-white p-3 shadow-sm dark:border-white/[0.08] dark:bg-[#070707] sm:m-3 sm:min-h-[calc(100vh-5.5rem)] sm:p-6",
            contentClassName,
          )}
        >
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
