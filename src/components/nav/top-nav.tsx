"use client";

import Container from "../container";
import BrandLogo from "../brand-logo";
import { ThemeToggle } from "../theme-toggle";

type TopNavProps = {
  title: string;
  className?: string;
};

export default function TopNav({ title, className }: TopNavProps) {
  return (
    <Container className={className}>
      <div className="flex h-16 items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <BrandLogo showBackground={false} className="hidden h-8 w-[112px] sm:block" />
          <h1 className="text-2xl font-medium">{title}</h1>
        </div>
        <ThemeToggle />
      </div>
    </Container>
  );
}
