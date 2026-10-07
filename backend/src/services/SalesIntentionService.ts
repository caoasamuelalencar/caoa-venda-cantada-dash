import { SalesIntentionPayload } from '../entities/SalesIntention';
import {
  SalesIntentionRepository,
  type SalesIntentionSearchFilters
} from '../repositories/SalesIntentionRepository';
import { isPrismaErrorCode } from '../utils/prismaResilience';

export class SalesIntentionService {
  private repository = new SalesIntentionRepository();

  public async listAll(
    dateRange: { gte: Date; lt: Date } | undefined,
    tipoVenda: string | string[] | undefined,
  ) {
    return this.repository.findAll(dateRange, tipoVenda, {});
  }

  public async search(filters: SalesIntentionSearchFilters) {
    return this.repository.search(filters);
  }

  public async getById(id: number) {
    return this.repository.findById(id);
  }

  public async create(payload: SalesIntentionPayload, createdByUserId: number) {
    return this.repository.create(payload, createdByUserId);
  }

  public async update(id: number, payload: Partial<SalesIntentionPayload>) {
    const current = await this.getById(id);
    if (!current) return null;
    try {
      return await this.repository.update(id, payload);
    } catch (error) {
      if (isPrismaErrorCode(error, 'P2025')) {
        return null;
      }

      throw error;
    }
  }

  public async remove(id: number) {
    const current = await this.getById(id);
    if (!current) return false;
    try {
      await this.repository.delete(id);
      return true;
    } catch (error) {
      if (isPrismaErrorCode(error, 'P2025')) {
        return false;
      }

      throw error;
    }
  }
}
