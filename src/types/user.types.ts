import type { UserRole } from "../constants/roles";

export type UserStatus = "active" | "suspended" | "pending";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
}

export interface TokenPayload {
  sub: string;
  email?: string;
  name?: string;
  role?: UserRole;
  exp?: number;
}
