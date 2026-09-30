import prisma from '../lib/prisma';
import { forbidden, serviceUnavailable } from '../errors/AppError';
import { resolveDataScope, type AuthorizationContext, type EntraIdentity, type PermissionCode } from '../auth/authorization';

const authorizationInclude = {
  roles: {
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } }
        }
      }
    }
  }
} as const;

export class UserRepository {
  public async list(filters: { search?: string; role?: string; regional?: string; active?: boolean }) {
    const users = await prisma.user.findMany({
      where: {
        ...(filters.search ? { OR: [
          { name: { contains: filters.search } },
          { email: { contains: filters.search } },
        ] } : {}),
        ...(filters.regional ? { regional: { equals: filters.regional } } : {}),
        ...(filters.active !== undefined ? { active: filters.active } : {}),
        ...(filters.role ? { roles: { some: { role: { code: filters.role } } } } : {}),
      },
      include: { roles: { include: { role: true } } },
      orderBy: { name: 'asc' },
    });
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      jobTitle: user.jobTitle,
      regional: user.regional,
      active: user.active,
      lastLoginAt: user.lastLoginAt,
      roles: user.roles.map((entry) => entry.role.code),
    }));
  }

  public async setActive(id: number, active: boolean) {
    return prisma.user.update({ where: { id }, data: { active } });
  }

  public async setRegional(id: number, regional: string | null) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    if (!user) return null;
    if (!regional && user.roles.some((entry) => entry.role.code === 'MANAGER' || entry.role.code === 'VIEWER')) {
      throw forbidden('MANAGER e VIEWER exigem uma regional configurada.');
    }
    return prisma.user.update({ where: { id }, data: { regional } });
  }

  public async setRoles(id: number, roleCodes: string[]) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const roles = await prisma.role.findMany({ where: { code: { in: roleCodes } } });
    if (roles.length !== roleCodes.length) throw forbidden('Um ou mais perfis informados não existem.');
    if (roles.some((role) => role.code === 'MANAGER' || role.code === 'VIEWER') && !user.regional) {
      throw forbidden('MANAGER e VIEWER exigem uma regional configurada antes da atribuição do perfil.');
    }
    await prisma.$transaction([
      prisma.userRole.deleteMany({ where: { userId: id } }),
      prisma.userRole.createMany({ data: roles.map((role) => ({ userId: id, roleId: role.id })) }),
    ]);
    return true;
  }

  public async synchronizeEntraUser(identity: EntraIdentity): Promise<AuthorizationContext> {
    const user = await prisma.user.upsert({
      where: {
        tenantId_entraObjectId: {
          tenantId: identity.tenantId,
          entraObjectId: identity.entraObjectId
        }
      },
      create: {
        entraObjectId: identity.entraObjectId,
        tenantId: identity.tenantId,
        name: identity.name,
        email: identity.email,
        department: identity.department,
        jobTitle: identity.jobTitle,
        lastLoginAt: new Date()
      },
      update: {
        name: identity.name,
        email: identity.email,
        department: identity.department,
        jobTitle: identity.jobTitle,
        lastLoginAt: new Date()
      }
    });

    const defaultRole = await prisma.role.findUnique({ where: { code: 'USER' } });
    if (!defaultRole) {
      throw serviceUnavailable('Perfis de acesso não foram inicializados. Execute o seed de autorização.');
    }

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: defaultRole.id } },
      create: { userId: user.id, roleId: defaultRole.id },
      update: {}
    });

    const synchronizedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: authorizationInclude
    });

    if (!synchronizedUser.active) {
      throw forbidden('Usuário desativado.');
    }

    const roles = synchronizedUser.roles.map((entry) => entry.role);
    const permissions = Array.from(
      new Set(roles.flatMap((role) => role.permissions.map((entry) => entry.permission.code)))
    ) as PermissionCode[];

    return {
      id: synchronizedUser.id,
      entraObjectId: synchronizedUser.entraObjectId,
      tenantId: synchronizedUser.tenantId,
      name: synchronizedUser.name,
      ...(synchronizedUser.email ? { email: synchronizedUser.email } : {}),
      ...(synchronizedUser.regional ? { regional: synchronizedUser.regional } : {}),
      roles: roles.map((role) => role.code),
      permissions,
      dataScope: resolveDataScope(roles)
    };
  }
}
