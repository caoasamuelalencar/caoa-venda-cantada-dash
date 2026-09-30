import { describe, expect, it } from 'vitest';
import { DataScopeService } from './DataScopeService';
import { DATA_SCOPES, type AuthorizationContext } from './authorization';

const manager: AuthorizationContext = {
  id: 10,
  entraObjectId: 'manager-oid',
  tenantId: 'tenant-id',
  name: 'Gestora Sul',
  regional: 'SUL',
  roles: ['MANAGER'],
  permissions: ['INTENTION_VIEW'],
  dataScope: DATA_SCOPES.REGIONAL,
};

describe('DataScopeService', () => {
  const service = new DataScopeService();

  it('impõe a regional do manager e ignora a regional manipulada na query', () => {
    expect(service.applySalesIntentionScope(manager, { regional: 'SUDESTE' }))
      .toEqual({ regional: 'SUL' });
  });

  it('permite apenas registros da regional do manager', () => {
    expect(service.canAccessSalesIntention(manager, { regional: 'SUL', createdByUserId: null })).toBe(true);
    expect(service.canAccessSalesIntention(manager, { regional: 'SUDESTE', createdByUserId: null })).toBe(false);
  });

  it('restringe USER aos registros que criou', () => {
    const user: AuthorizationContext = { ...manager, id: 20, roles: ['USER'], dataScope: DATA_SCOPES.OWN };
    expect(service.canAccessSalesIntention(user, { regional: 'SUL', createdByUserId: 20 })).toBe(true);
    expect(service.canAccessSalesIntention(user, { regional: 'SUL', createdByUserId: 21 })).toBe(false);
  });

  it('bloqueia manager sem regional configurada', () => {
    const unconfiguredManager = { ...manager, regional: undefined };
    expect(() => service.applySalesIntentionScope(unconfiguredManager, {}))
      .toThrow('Usuário sem regional configurada');
  });
});
