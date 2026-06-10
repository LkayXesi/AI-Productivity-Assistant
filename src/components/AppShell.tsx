import { Link, useRouterState } from "@tanstack/react-router";
import { ReactNode } from "react";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AppShell({ title, subtitle, children, crumbs }: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  crumbs?: { to?: string; label: string }[];
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const fallback = [
    { to: "/dashboard", label: "Dashboard" },
    { label: title },
  ];
  const items = crumbs ?? (path.startsWith("/tools/") ? fallback : [{ label: title }]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          {items.map((c, i) => (
            <span key={i} className="contents">
              <BreadcrumbItem>
                {c.to ? (
                  <BreadcrumbLink asChild><Link to={c.to}>{c.label}</Link></BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {i < items.length - 1 && <BreadcrumbSeparator />}
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
