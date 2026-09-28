"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import type { VChart as VisActorChart } from "@visactor/react-vchart";

type VChartProps = Omit<ComponentProps<typeof VisActorChart>, "vchartConstrouctor">;

const VChartRuntime = dynamic(() => import("./vchart"), {
  ssr: false,
});

export function VChart(props: VChartProps) {
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
      { rootMargin: "240px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full" aria-busy={!shouldLoad}>
      {shouldLoad ? <VChartRuntime {...props} /> : null}
    </div>
  );
}
