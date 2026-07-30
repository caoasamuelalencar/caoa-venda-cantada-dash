"use client";

import { useEffect, useState } from "react";

export function LoadingOverlay() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Carregando"
    >
      <div className="flex min-w-48 items-center justify-center rounded-3xl border border-white/20 bg-white px-6 py-5 text-slate-950 shadow-2xl dark:bg-slate-900 dark:text-white">
        <span className="text-base font-semibold">Carregando</span>
        <span className="ml-1 flex items-end gap-0.5" aria-hidden="true">
          <span className="animate-pulse text-xl leading-none [animation-delay:0ms]">.</span>
          <span className="animate-pulse text-xl leading-none [animation-delay:180ms]">.</span>
          <span className="animate-pulse text-xl leading-none [animation-delay:360ms]">.</span>
        </span>
      </div>
    </div>
  );
}

export function GlobalRequestLoading() {
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const originalFetch = window.fetch;

    const monitoredFetch: typeof window.fetch = async (...args) => {
      setPendingRequests((current) => current + 1);

      try {
        return await originalFetch(...args);
      } finally {
        setPendingRequests((current) => Math.max(0, current - 1));
      }
    };

    window.fetch = monitoredFetch;

    return () => {
      if (window.fetch === monitoredFetch) {
        window.fetch = originalFetch;
      }
    };
  }, []);

  return pendingRequests > 0 ? <LoadingOverlay /> : null;
}
