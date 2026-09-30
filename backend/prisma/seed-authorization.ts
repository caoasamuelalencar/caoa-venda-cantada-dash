import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  ['INTENTION_CREATE', 'Criar intenções de venda'],
  ['INTENTION_VIEW', 'Visualizar intenções de venda'],
  ['INTENTION_UPDATE', 'Atualizar intenções de venda'],
  ['INTENTION_DELETE', 'Excluir intenções de venda'],
  ['REPORT_VIEW', 'Visualizar relatórios'],
  ['REPORT_EXPORT', 'Exportar relatórios'],
  ['USER_VIEW', 'Visualizar usuários'],
  ['USER_MANAGE', 'Gerenciar usuários'],
  ['ROLE_VIEW', 'Visualizar perfis'],
  ['ROLE_MANAGE', 'Gerenciar perfis'],
] as const;

const roles = [
  ['USER', 'Usuário', 'OWN', ['INTENTION_CREATE', 'INTENTION_VIEW', 'INTENTION_UPDATE']],
  ['MANAGER', 'Gestor regional', 'REGIONAL', ['INTENTION_CREATE', 'INTENTION_VIEW', 'INTENTION_UPDATE', 'REPORT_VIEW', 'REPORT_EXPORT']],
  ['VIEWER', 'Visualizador regional', 'REGIONAL', ['INTENTION_VIEW', 'REPORT_VIEW']],
  ['ADMIN', 'Administrador', 'ALL', permissions.map(([code]) => code)],
] as const;

async function main() {
  for (const [code, name] of permissions) {
    await prisma.permission.upsert({ where: { code }, create: { code, name }, update: { name } });
  }

  for (const [code, name, dataScope, rolePermissions] of roles) {
    const role = await prisma.role.upsert({
      where: { code },
      create: { code, name, dataScope },
      update: { name, dataScope },
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

  console.log('Perfis e permissões de autorização foram sincronizados.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
