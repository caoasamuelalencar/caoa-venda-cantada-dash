import { beforeEach, describe, expect, it, vi } from 'vitest';

const { repositoryMock } = vi.hoisted(() => ({
  repositoryMock: {
    findAll: vi.fn(),
    search: vi.fn(),
    findLatestRequestDate: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../repositories/SalesIntentionRepository', () => ({
  SalesIntentionRepository: class {
    findAll = repositoryMock.findAll;
    search = repositoryMock.search;
    findLatestRequestDate = repositoryMock.findLatestRequestDate;
    findById = repositoryMock.findById;
    create = repositoryMock.create;
    update = repositoryMock.update;
    delete = repositoryMock.delete;
  },
}));

import { SalesIntentionService } from './SalesIntentionService';

describe('SalesIntentionService', () => {
  const service = new SalesIntentionService();

  beforeEach(() => vi.clearAllMocks());

  it('preserva o filtro de regional informado, sem aplicar escopo de autorização', async () => {
    const filters = { regional: 'SUDESTE' };
    repositoryMock.search.mockResolvedValue([]);

    await service.search(filters);

    expect(repositoryMock.search).toHaveBeenCalledWith(filters);
  });

  it('permite consultar um registro independentemente da regional do usuário', async () => {
    repositoryMock.findById.mockResolvedValue({ id: 12, regional: 'SUL' });

    await expect(service.getById(12)).resolves.toEqual({ id: 12, regional: 'SUL' });
    expect(repositoryMock.findById).toHaveBeenCalledWith(12);
  });

  it('consulta somente a data mais recente para o fallback do relatório', async () => {
    repositoryMock.findLatestRequestDate.mockResolvedValue({ dataSolicitacao: new Date('2026-10-11') });

    await expect(service.getLatestRequestDate()).resolves.toEqual({ dataSolicitacao: new Date('2026-10-11') });
    expect(repositoryMock.findLatestRequestDate).toHaveBeenCalledTimes(1);
  });
});
