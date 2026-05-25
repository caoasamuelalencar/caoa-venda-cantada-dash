import { type LucideIcon, ChartPie } from "lucide-react";

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
    icon: ChartPie,
    name: "Relatório por Marca",
    href: "/relatorios/marca",
  },
];
