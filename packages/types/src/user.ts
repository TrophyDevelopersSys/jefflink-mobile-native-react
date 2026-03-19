export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "SYSTEM_ADMIN"
  | "DIRECTOR"
  | "MANAGER"
  | "FINANCE_ADMIN"
  | "FINANCE_OFFICER"
  | "AUDITOR"
  | "MODERATOR"
  | "SUPPORT"
  | "LEGAL"
  | "BRANCH_OFFICER"
  | "FIELD_OFFICER"
  | "RECOVERY_AGENT"
  | "VENDOR"
  | "DEALER"
  | "AGENT"
  | "CUSTOMER";
export type UserStatus = "active" | "suspended" | "pending";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
}

export interface TokenPayload {
  sub: string;
  email?: string;
  name?: string;
  role?: UserRole;
  exp?: number;
}
