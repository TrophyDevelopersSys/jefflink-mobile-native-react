export const Roles = {
  SuperAdmin: "SUPER_ADMIN",
  Admin: "ADMIN",
  SystemAdmin: "SYSTEM_ADMIN",
  Director: "DIRECTOR",
  Manager: "MANAGER",
  FinanceAdmin: "FINANCE_ADMIN",
  FinanceOfficer: "FINANCE_OFFICER",
  Auditor: "AUDITOR",
  Moderator: "MODERATOR",
  Support: "SUPPORT",
  Legal: "LEGAL",
  BranchOfficer: "BRANCH_OFFICER",
  FieldOfficer: "FIELD_OFFICER",
  RecoveryAgent: "RECOVERY_AGENT",
  Vendor: "VENDOR",
  Dealer: "DEALER",
  Customer: "CUSTOMER",
  Agent: "AGENT",
} as const;

export type UserRole = (typeof Roles)[keyof typeof Roles];

export const AdminRoles: UserRole[] = [
  Roles.SuperAdmin,
  Roles.Admin,
  Roles.SystemAdmin,
  Roles.Director,
  Roles.Manager,
  Roles.FinanceAdmin,
  Roles.FinanceOfficer,
  Roles.Auditor,
  Roles.Moderator,
  Roles.Support,
  Roles.Legal,
];

export const DealerRoles: UserRole[] = [
  Roles.Vendor,
  Roles.Dealer,
  Roles.Agent,
];
