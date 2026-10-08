import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  ['INTENTION_CREATE', 'Criar intenções de venda'],
  ['INTENTION_VIEW', 'Visualizar intenções de venda'],
  ['INTENTION_UPDATE', 'Atualizar intenções de venda'],
  ['INTENTION_DELETE', 'Excluir intenções de venda'],
  ['STORE_FLOW_CREATE', 'Registrar fluxo de loja'],
  ['REPORT_VIEW', 'Visualizar relatórios'],
  ['REPORT_EXPORT', 'Exportar relatórios'],
  ['USER_VIEW', 'Visualizar usuários'],
  ['USER_MANAGE', 'Gerenciar usuários'],
  ['ROLE_VIEW', 'Visualizar perfis'],
  ['ROLE_MANAGE', 'Gerenciar perfis'],
] as const;

const roles = [
  ['USER', 'Usuário', ['INTENTION_CREATE', 'INTENTION_VIEW', 'INTENTION_UPDATE', 'STORE_FLOW_CREATE']],
  ['MANAGER', 'Gestor', ['INTENTION_CREATE', 'INTENTION_VIEW', 'INTENTION_UPDATE', 'STORE_FLOW_CREATE', 'REPORT_VIEW', 'REPORT_EXPORT']],
  ['VIEWER', 'Visualizador', ['INTENTION_VIEW', 'REPORT_VIEW']],
  ['ADMIN', 'Administrador', permissions.map(([code]) => code)],
] as const;

const screens = [
  ['SALES_INTENTION', 'Intenções de venda', '/sales-intention', 10],
  ['STORE_FLOW', 'Cadastro Fluxo Loja', '/cadastro-fluxo-loja', 15],
  ['DASHBOARD', 'Dashboard', '/dashboard', 20],
  ['REPORT_BRAND', 'Relatório por marca', '/relatorios/marca', 30],
  ['REPORT_SELLER', 'Relatório por vendedor', '/relatorios/vendedor', 40],
  ['PROFILE', 'Perfil', '/perfil', 50],
  ['ACCESS_MANAGEMENT', 'Gestão de acessos', '/admin/access-management', 60],
] as const;

async function main() {
  for (const [code, name] of permissions) {
    await prisma.permission.upsert({ where: { code }, create: { code, name }, update: { name } });
  }

  for (const [code, name, rolePermissions] of roles) {
    const role = await prisma.role.upsert({
      where: { code }, create: { code, name }, update: { name },
    });
    const permissionRows = await prisma.permission.findMany({
      where: { code: { in: [...rolePermissions] } },
      select: { id: true },
    });

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId: role.id } }),
      prisma.rolePermission.createMany({
        data: permissionRows.map((permission) => ({ roleId: role.id, permissionId: permission.id })),
      }),
    ]);
  }

  for (const [code, name, path, sortOrder] of screens) {
    await prisma.screen.upsert({
      where: { code },
      create: { code, name, path, sortOrder },
      update: { name, path, sortOrder },
    });
  }

  console.log('Perfis, permissões e telas de autorização foram sincronizados.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
