import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Accepted role names matching the database role column values */
export type AppRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'SYSTEM_ADMIN'
  | 'DIRECTOR'
  | 'FINANCE_OFFICER'
  | 'RECOVERY_AGENT'
  | 'BRANCH_OFFICER'
  | 'VENDOR'
  | 'AGENT'
  | 'CUSTOMER'
  | 'SUPPORT'
  | 'FIELD_OFFICER'
  | 'AUDITOR'
  | 'LEGAL';

export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
