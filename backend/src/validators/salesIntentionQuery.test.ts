import { describe, expect, it } from 'vitest';
import {
  hasAdvancedSalesIntentionSearchFilters,
  parseSalesIntentionId,
  parseSalesIntentionListQuery,
  parseSalesIntentionSearchQuery
} from './salesIntentionQuery';

describe('sales intention query validation', () => {
  it('normalizes list filters and keeps the end date inclusive for callers', () => {
    const result = parseSalesIntentionListQuery({
      startDate: '2026-02-01', endDate: '2026-02-28', tipoVenda: ['novos', 'seminovos']
    });

    expect(result).toEqual({
      dateRange: { gte: new Date(2026, 1, 1), lt: new Date(2026, 2, 1) },
      tipoVenda: ['NOVOS', 'SEMINOVOS']
    });
  });

  it('normalizes repeated search fields and preserves multiple selected values', () => {
    expect(parseSalesIntentionSearchQuery({
      proprietario: [' Ana ', 'Ana', 'Bruno '], quantidade: '2', ano_modelo: '2026'
    })).toEqual({ proprietario: ['Ana', 'Bruno'], quantidade: 2, ano_modelo: 2026 });
  });

  it('rejects malformed filters and invalid IDs', () => {
    expect(() => parseSalesIntentionListQuery({ startDate: '2026-02-30', endDate: '2026-03-01' }))
      .toThrow('Informe startDate válido');
    expect(() => parseSalesIntentionSearchQuery({ quantidade: '0' })).toThrow('inteiro positivo');
    expect(parseSalesIntentionId('0')).toBeNull();
    expect(parseSalesIntentionId('12')).toBe(12);
  });

  it('only routes to advanced search when an advanced filter has a value', () => {
    expect(hasAdvancedSalesIntentionSearchFilters({ bandeira: 'CAOA CHERY' })).toBe(true);
    expect(hasAdvancedSalesIntentionSearchFilters({ bandeira: '  ' })).toBe(false);
  });
});
