"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SideNav } from "@/components/nav";
import { cn } from "@/lib/utils";

const unauthenticatedRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSideNav = unauthenticatedRoutes.some((route) => pathname?.startsWith(route) ?? false);
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem("caoa-side-nav-collapsed");
      if (storedValue !== null) {
        setIsSideNavCollapsed(storedValue === "true");
      }
    } catch {
      // Ignore storage access issues and keep the default state.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("caoa-side-nav-collapsed", String(isSideNavCollapsed));
    } catch {
      // Ignore storage access issues and keep the current session state.
    }
  }, [isSideNavCollapsed]);

  return (
    <div className="flex min-h-[100dvh]">
      {!hideSideNav && (
        <SideNav
          isCollapsed={isSideNavCollapsed}
          onToggleCollapse={() => setIsSideNavCollapsed((value) => !value)}
        />
      )}
      <div className={cn("min-w-0 flex-grow", hideSideNav ? "min-h-[100dvh]" : "overflow-auto")}>
        {children}
      </div>
    </div>
  );
}
