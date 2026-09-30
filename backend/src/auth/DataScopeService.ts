import { forbidden } from '../errors/AppError';
import type { SalesIntentionSearchFilters } from '../repositories/SalesIntentionRepository';
import { DATA_SCOPES, type AuthorizationContext } from './authorization';

export class DataScopeService {
  public applySalesIntentionScope(
    context: AuthorizationContext,
    filters: SalesIntentionSearchFilters,
  ): SalesIntentionSearchFilters {
    if (context.dataScope === DATA_SCOPES.ALL) return filters;

    if (context.dataScope === DATA_SCOPES.OWN) {
      return { ...filters, createdByUserId: context.id };
    }

    const regional = this.requireRegional(context);
    return { ...filters, regional };
  }

  public canAccessSalesIntention(
    context: AuthorizationContext,
    record: { createdByUserId: number | null; regional: string | null },
  ) {
    if (context.dataScope === DATA_SCOPES.ALL) return true;
    if (context.dataScope === DATA_SCOPES.OWN) return record.createdByUserId === context.id;
    return this.normalize(record.regional) === this.normalize(this.requireRegional(context));
  }

  public assertCanWriteRegional(context: AuthorizationContext, regional: string) {
    if (context.dataScope !== DATA_SCOPES.REGIONAL) return;
    if (this.normalize(regional) !== this.normalize(this.requireRegional(context))) {
      throw forbidden('A regional informada não pertence ao seu escopo de acesso.');
    }
  }

  private requireRegional(context: AuthorizationContext) {
    const regional = context.regional?.trim();
    if (!regional) {
      throw forbidden('Usuário sem regional configurada. Entre em contato com o administrador.');
    }
    return regional;
  }

  private normalize(value: string | null | undefined) {
    return value?.trim().replace(/\s+/g, ' ').toLocaleUpperCase('pt-BR') ?? '';
  }
}
