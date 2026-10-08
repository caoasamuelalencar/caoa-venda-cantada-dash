import prisma from '../lib/prisma';
import { forbidden, serviceUnavailable } from '../errors/AppError';
import { type AuthorizationContext, type EntraIdentity, type PermissionCode } from '../auth/authorization';

const authorizationInclude = {
  roles: {
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } }
        }
      }
    }
  },
  screens: { include: { screen: true } },
} as const;

type AccessManagementFilters = {
  search?: string;
  name?: string;
  email?: string;
  role?: string;
  active?: boolean;
  page: number;
  pageSize: number;
};

function normalizeRoleCodes(roleCodes: string[]) {
  return Array.from(new Set(roleCodes.map((role) => role.trim()).filter(Boolean)));
}

function normalizeScreenCodes(screenCodes: string[]) {
  return Array.from(new Set(screenCodes.map((screen) => screen.trim()).filter(Boolean)));
}

const DEFAULT_USER_ROLE_CODES = ['USER', 'MANAGER', 'VIEWER'] as const;
const DEFAULT_USER_SCREEN_CODES = [
  'SALES_INTENTION',
  'STORE_FLOW',
  'DASHBOARD',
  'REPORT_BRAND',
  'REPORT_SELLER',
  'PROFILE',
] as const;

