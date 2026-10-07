import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
      findUniqueOrThrow: vi.fn(),
    },
    salesIntention: { updateMany: vi.fn() },
    role: { findMany: vi.fn() },
    userRole: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../lib/prisma', () => ({ default: prismaMock }));

import { UserRepository } from './UserRepository';

const administrator = {
  id: 2,
  active: true,
  regional: null,
  roles: [{ role: { code: 'ADMIN' } }],
};

describe('UserRepository access-management safeguards', () => {
  const repository = new UserRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('impede que o administrador remova o próprio perfil ADMIN', async () => {
    prismaMock.user.findUnique.mockResolvedValue(administrator);
    prismaMock.role.findMany.mockResolvedValue([{ id: 1, code: 'USER' }]);

    await expect(repository.setRoles(2, 2, ['USER']))
      .rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining('próprio acesso') });
    expect(prismaMock.userRole.deleteMany).not.toHaveBeenCalled();
  });

  it('impede a remoção do último administrador ativo', async () => {
    prismaMock.user.findUnique.mockResolvedValue(administrator);
    prismaMock.role.findMany.mockResolvedValue([{ id: 1, code: 'USER' }]);
    prismaMock.user.count.mockResolvedValue(1);

    await expect(repository.setRoles(7, 2, ['USER']))
      .rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining('último administrador') });
    expect(prismaMock.userRole.deleteMany).not.toHaveBeenCalled();
  });

  it('impede a desativação do último administrador ativo', async () => {
    prismaMock.user.findUnique.mockResolvedValue(administrator);
    prismaMock.user.count.mockResolvedValue(1);

    await expect(repository.setActive(7, 2, false))
      .rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining('último administrador') });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('não permite excluir a própria conta', async () => {
    prismaMock.user.findUnique.mockResolvedValue(administrator);

    await expect(repository.remove(2, 2))
      .rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining('própria conta') });
  });

  it('remove o usuário e preserva as intenções históricas', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...administrator, id: 4, roles: [] });
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => Promise<void>) => callback(prismaMock));

    await expect(repository.remove(2, 4)).resolves.toBe(true);

    expect(prismaMock.salesIntention.updateMany).toHaveBeenCalledWith({
      where: { createdByUserId: 4 }, data: { createdByUserId: null },
    });
    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: 4 } });
  });

  it('atribui USER, MANAGER e VIEWER ao sincronizar um usuário, sem atribuir ADMIN', async () => {
    prismaMock.user.upsert.mockResolvedValue({ id: 9 });
    prismaMock.role.findMany.mockResolvedValue([
      { id: 1, code: 'USER' },
      { id: 2, code: 'MANAGER' },
      { id: 3, code: 'VIEWER' },
    ]);
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      id: 9,
      entraObjectId: 'entra-id',
      tenantId: 'tenant-id',
      name: 'Pessoa Teste',
      email: 'pessoa@teste.com',
      active: true,
      regional: null,
      regionalAssignments: [],
      roles: [],
    });

    await repository.synchronizeEntraUser({
      entraObjectId: 'entra-id',
      tenantId: 'tenant-id',
      name: 'Pessoa Teste',
    });

    expect(prismaMock.userRole.upsert).toHaveBeenCalledTimes(3);
    expect(prismaMock.userRole.upsert.mock.calls.map(([input]) => input.create).sort((left, right) => left.roleId - right.roleId))
      .toEqual([
        { userId: 9, roleId: 1 },
        { userId: 9, roleId: 2 },
        { userId: 9, roleId: 3 },
      ]);
  });
});
