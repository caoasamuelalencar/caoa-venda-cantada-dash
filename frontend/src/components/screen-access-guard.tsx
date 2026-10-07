"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getScreenCodeForPath } from "@/lib/screen-access";

export function ScreenAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const screenCode = getScreenCodeForPath(pathname);
  const [allowed, setAllowed] = useState(!screenCode);

  useEffect(() => {
    if (!screenCode) {
      setAllowed(true);
      return;
    }
    let active = true;
    setAllowed(false);
    fetch("/api/users/me/screens", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Falha ao carregar telas");
        return response.json() as Promise<{ screens: string[] }>;
      })
      .then(({ screens }) => {
        if (!active) return;
        if (screens.includes(screenCode)) {
          setAllowed(true);
          return;
        }
        router.replace("/access-denied?error=ScreenAccessDenied");
      })
      .catch(() => {
        if (active) router.replace("/access-denied?error=ScreenAccessDenied");
      });
    return () => { active = false; };
  }, [router, screenCode]);

  if (!allowed) return <div className="min-h-screen bg-white dark:bg-slate-950" />;
  return <>{children}</>;
}
