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
    <svg
      viewBox="0 0 1536 1024"
      role="img"
      aria-label="CAOA Venda Cantada"
      className={cn("block h-auto w-full", className)}
    >
      {showBackground ? <rect width="1536" height="1024" rx="64" fill="#000000" /> : null}

      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#13f37b" />
          <stop offset="100%" stopColor="#00d65f" />
        </linearGradient>
      </defs>

      <text
        x="768"
        y="510"
        textAnchor="middle"
        fill="#f8fafc"
        fontFamily="var(--font-gabarito), Gabarito, Arial, sans-serif"
        fontSize="312"
        fontStyle="italic"
        fontWeight="800"
        letterSpacing="-18"
      >
        CAOA
      </text>

      <rect x="656" y="468" width="54" height="54" rx="10" fill={`url(#${gradientId})`} transform="skewX(-18)" />
      <rect x="1020" y="468" width="54" height="54" rx="10" fill={`url(#${gradientId})`} transform="skewX(-18)" />

      <line x1="180" y1="684" x2="442" y2="684" stroke={`url(#${gradientId})`} strokeWidth="10" strokeLinecap="round" />
      <line x1="1096" y1="684" x2="1358" y2="684" stroke={`url(#${gradientId})`} strokeWidth="10" strokeLinecap="round" />

      <text
        x="768"
        y="760"
        textAnchor="middle"
        fontFamily="var(--font-gabarito), Gabarito, Arial, sans-serif"
        fontSize="138"
        fontStyle="italic"
        fontWeight="700"
        letterSpacing="14"
      >
        <tspan fill="#f8fafc">VENDA </tspan>
        <tspan fill={`url(#${gradientId})`}>CANTADA</tspan>
      </text>

      <path
        d="M416 820C586 890 950 890 1120 820"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="10"
        strokeLinecap="round"
      />

      <text
        x="1128"
        y="886"
        fill={`url(#${gradientId})`}
        fontFamily="Arial, sans-serif"
        fontSize="120"
        fontWeight="700"
      >
        ♪
      </text>
    </svg>
  );
}
