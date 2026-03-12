export type UserRole = "CUSTOMER" | "DEALER" | "ADMIN";
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
