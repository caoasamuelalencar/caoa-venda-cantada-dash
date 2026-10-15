"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigations } from "@/config/site";
import { getScreenCodeForPath } from "@/lib/screen-access";
import { cn } from "@/lib/utils";
import SideNavTooltip from "./side-nav-tooltip";

type NavigationProps = {
  isCollapsed?: boolean;
  onNavigate?: () => void;
};

export default function Navigation({
  isCollapsed = false,
  onNavigate,
}: NavigationProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [screenCodes, setScreenCodes] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/users/access-management/context", { cache: "no-store" })
      .then((response) => {
        if (active) setIsAdmin(response.ok);
      })
      .catch(() => {
        if (active) setIsAdmin(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/users/me/screens", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Falha ao carregar telas");
        return response.json() as Promise<{ screens: string[] }>;
      })
      .then(({ screens }) => { if (active) setScreenCodes(screens); })
      .catch(() => { if (active) setScreenCodes([]); });
    return () => { active = false; };
  }, []);

  const visibleNavigations = navigations.filter((item) => {
    const screenCode = getScreenCodeForPath(item.href);
    return (!item.requiresAdmin || isAdmin) && (!screenCode || screenCodes?.includes(screenCode) === true);
  });
  const sections = [
    {
      label: "Operação",
      items: visibleNavigations.filter((item) => item.group === "Operação"),
    },
    {
      label: "Análises",
      items: visibleNavigations.filter((item) => item.group === "Análises"),
    },
    {
      label: "Administração",
      items: visibleNavigations.filter((item) => item.group === "Administração"),
    },
  ];
  return (
    <nav
      aria-label="Navegação principal"
      className={cn(
        "flex flex-grow flex-col gap-y-4 px-2 py-4",
        isCollapsed && "tablet:gap-y-5",
      )}
    >
      {sections.filter((section) => section.items.length > 0).map((section) => (
        <div
          key={section.label}
          className={cn(
            "space-y-1",
            isCollapsed &&
              section.label === "Análises" &&
              "tablet:mt-2 tablet:border-t tablet:border-border tablet:pt-4",
          )}
        >
          <p
            className={cn(
              "px-2 text-[10px] font-normal uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400",
              isCollapsed && "tablet:hidden",
            )}
          >
            {section.label}
          </p>
          {section.items.map((navigation) => {
            const Icon = navigation.icon;
            const isActive =
              pathname === navigation.href ||
              (navigation.href !== "/" &&
                pathname?.startsWith(`${navigation.href}/`));
            return (
              <SideNavTooltip
                key={navigation.name}
                enabled={isCollapsed}
                label={navigation.name}
              >
                <Link
                  href={navigation.href}
                  onClick={onNavigate}
                  target={navigation.target}
                  rel={navigation.rel}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={isCollapsed ? navigation.name : undefined}
                  title={isCollapsed ? navigation.name : undefined}
                  className={cn(
                    "flex w-full min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:hover:bg-slate-800",
                    isCollapsed && "tablet:justify-center tablet:px-2",
                    isActive
                      ? "bg-sky-100 font-normal text-sky-900 dark:bg-cyan-400/10 dark:text-cyan-100"
                      : "bg-transparent",
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      "shrink-0",
                      isActive
                        ? "text-sky-700 dark:text-cyan-300"
                        : "text-slate-600 dark:text-slate-300",
                    )}
                  />
                  <span
                    className={cn(
                      "min-w-0 truncate text-sm",
                      isCollapsed && "tablet:hidden",
                      isActive
                        ? "text-sky-900 dark:text-cyan-100"
                        : "text-slate-700 dark:text-slate-300",
                    )}
                  >
                    {navigation.name}
                  </span>
                </Link>
              </SideNavTooltip>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
