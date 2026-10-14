"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { SalesIntentionReportRow } from "@/lib/salesIntentionApi";

type SalesIntentionDataListProps = {
  items: SalesIntentionReportRow[];
  exportFilePrefix?: string;
  className?: string;
};

const SalesIntentionDataListRuntime = dynamic(() =>
  import("./sales-intention-data-list").then((module) => module.SalesIntentionDataList),
);

/**
 * The detailed table is below the dashboard and report summaries. Deferring it
 * keeps its search, export and editing code out of the initial route payload.
 */
export function LazySalesIntentionDataList(props: SalesIntentionDataListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "480px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full min-h-80 w-full" aria-busy={!shouldLoad}>
      {shouldLoad ? <SalesIntentionDataListRuntime {...props} /> : null}
    </div>
  );
}
