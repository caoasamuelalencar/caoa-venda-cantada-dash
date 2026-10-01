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

    const regionals = this.requireRegionals(context);
    return { ...filters, regional: regionals.length === 1 ? regionals[0] : regionals };
  }

  public canAccessSalesIntention(
    context: AuthorizationContext,
    record: { createdByUserId: number | null; regional: string | null },
  ) {
    if (context.dataScope === DATA_SCOPES.ALL) return true;
    if (context.dataScope === DATA_SCOPES.OWN) return record.createdByUserId === context.id;
    const recordRegional = this.normalize(record.regional);
    return this.requireRegionals(context).some((regional) => this.normalize(regional) === recordRegional);
  }

  public assertCanWriteRegional(context: AuthorizationContext, regional: string) {
    if (context.dataScope !== DATA_SCOPES.REGIONAL) return;
    const normalizedRegional = this.normalize(regional);
    if (!this.requireRegionals(context).some((assigned) => this.normalize(assigned) === normalizedRegional)) {
      throw forbidden('A regional informada não pertence ao seu escopo de acesso.');
    }
  }

  private requireRegionals(context: AuthorizationContext) {
    const regionals = Array.from(new Set([
      ...(context.regionals ?? []),
      ...(context.regional ? [context.regional] : []),
    ].map((regional) => regional.trim()).filter(Boolean)));
    if (!regionals.length) {
      throw forbidden('Usuário sem regional configurada. Entre em contato com o administrador.');
    }
    return regionals;
  }

  private normalize(value: string | null | undefined) {
    return value?.trim().replace(/\s+/g, ' ').toLocaleUpperCase('pt-BR') ?? '';
  }
}
