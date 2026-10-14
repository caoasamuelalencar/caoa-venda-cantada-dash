export const protectedScreens = [
  { code: 'SALES_INTENTION', name: 'Intenções de venda', path: '/sales-intention' },
  { code: 'STORE_FLOW', name: 'Cadastro Fluxo Loja', path: '/cadastro-fluxo-loja' },
  { code: 'DASHBOARD', name: 'Dashboard', path: '/dashboard' },
  { code: 'REPORT_BRAND', name: 'Relatório por marca', path: '/relatorios/marca' },
  { code: 'REPORT_SELLER', name: 'Relatório por vendedor', path: '/relatorios/vendedor' },
  { code: 'PROFILE', name: 'Perfil', path: '/perfil' },
  { code: 'ACCESS_MANAGEMENT', name: 'Gestão de acessos', path: '/admin/access-management' },
] as const;

export function getScreenCodeForPath(pathname: string | null | undefined) {
  if (!pathname) return null;
  return protectedScreens.find((screen) => pathname === screen.path || pathname.startsWith(`${screen.path}/`))?.code ?? null;
}
