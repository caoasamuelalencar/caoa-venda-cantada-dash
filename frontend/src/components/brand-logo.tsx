"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  showBackground?: boolean;
};

export default function BrandLogo({ className, showBackground = true }: BrandLogoProps) {
  const gradientId = useId().replace(/:/g, "");

  return (
    <picture className={cn("block h-full w-full", className)}>
      {/* Prefer raster PNGs if present (you can replace these with the attached image files) */}
      <source srcSet="/images/logo-dark.png" media="(prefers-color-scheme: dark)" />
      <source srcSet="/images/logo-dark.svg" media="(prefers-color-scheme: dark)" />

      <source srcSet="/images/logo-light.png" />
      <img src="/images/logo-light.png" alt="Venda Cantada - CAOA" className={cn("block h-full w-full object-contain", className)} />
    </picture>
  );
}
