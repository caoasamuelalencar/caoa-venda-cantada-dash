import type { Metadata } from "next";
import RootLayoutWrapper from "@/components/root-layout";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import "@/style/globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("bg-background font-sans")}>
        <Providers>
          <RootLayoutWrapper>{children}</RootLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
