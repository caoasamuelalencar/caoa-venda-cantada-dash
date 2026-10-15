"use client";

import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

type FilterSidePanelProps = {
  id: string;
  open: boolean;
  onClose: () => void;
  panelRef?: Ref<HTMLElement>;
  label: string;
  children: ReactNode;
};

/** A right-side drawer that mirrors the visual language of the main navigation. */
export function FilterSidePanel({
  id,
  open,
  onClose,
  panelRef,
  label,
  children,
}: FilterSidePanelProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Fechar filtros"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        id={id}
        ref={panelRef}
        aria-label={label}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-[60] flex h-[100dvh] w-full max-w-[28rem] flex-col overflow-hidden border-l border-slate-200 bg-slate-100 text-slate-900 shadow-2xl transition-transform duration-300 ease-in-out dark:border-white/10 dark:bg-slate-900 dark:text-slate-100",
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        {children}
      </aside>
    </>
  );
}
