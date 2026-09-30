import { SalesIntentionPayload } from '../entities/SalesIntention';
import {
  SalesIntentionRepository,
  type SalesIntentionSearchFilters
} from '../repositories/SalesIntentionRepository';
import { isPrismaErrorCode } from '../utils/prismaResilience';
import { forbidden } from '../errors/AppError';
import { DataScopeService } from '../auth/DataScopeService';
import type { AuthorizationContext } from '../auth/authorization';

export class SalesIntentionService {
  private repository = new SalesIntentionRepository();
  private dataScope = new DataScopeService();

  public async listAll(
    dateRange: { gte: Date; lt: Date } | undefined,
    tipoVenda: string | string[] | undefined,
    context: AuthorizationContext,
  ) {
    return this.repository.findAll(
      dateRange,
      tipoVenda,
      this.dataScope.applySalesIntentionScope(context, {}),
    );
  }

  public async search(filters: SalesIntentionSearchFilters, context: AuthorizationContext) {
    return this.repository.search(this.dataScope.applySalesIntentionScope(context, filters));
  }

  public async getById(id: number, context: AuthorizationContext) {
    const record = await this.repository.findById(id);
    if (record && !this.dataScope.canAccessSalesIntention(context, record)) {
      throw forbidden('Você não possui acesso a esta intenção de venda.');
    }
    return record;
  }

  public async create(payload: SalesIntentionPayload, context: AuthorizationContext) {
    this.dataScope.assertCanWriteRegional(context, payload.regional);
    return this.repository.create(payload, context.id);
  }

  public async update(id: number, payload: Partial<SalesIntentionPayload>, context: AuthorizationContext) {
    const current = await this.getById(id, context);
    if (!current) return null;
    if (payload.regional) this.dataScope.assertCanWriteRegional(context, payload.regional);
    try {
      return await this.repository.update(id, payload);
    } catch (error) {
      if (isPrismaErrorCode(error, 'P2025')) {
        return null;
      }

      throw error;
    }
  }

  public async remove(id: number, context: AuthorizationContext) {
    const current = await this.getById(id, context);
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
