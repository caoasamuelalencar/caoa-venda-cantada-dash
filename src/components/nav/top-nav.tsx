"use client";

import Container from "../container";
import BrandLogo from "../brand-logo";
import { ThemeToggle } from "../theme-toggle";

export default function TopNav({ title }: { title: string }) {
  return (
    <Container className="flex h-16 items-center justify-between border-b border-border">
      <div className="flex items-center gap-3">
        <BrandLogo showBackground={false} className="hidden h-8 w-[112px] sm:block" />
        <h1 className="text-2xl font-medium">{title}</h1>
      </div>
      <ThemeToggle />
    </Container>
  );
}
