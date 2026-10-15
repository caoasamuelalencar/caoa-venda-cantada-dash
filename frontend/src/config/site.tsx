import {
  ArrowLeftRight,
  FilePlus2,
  LayoutDashboard,
  ShieldCheck,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";

export type SiteConfig = typeof siteConfig;
export type Navigation = {
  icon: LucideIcon;
  name: string;
  href: string;
  group: "Operação" | "Análises" | "Administração";
  requiresAdmin?: boolean;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
};

export const siteConfig = {
  title: "CAOA Venda Cantada Relatórios",
  description: "Relatórios de intenção de vendas da CAOA.",
};

export const navigations: Navigation[] = [
  {
    icon: FilePlus2,
    name: "Cadastro de Intenção",
    href: "/sales-intention",
    group: "Operação",
  },
  {
    icon: LayoutDashboard,
    name: "Dashboard",
    href: "/dashboard",
    group: "Análises",
  },
  {
    icon: Tag,
    name: "Marcas",
    href: "/relatorios/marca",
    group: "Análises",
  },
  {
    icon: Users,
    name: "Vendedores",
    href: "/relatorios/vendedor",
    group: "Análises",
  },
  {
    icon: ArrowLeftRight,
    name: "Cadastro Fluxo Loja",
    href: "/cadastro-fluxo-loja",
    group: "Operação",
  },
  {
    icon: ShieldCheck,
    name: "Gestão de Acessos",
    href: "/admin/access-management",
    group: "Administração",
    requiresAdmin: true,
  },
];
