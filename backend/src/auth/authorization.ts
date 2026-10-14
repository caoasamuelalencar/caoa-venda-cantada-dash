export const PERMISSIONS = {
  INTENTION_CREATE: 'INTENTION_CREATE',
  INTENTION_VIEW: 'INTENTION_VIEW',
  INTENTION_UPDATE: 'INTENTION_UPDATE',
  INTENTION_DELETE: 'INTENTION_DELETE',
  STORE_FLOW_CREATE: 'STORE_FLOW_CREATE',
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
  roles: string[];
  permissions: PermissionCode[];
};

export type EntraIdentity = {
  entraObjectId: string;
  tenantId: string;
  name: string;
  email?: string;
  department?: string;
  jobTitle?: string;
};
