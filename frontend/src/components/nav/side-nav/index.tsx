"use client";

import {
  ArrowLeftToLine,
  ArrowRightToLine,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import Navigation from "./components/navigation";
import SideNavTooltip from "./components/side-nav-tooltip";
import User from "./components/user";

type SideNavProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

function getAuthUsername() {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("caoa-auth="));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=")[1] || "");
}

export default function SideNav({
  isCollapsed = false,
  onToggleCollapse,
}: SideNavProps) {
  const { status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [localUsername, setLocalUsername] = useState<string | null>(null);

  useEffect(() => {
    setLocalUsername(getAuthUsername());
  }, []);

  const isAuthenticated = status === "authenticated" || Boolean(localUsername);
  const isProfileActive =
    pathname === "/perfil" || pathname?.startsWith("/perfil/");

  if (status === "unauthenticated" && !localUsername) {
    return null;
  }

  function handleLogout() {
    setIsOpen(false);

    if (status === "authenticated") {
      signOut({ callbackUrl: "/login" });
      return;
    }

    document.cookie = "caoa-auth=; path=/; max-age=0; sameSite=strict";
    window.location.href = "/login";
  }

  function handleNavigation() {
    setIsOpen(false);
  }

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Fechar menu lateral"
          className="tablet:hidden fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      ) : null}
      <button
        type="button"
        className={cn(
          "tablet:hidden fixed left-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-950/90 text-slate-100 shadow-sm backdrop-blur-md transition-transform duration-150 ease-in-out hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-white/10 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200",
          isOpen ? "translate-x-56" : "translate-x-0",
        )}
        aria-label={isOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
      {onToggleCollapse ? (
        <button
          type="button"
          aria-label={
            isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"
          }
          title={
            isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"
          }
          className={cn(
            "border-border tablet:flex fixed top-20 z-50 hidden h-9 w-8 items-center justify-center rounded-r-md border border-l-0 bg-slate-900 text-slate-50 shadow-md transition-[left,background-color] duration-300 ease-in-out hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200",
            isCollapsed ? "tablet:left-20" : "tablet:left-56",
          )}
          onClick={onToggleCollapse}
        >
          {isCollapsed ? (
            <ArrowRightToLine size={16} />
          ) : (
            <ArrowLeftToLine size={16} />
          )}
        </button>
      ) : null}
      <aside
        className={cn(
          "border-border fixed inset-y-0 left-0 z-40 flex h-[100dvh] w-56 shrink-0 flex-col overflow-y-auto overflow-x-hidden overscroll-contain border-r bg-slate-100 dark:bg-slate-900",
          "transition-[width,transform,opacity] duration-300 ease-in-out",
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
          "tablet:translate-x-0 tablet:opacity-100 tablet:pointer-events-auto",
          isCollapsed && "tablet:w-20",
        )}
      >
        <div
          className={cn(
            "border-border border-b p-3",
            isCollapsed && "tablet:px-2",
          )}
        >
          <Link href="/dashboard" className="block" onClick={handleNavigation}>
            <BrandLogo
              className={cn(
                "mx-auto w-full max-w-[200px] scale-110 transition-[max-width,transform] duration-300 ease-in-out",
                isCollapsed && "tablet:hidden",
              )}
            />
            <span
              aria-label="CAOA"
              className={cn(
                "hidden h-12 items-center justify-center text-4xl font-semibold tracking-tight text-[#25218f] dark:text-white",
                isCollapsed && "tablet:flex",
              )}
            >
              C
            </span>
          </Link>
        </div>
        <User isCollapsed={isCollapsed} />
        <Navigation isCollapsed={isCollapsed} onNavigate={handleNavigation} />
        {isAuthenticated ? (
          <nav
            aria-label="Perfil"
            className={cn(
              "mt-auto space-y-1 px-2 pb-4",
              isCollapsed &&
                "tablet:space-y-2 tablet:border-t tablet:border-border tablet:pt-4",
            )}
          >
            <p
              className={cn(
                "px-2 text-[10px] font-normal uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400",
                isCollapsed && "tablet:hidden",
              )}
            >
              Perfil
            </p>
            <SideNavTooltip enabled={isCollapsed} label="Ver perfil">
              <Link
                href="/perfil"
                onClick={handleNavigation}
                aria-label={isCollapsed ? "Ver perfil" : undefined}
                title={isCollapsed ? "Ver perfil" : undefined}
                aria-current={isProfileActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:text-slate-300 dark:hover:bg-slate-800",
                  isCollapsed && "tablet:justify-center tablet:px-2",
                  isProfileActive &&
                    "bg-sky-100 text-sky-900 dark:bg-cyan-400/10 dark:text-cyan-100",
                )}
              >
                <UserRound
                  size={16}
                  className={cn(
                    "shrink-0",
                    isProfileActive
                      ? "text-sky-700 dark:text-cyan-300"
                      : "text-slate-600 dark:text-slate-300",
                  )}
                />
                <span className={cn(isCollapsed && "tablet:hidden")}>
                  Ver perfil
                </span>
              </Link>
            </SideNavTooltip>
            <SideNavTooltip enabled={isCollapsed} label="Sair">
              <Link
                href="/login"
                onClick={(event) => {
                  event.preventDefault();
                  handleLogout();
                }}
                aria-label={isCollapsed ? "Sair" : undefined}
                title={isCollapsed ? "Sair" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:text-slate-300 dark:hover:bg-slate-800",
                  isCollapsed && "tablet:justify-center tablet:px-2",
                )}
              >
                <LogOut
                  size={16}
                  className="shrink-0 text-slate-600 dark:text-slate-300"
                />
                <span className={cn(isCollapsed && "tablet:hidden")}>Sair</span>
              </Link>
            </SideNavTooltip>
          </nav>
        ) : null}
      </aside>
    </>
  );
}
