import { type LucideIcon, ChartPie, Tag } from "lucide-react";

export type SiteConfig = typeof siteConfig;
export type Navigation = {
  icon: LucideIcon;
  name: string;
  href: string;
};

export const siteConfig = {
  title: "CAOA Venda Cantada Relatórios",
  description: "Relatórios de intenção de vendas da CAOA.",
};

export const navigations: Navigation[] = [
  {
    icon: ChartPie,
    name: "Relatórios",
    href: "/relatorios",
  },
  {
    icon: Tag,
    name: "Marcas",
    href: "/relatorios/marca",
  },
];
