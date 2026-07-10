"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Container from "../container";
import { ThemeToggle } from "../theme-toggle";

type TopNavProps = {
  title: string;
  className?: string;
};

const routeLabels: Record<string, string> = {
  "": "Início",
  relatorios: "Relatórios",
  vendedor: "Vendedor",
  marca: "Marca",
  "test-relatorios": "Teste de relatórios",
  perfil: "Perfil",
  login: "Login",
  register: "Cadastro",
  "forgot-password": "Esqueceu a senha",
  "reset-password": "Redefinir senha",
  "access-denied": "Acesso negado",
  "sales-intention": "Intenção de venda",
  dashboard: "Dashboard",
};

function formatSegment(segment: string) {
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function TopNav({ title, className }: TopNavProps) {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];

  const breadcrumbs = segments.reduce<Array<{ href: string; label: string }>>(
    (acc, segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const label = routeLabels[segment] ?? formatSegment(segment);

      acc.push({ href, label });
      return acc;
    },
    []
  );

  const items = [{ href: "/", label: routeLabels[""] ?? "Início" }, ...breadcrumbs];

  return (
    <Container className={className}>
      <div className="flex h-16 items-center justify-between border-b border-border">
        <div className="flex min-w-0 items-center gap-3">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center text-sm text-muted-foreground">
            <ol className="flex min-w-0 flex-wrap items-center gap-2">
              {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                  <li key={item.href} className="flex min-w-0 items-center gap-2">
                    {index > 0 ? <span className="text-muted-foreground/70">/</span> : null}
                    <Link
                      href={item.href}
                      aria-current={isLast ? "page" : undefined}
                      className={`truncate transition-colors ${
                        isLast
                          ? "font-medium text-foreground"
                          : "hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
        <ThemeToggle />
      </div>
    </Container>
  );
}
