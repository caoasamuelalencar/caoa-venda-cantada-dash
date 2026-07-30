"use client";

import { Provider as JotaiProvider } from "jotai";
import { ChartThemeProvider } from "@/components/providers/chart-theme-provider";
import { ModeThemeProvider } from "@/components/providers/mode-theme-provider";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <SessionProvider>
        <ModeThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ChartThemeProvider>{children}</ChartThemeProvider>
        </ModeThemeProvider>
      </SessionProvider>
    </JotaiProvider>
  );
}
