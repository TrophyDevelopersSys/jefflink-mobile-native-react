import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Accepted role names matching the database `roles.role` column values.
 *
 * Hierarchy (highest → lowest platform authority):
 *   SUPER_ADMIN > ADMIN / SYSTEM_ADMIN / DIRECTOR
 *   FINANCE_ADMIN / FINANCE_OFFICER > AUDITOR
 *   MODERATOR > SUPPORT
 *   MANAGER > BRANCH_OFFICER > FIELD_OFFICER / RECOVERY_AGENT / LEGAL
 *   VENDOR > AGENT
 *   CUSTOMER
 */
export type AppRole =
  // ── Platform governance ───────────────────────────────────────────────────
  | 'SUPER_ADMIN'     // Full system access — no restrictions
  | 'ADMIN'           // Manage users, vendors, listings
  | 'SYSTEM_ADMIN'    // Alias kept for backward compatibility
  | 'DIRECTOR'        // Executive oversight
  | 'MANAGER'         // Branch / team management
  // ── Finance & compliance ──────────────────────────────────────────────────
  | 'FINANCE_ADMIN'   // Contracts, deposits, installments, withdrawals
  | 'FINANCE_OFFICER' // Day-to-day finance operations
  | 'AUDITOR'         // Read-only financial inspection
  // ── Moderation & support ─────────────────────────────────────────────────
  | 'MODERATOR'       // Listing approval, flagged content, reports
  | 'SUPPORT'         // Customer support tooling
  | 'LEGAL'           // Legal document review
  // ── Field operations ─────────────────────────────────────────────────────
  | 'BRANCH_OFFICER'
  | 'FIELD_OFFICER'
  | 'RECOVERY_AGENT'
  // ── Market participants ───────────────────────────────────────────────────
  | 'VENDOR'
  | 'DEALER'          // Backward-compatible alias for vendor/dealer accounts
  | 'AGENT'
  | 'CUSTOMER';

/** All roles that grant access to the /admin namespace */
export const ADMIN_ROLES: AppRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'SYSTEM_ADMIN',
  'DIRECTOR',
  'MANAGER',
  'FINANCE_ADMIN',
  'FINANCE_OFFICER',
  'AUDITOR',
  'MODERATOR',
  'SUPPORT',
  'LEGAL',
];

export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
