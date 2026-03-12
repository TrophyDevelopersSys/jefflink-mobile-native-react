export const Roles = {
  Admin: "ADMIN",
  Manager: "MANAGER",
  Customer: "CUSTOMER",
  Agent: "AGENT"
} as const;

export type UserRole = (typeof Roles)[keyof typeof Roles];

export const AdminRoles: UserRole[] = [Roles.Admin, Roles.Manager];
