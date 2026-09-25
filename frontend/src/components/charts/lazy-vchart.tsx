"use client";

import dynamic from "next/dynamic";

const VChart = dynamic(() => import("./vchart"), {
  ssr: false,
  loading: () => <div className="h-full w-full" aria-hidden="true" />,
});

export { VChart };
