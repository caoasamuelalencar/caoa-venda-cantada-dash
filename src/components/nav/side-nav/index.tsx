"use client";

import { ArrowLeftToLine, ArrowRightToLine, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Navigation from "./components/navigation";
import User from "./components/user";

function getAuthUsername() {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("caoa-auth="));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=")[1] || "");
}

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(getAuthUsername());
  }, []);

  function handleLogout() {
    document.cookie = "caoa-auth=; path=/; max-age=0; sameSite=strict";
    window.location.href = "/login";
  }

  return (
    <>
      <button
        className={cn(
          "fixed left-0 top-12 z-50 rounded-r-md bg-slate-200 px-2 py-1.5 text-primary-foreground shadow-md hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 tablet:hidden",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-44" : "translate-x-0",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ArrowLeftToLine size={16} />
        ) : (
          <ArrowRightToLine size={16} />
        )}
      </button>
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-40 flex h-[100dvh] w-44 shrink-0 flex-col justify-between border-r border-border bg-slate-100 dark:bg-slate-900 tablet:sticky tablet:translate-x-0",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div>
          <User />
          <Navigation />
        </div>

        {username && (
          <button
            type="button"
            className="mx-3 mb-4 inline-flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut size={14} />
            Sair
          </button>
        )}
      </aside>
    </>
  );
}
