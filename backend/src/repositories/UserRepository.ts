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
  },
  regionalAssignments: { select: { regional: true } }
} as const;

type AccessManagementFilters = {
  search?: string;
  name?: string;
  email?: string;
  role?: string;
  regional?: string;
  active?: boolean;
  page: number;
  pageSize: number;
};

function normalizeRoleCodes(roleCodes: string[]) {
  return Array.from(new Set(roleCodes.map((role) => role.trim()).filter(Boolean)));
}

type RegionalViewRow = { regional: string | null };

function normalizeRegional(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeRegionalCodes(regionals: string[]) {
  const values = new Map<string, string>();
  for (const value of regionals) {
    const regional = normalizeRegional(value);
    if (regional) values.set(regional.toLocaleUpperCase('pt-BR'), regional);
  }
  return [...values.values()].sort((left, right) => left.localeCompare(right, 'pt-BR', { sensitivity: 'base' }));
}

function getRegionalGroups(regionals: string[]) {
  const groupCodes = ['A', 'CY', 'F', 'HY', 'S'] as const;
  return groupCodes.map((code) => ({
    code,
    regionals: regionals.filter((regional) => {
      const normalized = regional.toLocaleUpperCase('pt-BR');
      return normalized !== 'A DEFINIR' && normalized.startsWith(code);
    }),
  })).filter((group) => group.regionals.length > 0);
}

export class UserRepository {
  public async listAccessManagement(filters: AccessManagementFilters) {
    const where = {
      ...(filters.search ? { OR: [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
      ] } : {}),
      ...(filters.name ? { name: { contains: filters.name } } : {}),
      ...(filters.email ? { email: { contains: filters.email } } : {}),
      ...(filters.regional ? { regionalAssignments: { some: { regional: { equals: filters.regional } } } } : {}),
      ...(filters.active !== undefined ? { active: filters.active } : {}),
      ...(filters.role ? { roles: { some: { role: { code: filters.role } } } } : {}),
    };
    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: { roles: { include: { role: true } }, regionalAssignments: { select: { regional: true } } },
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
        regional: user.regionalAssignments[0]?.regional ?? user.regional,
        regionals: user.regionalAssignments.map((assignment) => assignment.regional),
        active: user.active,
        lastLoginAt: user.lastLoginAt,
        roles: user.roles.map((entry) => ({
          id: entry.role.id,
          code: entry.role.code,
          name: entry.role.name,
          dataScope: entry.role.dataScope,
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
      select: { id: true, code: true, name: true, dataScope: true },
      orderBy: { name: 'asc' },
    });
  }

  public async listRegionals() {
    const rows = await prisma.$queryRaw<RegionalViewRow[]>`
      SELECT DISTINCT LTRIM(RTRIM([Regional_Vendas])) AS [regional]
      FROM [dbo].[VW_IntencaoVendas_Empresa]
      WHERE [Regional_Vendas] IS NOT NULL
        AND LTRIM(RTRIM([Regional_Vendas])) <> ''
      ORDER BY [regional]
    `;

    const regionals = new Map<string, string>();
    for (const row of rows) {
      if (!row.regional) continue;
      const regional = normalizeRegional(row.regional);
      if (regional) regionals.set(regional.toLocaleUpperCase('pt-BR'), regional);
    }

    const options = [...regionals.values()].sort((left, right) =>
      left.localeCompare(right, 'pt-BR', { sensitivity: 'base' }),
    );
    return { regionals: options, groups: getRegionalGroups(options) };
  }

  public async getUserRoles(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        roles: { include: { role: { select: { id: true, code: true, name: true, dataScope: true } } } },
        regionalAssignments: { select: { regional: true } },
      },
    });
    if (!user) return null;
    return { ...user, roles: user.roles.map((entry) => entry.role), regionals: user.regionalAssignments.map((assignment) => assignment.regional) };
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

  public async setRegional(id: number, regional: string | null) {
    return this.setRegionals(id, regional ? [regional] : []);
  }

  public async setRegionals(id: number, regionalCodes: string[]) {
    const regionals = normalizeRegionalCodes(regionalCodes);
    const user = await prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } }, regionalAssignments: true },
    });
    if (!user) return null;
    if (!regionals.length && user.roles.some((entry) => entry.role.code === 'MANAGER' || entry.role.code === 'VIEWER')) {
      throw forbidden('MANAGER e VIEWER exigem uma regional configurada.');
    }
    const [updated] = await prisma.$transaction([
      prisma.user.update({ where: { id }, data: { regional: regionals[0] ?? null } }),
      prisma.userRegional.deleteMany({ where: { userId: id } }),
      ...(regionals.length ? [prisma.userRegional.createMany({ data: regionals.map((regional) => ({ userId: id, regional })) })] : []),
    ]);
    return { ...updated, regionals };
  }

  public async setRoles(actorId: number, id: number, roleCodes: string[]) {
    const normalizedRoleCodes = normalizeRoleCodes(roleCodes);
    const user = await prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } }, regionalAssignments: true },
    });
    if (!user) return null;
    const roles = await prisma.role.findMany({ where: { code: { in: normalizedRoleCodes } } });
    if (!normalizedRoleCodes.length || roles.length !== normalizedRoleCodes.length) {
      throw forbidden('Um ou mais perfis informados não existem.');
    }
    if (roles.some((role) => role.code === 'MANAGER' || role.code === 'VIEWER') && !user.regionalAssignments.length && !user.regional) {
      throw forbidden('MANAGER e VIEWER exigem uma regional configurada antes da atribuição do perfil.');
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
      regionals: synchronizedUser.regionalAssignments.map((assignment) => assignment.regional),
      roles: roles.map((role) => role.code),
      permissions,
      dataScope: resolveDataScope(roles)
    };
  }
}
