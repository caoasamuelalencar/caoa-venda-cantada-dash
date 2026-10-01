import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    role: { findMany: vi.fn() },
    userRole: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
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
});