export class UserRepository {
  public async listAccessManagement(filters: AccessManagementFilters) {
    const where = {
      ...(filters.search ? { OR: [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
      ] } : {}),
      ...(filters.name ? { name: { contains: filters.name } } : {}),
      ...(filters.email ? { email: { contains: filters.email } } : {}),
      ...(filters.active !== undefined ? { active: filters.active } : {}),
      ...(filters.role ? { roles: { some: { role: { code: filters.role } } } } : {}),
    };
    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: { roles: { include: { role: true } }, screens: { include: { screen: true } } },
        orderBy: { name: 'asc' },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
    ]);

    return {
      items: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        jobTitle: user.jobTitle,
        active: user.active,
        lastLoginAt: user.lastLoginAt,
        screens: user.screens.map((entry) => entry.screen.code),
        roles: user.roles.map((entry) => ({
          id: entry.role.id,
          code: entry.role.code,
          name: entry.role.name,
        })),
      })),
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      pageCount: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  public async listRoles() {
    return prisma.role.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  public async listScreens() {
    return prisma.screen.findMany({
      select: { id: true, code: true, name: true, path: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  public async getUserRoles(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        roles: { include: { role: { select: { id: true, code: true, name: true } } } },
        screens: { include: { screen: { select: { id: true, code: true, name: true, path: true } } } },
      },
    });
    if (!user) return null;
    return { ...user, roles: user.roles.map((entry) => entry.role), screens: user.screens.map((entry) => entry.screen) };
  }

  public async getUserScreenCodes(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { screens: { include: { screen: { select: { code: true } } } } },
    });
    return user?.screens.map((entry) => entry.screen.code) ?? null;
  }

  public async setActive(actorId: number, id: number, active: boolean) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    if (!user) return null;

    const isAdmin = user.roles.some((entry) => entry.role.code === 'ADMIN');
    if (!active && isAdmin) {
      if (actorId === id) {
        throw forbidden('Você não pode desativar o seu próprio acesso de administrador.');
      }
      if (user.active) {
        const activeAdminCount = await prisma.user.count({
          where: { active: true, roles: { some: { role: { code: 'ADMIN' } } } },
        });
        if (activeAdminCount <= 1) {
          throw forbidden('Não é possível desativar o último administrador ativo.');
        }
      }
    }
    return prisma.user.update({ where: { id }, data: { active } });
  }

  public async remove(actorId: number, id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    if (!user) return false;
    if (actorId === id) {
      throw forbidden('Você não pode excluir a sua própria conta.');
    }

    const isActiveAdmin = user.active && user.roles.some((entry) => entry.role.code === 'ADMIN');
    if (isActiveAdmin) {
      const activeAdminCount = await prisma.user.count({
        where: { active: true, roles: { some: { role: { code: 'ADMIN' } } } },
      });
      if (activeAdminCount <= 1) {
        throw forbidden('Não é possível excluir o último administrador ativo.');
      }
    }

    await prisma.$transaction(async (tx) => {
      // Preserve historical intentions; their textual owner remains available for auditing.
      await tx.salesIntention.updateMany({ where: { createdByUserId: id }, data: { createdByUserId: null } });
      await tx.user.delete({ where: { id } });
    });
    return true;
  }

  public async setRoles(actorId: number, id: number, roleCodes: string[]) {
    const normalizedRoleCodes = normalizeRoleCodes(roleCodes);
    const user = await prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    if (!user) return null;
    const roles = await prisma.role.findMany({ where: { code: { in: normalizedRoleCodes } } });
    if (!normalizedRoleCodes.length || roles.length !== normalizedRoleCodes.length) {
      throw forbidden('Um ou mais perfis informados não existem.');
    }
    const currentlyAdmin = user.roles.some((entry) => entry.role.code === 'ADMIN');
    const willRemainAdmin = roles.some((role) => role.code === 'ADMIN');
    if (currentlyAdmin && !willRemainAdmin) {
      if (actorId === id) {
        throw forbidden('Você não pode remover o seu próprio acesso de administrador.');
      }
      if (user.active) {
        const activeAdminCount = await prisma.user.count({
          where: { active: true, roles: { some: { role: { code: 'ADMIN' } } } },
        });
        if (activeAdminCount <= 1) {
          throw forbidden('Não é possível remover o último administrador ativo.');
        }
      }
    }

    await prisma.$transaction([
      prisma.userRole.deleteMany({ where: { userId: id } }),
      prisma.userRole.createMany({ data: roles.map((role) => ({ userId: id, roleId: role.id })) }),
    ]);
    return true;
  }

  public async setScreens(actorId: number, id: number, screenCodes: string[]) {
    const normalizedScreenCodes = normalizeScreenCodes(screenCodes);
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, roles: { include: { role: { select: { code: true } } } } },
    });
    if (!user) return null;
    const isAdmin = user.roles.some((entry) => entry.role.code === 'ADMIN');
    if (actorId === id && isAdmin && !normalizedScreenCodes.includes('ACCESS_MANAGEMENT')) {
      throw forbidden('Você não pode remover da sua conta a tela de gestão de acessos.');
    }
    const screens = await prisma.screen.findMany({ where: { code: { in: normalizedScreenCodes } } });
    if (screens.length !== normalizedScreenCodes.length) {
      throw forbidden('Uma ou mais telas informadas não existem.');
    }

    await prisma.$transaction([
      prisma.userScreen.deleteMany({ where: { userId: id } }),
      ...(screens.length ? [prisma.userScreen.createMany({ data: screens.map((screen) => ({ userId: id, screenId: screen.id })) })] : []),
    ]);
    return true;
  }

  public async synchronizeEntraUser(identity: EntraIdentity): Promise<AuthorizationContext> {
    const existingUser = await prisma.user.findUnique({
      where: {
        tenantId_entraObjectId: {
          tenantId: identity.tenantId,
          entraObjectId: identity.entraObjectId,
        },
      },
      select: { id: true },
    });
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

    const defaultRoles = await prisma.role.findMany({
      where: { code: { in: [...DEFAULT_USER_ROLE_CODES] } },
      select: { id: true, code: true },
    });
    if (defaultRoles.length !== DEFAULT_USER_ROLE_CODES.length) {
      throw serviceUnavailable('Perfis de acesso não foram inicializados. Execute o seed de autorização.');
    }

    await Promise.all(defaultRoles.map((role) => prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      create: { userId: user.id, roleId: role.id },
      update: {},
    })));

    if (!existingUser) {
      const defaultScreens = await prisma.screen.findMany({
        where: { code: { in: [...DEFAULT_USER_SCREEN_CODES] } },
        select: { id: true, code: true },
      });
      if (defaultScreens.length !== DEFAULT_USER_SCREEN_CODES.length) {
        throw serviceUnavailable('Telas de acesso não foram inicializadas. Execute o seed de autorização.');
      }

      await Promise.all(defaultScreens.map((screen) => prisma.userScreen.upsert({
        where: { userId_screenId: { userId: user.id, screenId: screen.id } },
        create: { userId: user.id, screenId: screen.id },
        update: {},
      })));
    }

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
      roles: roles.map((role) => role.code),
      permissions,
    };
  }
}
