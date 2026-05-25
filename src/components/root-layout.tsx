"use client";

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

  return (
    <div className="flex min-h-[100dvh]">
      {!hideSideNav && <SideNav />}
      <div className={cn("flex-grow", hideSideNav ? "min-h-[100dvh]" : "overflow-auto")}>{children}</div>
    </div>
  );
}
