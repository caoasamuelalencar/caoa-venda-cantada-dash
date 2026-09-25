"use client";

import { Provider as JotaiProvider } from "jotai";
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
          {children}
        </ModeThemeProvider>
      </SessionProvider>
    </JotaiProvider>
  );
}
