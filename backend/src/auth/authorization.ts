export const DATA_SCOPES = {
  OWN: 'OWN',
  REGIONAL: 'REGIONAL',
  ALL: 'ALL'
} as const;

export type DataScope = (typeof DATA_SCOPES)[keyof typeof DATA_SCOPES];

export const PERMISSIONS = {
  INTENTION_CREATE: 'INTENTION_CREATE',
  INTENTION_VIEW: 'INTENTION_VIEW',
  INTENTION_UPDATE: 'INTENTION_UPDATE',
  INTENTION_DELETE: 'INTENTION_DELETE',
  REPORT_VIEW: 'REPORT_VIEW',
  REPORT_EXPORT: 'REPORT_EXPORT',
  USER_VIEW: 'USER_VIEW',
  USER_MANAGE: 'USER_MANAGE',
  ROLE_VIEW: 'ROLE_VIEW',
  ROLE_MANAGE: 'ROLE_MANAGE'
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type AuthorizationContext = {
  id: number;
  entraObjectId: string;
  tenantId: string;
  name: string;
  email?: string;
  regional?: string;
  roles: string[];
  permissions: PermissionCode[];
  dataScope: DataScope;
};

export type EntraIdentity = {
  entraObjectId: string;
  tenantId: string;
  name: string;
  email?: string;
  department?: string;
  jobTitle?: string;
};

export function resolveDataScope(roles: Array<{ code: string; dataScope: string }>): DataScope {
  const roleCodes = new Set(roles.map((role) => role.code));
  if (roleCodes.has('ADMIN')) return DATA_SCOPES.ALL;
  if (roleCodes.has('MANAGER') || roleCodes.has('VIEWER')) return DATA_SCOPES.REGIONAL;
  return DATA_SCOPES.OWN;
}
